import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../database";
import * as schema from "../database/schema";
import { adminOnly } from "../middleware/auth";
import { mailDriverApproval } from "../services/email";
import { notifyAvailableDrivers } from "../services/job-offers";

/** Back-office des comptes livreurs : validation des dossiers et suivi des courses proposées. */
export const driverAdmin = {
  /** Tous les livreurs, dossiers en attente en premier. */
  list: adminOnly.handler(async () => {
    const rows = await db.select().from(schema.drivers).orderBy(desc(schema.drivers.createdAt));
    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email,
      phone: d.phone,
      whatsapp: d.whatsapp,
      address: d.address,
      city: d.city,
      vehicle: d.vehicle,
      plate: d.plate,
      siret: d.siret,
      code: d.code,
      active: d.active,
      available: d.available,
      emailVerified: d.emailVerified,
      approvalStatus: d.approvalStatus,
      approvalNote: d.approvalNote,
      approvedAt: d.approvedAt,
      lastLoginAt: d.lastLoginAt,
      createdAt: d.createdAt,
      hasLicense: Boolean(d.licenseKey),
      hasIdPhoto: Boolean(d.idPhotoKey),
      hasVehicleDoc: Boolean(d.vehicleDocKey),
      licenseKey: d.licenseKey,
      idPhotoKey: d.idPhotoKey,
      vehicleDocKey: d.vehicleDocKey,
    }));
  }),

  /** Validation ou refus d'un dossier — le livreur est prévenu par e-mail. */
  setApproval: adminOnly
    .input(
      z.object({
        driverId: z.number(),
        status: z.enum(["en_attente", "valide", "refuse"]),
        note: z.string().max(300).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, input.driverId)).limit(1);
      if (!driver) throw new ORPCError("NOT_FOUND", { message: "Livreur introuvable" });

      await db
        .update(schema.drivers)
        .set({
          approvalStatus: input.status,
          approvalNote: input.note ?? null,
          approvedAt: input.status === "valide" ? new Date() : null,
          available: input.status === "valide" ? driver.available : false,
        })
        .where(eq(schema.drivers.id, driver.id));

      if (input.status !== "en_attente") {
        await mailDriverApproval({
          to: driver.email,
          name: driver.firstName ?? driver.name,
          approved: input.status === "valide",
          note: input.note,
        }).catch(() => null);
      }

      await db.insert(schema.auditLog).values({
        userId: context.user.id,
        userEmail: context.user.email,
        action: `driver.${input.status}`,
        target: driver.email,
        detail: input.note ?? null,
      });
      return { ok: true };
    }),

  /** Activation / désactivation d'un compte livreur. */
  setActive: adminOnly
    .input(z.object({ driverId: z.number(), active: z.boolean() }))
    .handler(async ({ input }) => {
      await db
        .update(schema.drivers)
        .set(input.active ? { active: true } : { active: false, available: false })
        .where(eq(schema.drivers.id, input.driverId));
      return { ok: true };
    }),

  /** Courses publiées : ouvertes, attribuées, annulées. */
  offers: adminOnly.handler(async () => {
    const rows = await db
      .select({
        offer: schema.jobOffers,
        driverName: schema.drivers.name,
        driverPhone: schema.drivers.phone,
      })
      .from(schema.jobOffers)
      .leftJoin(schema.drivers, eq(schema.drivers.id, schema.jobOffers.acceptedDriverId))
      .orderBy(desc(schema.jobOffers.createdAt))
      .limit(100);
    return rows.map((r) => ({ ...r.offer, driverName: r.driverName, driverPhone: r.driverPhone }));
  }),

  /** Renvoi manuel d'une offre encore ouverte aux livreurs disponibles. */
  resendOffer: adminOnly.input(z.object({ offerId: z.number() })).handler(async ({ input }) => {
    const [offer] = await db.select().from(schema.jobOffers).where(eq(schema.jobOffers.id, input.offerId)).limit(1);
    if (!offer) throw new ORPCError("NOT_FOUND", { message: "Course introuvable" });
    if (offer.status !== "ouverte") throw new ORPCError("CONFLICT", { message: "Course déjà attribuée" });
    const notified = await notifyAvailableDrivers(offer);
    return { ok: true, notified };
  }),

  /** Annulation d'une course proposée. */
  cancelOffer: adminOnly.input(z.object({ offerId: z.number() })).handler(async ({ input }) => {
    await db.update(schema.jobOffers).set({ status: "annulee" }).where(eq(schema.jobOffers.id, input.offerId));
    return { ok: true };
  }),
};
