import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { generateRef } from "../lib/pricing";

const ACCESS_CODE = process.env.PRO_ACCESS_CODE ?? "LBG-PRO-2026";

/**
 * Toutes les procédures pro exigent le code d'accès du module professionnel.
 * `guarded()` fabrique la procédure avec le schéma complet en une seule fois :
 * on ne peut pas rechaîner `.input()` sur une procédure qui en a déjà un.
 */
function guarded<T extends z.ZodRawShape>(shape?: T) {
  return base
    .input(z.object({ accessCode: z.string().min(4), ...((shape ?? {}) as T) }))
    .use(async ({ next, context }, input: unknown) => {
      const code = (input as { accessCode?: string }).accessCode ?? "";
      if (code.trim() !== ACCESS_CODE) {
        throw new ORPCError("UNAUTHORIZED", { message: "Code d'accès professionnel invalide" });
      }
      return next({ context });
    });
}

/** Procédure pro sans autre entrée que le code d'accès. */
const guard = guarded();

function newApiKey() {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let s = "";
  for (let i = 0; i < 32; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `lbg_live_${s}`;
}

export const pro = {
  /** Vérification du code d'accès (écran de connexion du dashboard) */
  login: base.input(z.object({ accessCode: z.string().min(1) })).handler(({ input }) => {
    if (input.accessCode.trim() !== ACCESS_CODE) {
      throw new ORPCError("UNAUTHORIZED", { message: "Code d'accès professionnel invalide" });
    }
    return { ok: true };
  }),

  /** KPI du tableau de bord */
  stats: guard.handler(async () => {
    const [allQuotes, allTrackings, allPayments, allContacts, allApplications] = await Promise.all([
      db.select().from(schema.quotes),
      db.select().from(schema.trackings),
      db.select().from(schema.payments),
      db.select().from(schema.contacts),
      db.select().from(schema.carrierApplications),
    ]);

    const revenueCents = allPayments
      .filter((p) => p.status === "confirme")
      .reduce((sum, p) => sum + p.amountCents, 0);
    const pipelineCents = allQuotes
      .filter((q) => q.status === "nouveau")
      .reduce((sum, q) => sum + q.priceCents, 0);

    const byStatus = allTrackings.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {});

    const last30 = Date.now() - 30 * 24 * 3600 * 1000;
    const series = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(Date.now() - (13 - i) * 24 * 3600 * 1000);
      const key = day.toISOString().slice(0, 10);
      const count = allQuotes.filter((q) => q.createdAt.toISOString().slice(0, 10) === key).length;
      return { date: key, count };
    });

    return {
      quotes: allQuotes.length,
      quotesLast30: allQuotes.filter((q) => q.createdAt.getTime() > last30).length,
      trackings: allTrackings.length,
      inTransit: (byStatus.en_transit ?? 0) + (byStatus.en_livraison ?? 0),
      delivered: byStatus.livre ?? 0,
      revenue: revenueCents / 100,
      pipeline: pipelineCents / 100,
      contacts: allContacts.length,
      applications: allApplications.length,
      byStatus,
      series,
    };
  }),

  /** Liste des devis (avec export CSV côté client) */
  quotes: guard.handler(() =>
    db.select().from(schema.quotes).orderBy(desc(schema.quotes.createdAt)).limit(200),
  ),

  /** Liste des colis */
  trackings: guard.handler(() =>
    db.select().from(schema.trackings).orderBy(desc(schema.trackings.createdAt)).limit(200),
  ),

  /** Messages de contact */
  contacts: guard.handler(() =>
    db.select().from(schema.contacts).orderBy(desc(schema.contacts.createdAt)).limit(100),
  ),

  /** Candidatures transporteurs */
  applications: guard.handler(() =>
    db
      .select()
      .from(schema.carrierApplications)
      .orderBy(desc(schema.carrierApplications.createdAt))
      .limit(100),
  ),

  /** Changement de statut d'un devis */
  setQuoteStatus: guarded({
    ref: z.string(),
    status: z.enum(["nouveau", "accepte", "paye", "en_cours", "livre", "annule"]),
  }).handler(async ({ input }) => {
    await db
      .update(schema.quotes)
      .set({ status: input.status })
      .where(eq(schema.quotes.ref, input.ref));
    return { ok: true };
  }),

  /* ---------------- Clés API ---------------- */
  apiKeys: guard.handler(() =>
    db.select().from(schema.apiKeys).orderBy(desc(schema.apiKeys.createdAt)),
  ),

  createApiKey: guarded({ label: z.string().min(2).max(60) }).handler(async ({ input }) => {
    const [row] = await db
      .insert(schema.apiKeys)
      .values({ label: input.label, key: newApiKey() })
      .returning();
    return row;
  }),

  revokeApiKey: guarded({ id: z.number() }).handler(async ({ input }) => {
    await db.update(schema.apiKeys).set({ revoked: true }).where(eq(schema.apiKeys.id, input.id));
    return { ok: true };
  }),

  /* ---------------- Webhooks ---------------- */
  webhooks: guard.handler(() =>
    db.select().from(schema.webhooks).orderBy(desc(schema.webhooks.createdAt)),
  ),

  createWebhook: guarded({
    url: z.string().url(),
    events: z.string().min(3).default("tracking.updated"),
  }).handler(async ({ input }) => {
    const [row] = await db
      .insert(schema.webhooks)
      .values({
        url: input.url,
        events: input.events,
        secret: `whsec_${generateRef("")}${generateRef("")}`,
      })
      .returning();
    return row;
  }),

  deleteWebhook: guarded({ id: z.number() }).handler(async ({ input }) => {
    await db.delete(schema.webhooks).where(eq(schema.webhooks.id, input.id));
    return { ok: true };
  }),

  /* ---------------- Livreurs ---------------- */
  drivers: guard.handler(() =>
    db.select().from(schema.drivers).orderBy(desc(schema.drivers.createdAt)),
  ),

  createDriver: guarded({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    vehicle: z.string().optional(),
    city: z.string().optional(),
  }).handler(async ({ input }) => {
    const code = generateRef("").slice(0, 6);
    const [row] = await db
      .insert(schema.drivers)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone,
        vehicle: input.vehicle,
        city: input.city,
        code,
      })
      .returning();
    return row;
  }),

  /** Assignation d'une course à un livreur */
  assignJob: guarded({
    driverId: z.number(),
    trackingNumber: z.string().min(4),
    pickupAddress: z.string().min(3),
    dropAddress: z.string().min(3),
    recipientName: z.string().optional(),
    recipientPhone: z.string().optional(),
    payoutCents: z.number().min(0).optional(),
  }).handler(async ({ input }) => {
    const [row] = await db
      .insert(schema.driverJobs)
      .values({
        driverId: input.driverId,
        trackingNumber: input.trackingNumber.toUpperCase(),
        pickupAddress: input.pickupAddress,
        dropAddress: input.dropAddress,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        payoutCents: input.payoutCents,
        scheduledAt: new Date(),
      })
      .returning();
    return row;
  }),
};
