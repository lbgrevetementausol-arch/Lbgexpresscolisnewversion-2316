import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { defaultPricingSettings, invalidatePricingConfig } from "../lib/settings";
import { mailTrackingUpdate } from "../services/email";
import { adminOnly, authed } from "../middleware/auth";

async function log(
  user: { id: string; email: string },
  action: string,
  target?: string | null,
  detail?: string | null,
) {
  await db.insert(schema.auditLog).values({
    userId: user.id,
    userEmail: user.email,
    action,
    target: target ?? null,
    detail: detail ?? null,
  });
}

export const admin = {
  /** Profil de la session courante (rôle, statut, changement de mot de passe requis). */
  me: authed.handler(({ context }) => ({
    id: context.user.id,
    email: context.user.email,
    name: context.user.name,
    role: context.user.role ?? "client",
    accountStatus: context.user.accountStatus ?? "actif",
    phone: context.user.phone ?? null,
    company: context.user.company ?? null,
    mustChangePassword: context.user.mustChangePassword ?? false,
  })),

  /** Jeton interne du dashboard pro : la sécurité réelle est la session admin. */
  proToken: adminOnly.handler(() => ({ code: process.env.PRO_ACCESS_CODE ?? "" })),

  /** KPI temps réel du back-office. */
  stats: adminOnly.handler(async () => {
    const [quotes, trackings, invoiceRows, contacts, applications, users, leads] = await Promise.all([
      db.select().from(schema.quotes),
      db.select().from(schema.trackings),
      db.select().from(schema.invoices),
      db.select().from(schema.contacts),
      db.select().from(schema.carrierApplications),
      db.select().from(schema.user),
      db.select().from(schema.chatLeads),
    ]);

    const paidCents = invoiceRows.filter((i) => i.status === "payee").reduce((s, i) => s + i.totalCents, 0);
    const pendingCents = invoiceRows
      .filter((i) => i.status === "en_attente_paiement")
      .reduce((s, i) => s + i.totalCents, 0);

    const byStatus = trackings.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});

    const series = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(Date.now() - (13 - i) * 86400000);
      const key = day.toISOString().slice(0, 10);
      return {
        date: key,
        count: quotes.filter((q) => q.createdAt.toISOString().slice(0, 10) === key).length,
      };
    });

    return {
      quotes: quotes.length,
      pendingOrders: quotes.filter((q) => q.status === "nouveau" || q.status === "a_valider").length,
      trackings: trackings.length,
      inTransit: (byStatus.en_transit ?? 0) + (byStatus.en_livraison ?? 0),
      delivered: byStatus.livre ?? 0,
      invoices: invoiceRows.length,
      paid: paidCents / 100,
      pending: pendingCents / 100,
      users: users.length,
      pendingUsers: users.filter((u) => (u.accountStatus ?? "actif") === "en_attente").length,
      contacts: contacts.filter((c) => !c.handled).length,
      applications: applications.filter((a) => a.status === "nouveau").length,
      leads: leads.filter((l) => !l.handled).length,
      byStatus,
      series,
    };
  }),

  /* ---------------- Commandes ---------------- */

  /** Commandes à traiter / historique (polling temps réel côté front). */
  orders: adminOnly
    .input(
      z.object({
        status: z
          .enum(["tous", "nouveau", "a_valider", "accepte", "refuse", "paye", "en_cours", "livre", "annule"])
          .default("tous"),
        limit: z.number().min(1).max(300).default(150),
      }),
    )
    .handler(async ({ input }) => {
      const rows =
        input.status === "tous"
          ? await db.select().from(schema.quotes).orderBy(desc(schema.quotes.createdAt)).limit(input.limit)
          : await db
              .select()
              .from(schema.quotes)
              .where(eq(schema.quotes.status, input.status))
              .orderBy(desc(schema.quotes.createdAt))
              .limit(input.limit);
      return rows;
    }),

  /** Accepter ou refuser une commande en temps réel. */
  decideOrder: adminOnly
    .input(
      z.object({
        ref: z.string().min(3).max(40),
        decision: z.enum(["accepte", "refuse"]),
        reason: z.string().max(500).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const [quote] = await db.select().from(schema.quotes).where(eq(schema.quotes.ref, input.ref)).limit(1);
      if (!quote) throw new ORPCError("NOT_FOUND", { message: "Commande introuvable" });

      await db
        .update(schema.quotes)
        .set({
          status: input.decision,
          decision: input.decision,
          decisionReason: input.reason ?? null,
          decidedAt: new Date(),
        })
        .where(eq(schema.quotes.id, quote.id));

      await log(context.user, `order.${input.decision}`, quote.ref, input.reason ?? null);
      return { ok: true };
    }),

  /** Changement libre de statut d'une commande. */
  setOrderStatus: adminOnly
    .input(
      z.object({
        ref: z.string().min(3).max(40),
        status: z.enum(["nouveau", "a_valider", "accepte", "refuse", "paye", "en_cours", "livre", "annule"]),
      }),
    )
    .handler(async ({ input, context }) => {
      await db.update(schema.quotes).set({ status: input.status }).where(eq(schema.quotes.ref, input.ref));
      await log(context.user, `order.status.${input.status}`, input.ref);
      return { ok: true };
    }),

  /* ---------------- Utilisateurs ---------------- */

  users: adminOnly.handler(async () => {
    const rows = await db.select().from(schema.user).orderBy(desc(schema.user.createdAt));
    return rows.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role ?? "client",
      accountStatus: u.accountStatus ?? "actif",
      phone: u.phone ?? null,
      company: u.company ?? null,
      emailVerified: u.emailVerified,
      createdAt: u.createdAt,
    }));
  }),

  /** Valider, bloquer ou débloquer une inscription. */
  setUserStatus: adminOnly
    .input(
      z.object({
        userId: z.string().min(1),
        accountStatus: z.enum(["en_attente", "actif", "bloque"]),
      }),
    )
    .handler(async ({ input, context }) => {
      if (input.userId === context.user.id) {
        throw new ORPCError("BAD_REQUEST", { message: "Impossible de modifier son propre compte" });
      }
      await db
        .update(schema.user)
        .set({ accountStatus: input.accountStatus })
        .where(eq(schema.user.id, input.userId));
      await log(context.user, `user.status.${input.accountStatus}`, input.userId);
      return { ok: true };
    }),

  /** Promotion / rétrogradation d'un compte. */
  setUserRole: adminOnly
    .input(z.object({ userId: z.string().min(1), role: z.enum(["admin", "client"]) }))
    .handler(async ({ input, context }) => {
      if (input.userId === context.user.id) {
        throw new ORPCError("BAD_REQUEST", { message: "Impossible de modifier son propre rôle" });
      }
      await db.update(schema.user).set({ role: input.role }).where(eq(schema.user.id, input.userId));
      await log(context.user, `user.role.${input.role}`, input.userId);
      return { ok: true };
    }),

  /* ---------------- Réglages du site ---------------- */

  settings: adminOnly.handler(async () => {
    const rows = await db.select().from(schema.siteSettings);
    const existing = new Set(rows.map((r) => r.key));
    // Les variables tarifaires manquantes sont créées à la volée avec les valeurs
    // de la matrice, pour être immédiatement modifiables dans le back-office.
    const missing = defaultPricingSettings().filter((d) => !existing.has(d.key));
    if (missing.length) {
      await db.insert(schema.siteSettings).values(missing.map((m) => ({ ...m, updatedAt: new Date() })));
      return db.select().from(schema.siteSettings);
    }
    return rows;
  }),

  saveSettings: adminOnly
    .input(
      z.object({
        entries: z
          .array(
            z.object({
              key: z.string().min(2).max(80),
              value: z.string().max(4000),
              group: z.string().max(40).default("general"),
              label: z.string().max(120).optional(),
            }),
          )
          .min(1)
          .max(80),
      }),
    )
    .handler(async ({ input, context }) => {
      for (const entry of input.entries) {
        await db
          .insert(schema.siteSettings)
          .values({
            key: entry.key,
            value: entry.value,
            group: entry.group,
            label: entry.label ?? null,
            updatedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: schema.siteSettings.key,
            set: { value: entry.value, group: entry.group, updatedAt: new Date() },
          });
      }
      invalidatePricingConfig();
      await log(context.user, "settings.save", null, input.entries.map((e) => e.key).join(", "));
      return { ok: true, count: input.entries.length };
    }),

  /* ---------------- Messages, candidatures, leads, journal ---------------- */

  contacts: adminOnly.handler(() =>
    db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt)).limit(200),
  ),

  applications: adminOnly.handler(() =>
    db.select().from(schema.carrierApplications).orderBy(desc(schema.carrierApplications.createdAt)).limit(200),
  ),

  leads: adminOnly.handler(() =>
    db.select().from(schema.chatLeads).orderBy(desc(schema.chatLeads.createdAt)).limit(200),
  ),

  markLeadHandled: adminOnly
    .input(z.object({ id: z.number(), handled: z.boolean().default(true) }))
    .handler(async ({ input, context }) => {
      await db.update(schema.chatLeads).set({ handled: input.handled }).where(eq(schema.chatLeads.id, input.id));
      await log(context.user, "lead.handled", String(input.id));
      return { ok: true };
    }),

  audit: adminOnly.handler(() =>
    db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(200),
  ),

  /* ---------------- Suivis ---------------- */

  trackings: adminOnly.handler(() =>
    db.select().from(schema.trackings).orderBy(desc(schema.trackings.createdAt)).limit(200),
  ),

  /** Dernière position GPS connue de chaque course en cours (carte temps réel) */
  driverPositions: adminOnly.handler(async () => {
    const rows = await db
      .select({
        id: schema.trackingLocations.id,
        trackingNumber: schema.trackingLocations.trackingNumber,
        driverId: schema.trackingLocations.driverId,
        lat: schema.trackingLocations.lat,
        lng: schema.trackingLocations.lng,
        accuracy: schema.trackingLocations.accuracy,
        createdAt: schema.trackingLocations.createdAt,
        driverName: schema.drivers.name,
        driverPhone: schema.drivers.phone,
        driverVehicle: schema.drivers.vehicle,
        status: schema.trackings.status,
        destination: schema.trackings.destination,
      })
      .from(schema.trackingLocations)
      .leftJoin(schema.drivers, eq(schema.drivers.id, schema.trackingLocations.driverId))
      .leftJoin(schema.trackings, eq(schema.trackings.trackingNumber, schema.trackingLocations.trackingNumber))
      .orderBy(desc(schema.trackingLocations.createdAt))
      .limit(400);

    const latest = new Map<string, (typeof rows)[number]>();
    for (const row of rows) if (!latest.has(row.trackingNumber)) latest.set(row.trackingNumber, row);
    return [...latest.values()];
  }),

  addTrackingEvent: adminOnly
    .input(
      z.object({
        trackingNumber: z.string().min(4).max(40),
        status: z.enum(["cree", "pris_en_charge", "en_transit", "en_livraison", "livre", "incident"]),
        labelFr: z.string().min(2).max(160),
        labelEn: z.string().min(2).max(160),
        location: z.string().max(160).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const number = input.trackingNumber.toUpperCase();
      const [tracking] = await db
        .select()
        .from(schema.trackings)
        .where(eq(schema.trackings.trackingNumber, number))
        .limit(1);
      if (!tracking) throw new ORPCError("NOT_FOUND", { message: "Colis introuvable" });

      await db.insert(schema.trackingEvents).values({
        trackingNumber: number,
        status: input.status,
        labelFr: input.labelFr,
        labelEn: input.labelEn,
        location: input.location ?? null,
      });
      await db
        .update(schema.trackings)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(schema.trackings.id, tracking.id));
      let to: string | null = null;
      let name: string | null = tracking.recipientName ?? null;
      if (tracking.quoteId) {
        const [quote] = await db
          .select({ email: schema.quotes.customerEmail, name: schema.quotes.customerName })
          .from(schema.quotes)
          .where(eq(schema.quotes.id, tracking.quoteId))
          .limit(1);
        if (quote) {
          to = quote.email;
          name = name ?? quote.name;
        }
      }
      if (to) {
        await mailTrackingUpdate({
          to,
          name,
          trackingNumber: number,
          status: input.status,
          label: input.labelFr,
          location: input.location ?? null,
        });
      }

      await log(context.user, `tracking.${input.status}`, number, input.location ?? null);
      return { ok: true };
    }),

  /* ---------------- Espace client ---------------- */

  myOrders: authed.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(schema.quotes)
      .where(eq(schema.quotes.customerEmail, context.user.email))
      .orderBy(desc(schema.quotes.createdAt));
    return rows;
  }),
};
