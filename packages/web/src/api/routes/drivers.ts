import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { signDriverToken, verifyDriverToken } from "../lib/driver-token";
import { STATUS_LABELS } from "./tracking";

const JOB_TO_TRACKING: Record<string, keyof typeof STATUS_LABELS> = {
  a_recuperer: "pris_en_charge",
  en_route: "en_transit",
  en_livraison: "en_livraison",
  livre: "livre",
  incident: "incident",
};

export const drivers = {
  /** Connexion livreur : email + code à 6 caractères */
  login: base
    .input(z.object({ email: z.string().email(), code: z.string().min(4).max(12) }))
    .handler(async ({ input }) => {
      const [driver] = await db
        .select()
        .from(schema.drivers)
        .where(eq(schema.drivers.email, input.email.trim().toLowerCase()));
      if (!driver || driver.code !== input.code.trim().toUpperCase()) {
        throw new ORPCError("UNAUTHORIZED", { message: "Email ou code invalide" });
      }
      if (!driver.active) throw new ORPCError("FORBIDDEN", { message: "Compte livreur désactivé" });
      return {
        id: driver.id,
        name: driver.name,
        email: driver.email,
        vehicle: driver.vehicle,
        city: driver.city,
        token: signDriverToken(driver.id),
      };
    }),

  /** Courses du livreur — jeton de session obligatoire */
  jobs: base
    .input(z.object({ token: z.string().min(10), includeDone: z.boolean().default(false) }))
    .handler(async ({ input }) => {
      const driverId = verifyDriverToken(input.token);
      const rows = await db
        .select()
        .from(schema.driverJobs)
        .where(eq(schema.driverJobs.driverId, driverId))
        .orderBy(desc(schema.driverJobs.scheduledAt));
      return input.includeDone ? rows : rows.filter((j) => j.status !== "livre");
    }),

  /** Historique livré — jeton de session obligatoire */
  history: base.input(z.object({ token: z.string().min(10) })).handler(({ input }) => {
    const driverId = verifyDriverToken(input.token);
    return db
      .select()
      .from(schema.driverJobs)
      .where(and(eq(schema.driverJobs.driverId, driverId), eq(schema.driverJobs.status, "livre")))
      .orderBy(desc(schema.driverJobs.createdAt))
      .limit(50);
  }),

  /** Changement de statut d'une course → événement de suivi automatique */
  updateJob: base
    .input(
      z.object({
        token: z.string().min(10),
        jobId: z.number(),
        status: z.enum(["a_recuperer", "en_route", "en_livraison", "livre", "incident"]),
        note: z.string().max(240).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const driverId = verifyDriverToken(input.token);
      const [job] = await db.select().from(schema.driverJobs).where(eq(schema.driverJobs.id, input.jobId));
      if (!job || job.driverId !== driverId) {
        throw new ORPCError("FORBIDDEN", { message: "Course non attribuée à ce livreur" });
      }
      await db.update(schema.driverJobs).set({ status: input.status }).where(eq(schema.driverJobs.id, input.jobId));

      const trackingStatus = JOB_TO_TRACKING[input.status] ?? "en_transit";
      const labels = STATUS_LABELS[trackingStatus];
      await db.insert(schema.trackingEvents).values({
        trackingNumber: job.trackingNumber,
        status: trackingStatus,
        labelFr: input.note ? `${labels.fr} — ${input.note}` : labels.fr,
        labelEn: input.note ? `${labels.en} — ${input.note}` : labels.en,
        location: input.status === "livre" ? job.dropAddress : job.pickupAddress,
      });
      await db
        .update(schema.trackings)
        .set({ status: trackingStatus, updatedAt: new Date(), driverId })
        .where(eq(schema.trackings.trackingNumber, job.trackingNumber));

      return { ok: true, trackingStatus };
    }),

  /** Position GPS du livreur rattachée à la course en cours */
  pushLocation: base
    .input(
      z.object({
        token: z.string().min(10),
        trackingNumber: z.string().min(4),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        accuracy: z.number().min(0).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const driverId = verifyDriverToken(input.token);
      const number = input.trackingNumber.trim().toUpperCase();
      const [job] = await db
        .select()
        .from(schema.driverJobs)
        .where(and(eq(schema.driverJobs.driverId, driverId), eq(schema.driverJobs.trackingNumber, number)));
      if (!job) throw new ORPCError("FORBIDDEN", { message: "Colis non attribué à ce livreur" });

      const [row] = await db
        .insert(schema.trackingLocations)
        .values({
          trackingNumber: number,
          driverId,
          lat: input.lat,
          lng: input.lng,
          accuracy: input.accuracy,
        })
        .returning();
      return row;
    }),
};
