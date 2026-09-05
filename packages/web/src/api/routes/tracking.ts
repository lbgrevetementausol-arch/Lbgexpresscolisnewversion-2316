import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { partnerOrAdmin } from "../middleware/api-key";
import { db } from "../database";
import * as schema from "../database/schema";
import { generateTrackingNumber } from "../lib/pricing";

export const TRACKING_STATUSES = [
  "cree",
  "pris_en_charge",
  "en_transit",
  "en_livraison",
  "livre",
  "incident",
  "retourne",
] as const;

export const STATUS_LABELS: Record<(typeof TRACKING_STATUSES)[number], { fr: string; en: string }> = {
  cree: { fr: "Expédition créée", en: "Shipment created" },
  pris_en_charge: { fr: "Colis pris en charge", en: "Parcel picked up" },
  en_transit: { fr: "En transit", en: "In transit" },
  en_livraison: { fr: "En cours de livraison", en: "Out for delivery" },
  livre: { fr: "Livré", en: "Delivered" },
  incident: { fr: "Incident de livraison", en: "Delivery incident" },
  retourne: { fr: "Retourné à l'expéditeur", en: "Returned to sender" },
};

const statusEnum = z.enum(TRACKING_STATUSES);

async function notifyWebhooks(event: string, payload: unknown) {
  const hooks = await db.select().from(schema.webhooks).where(eq(schema.webhooks.active, true));
  await Promise.all(
    hooks
      .filter((h) => h.events.split(",").some((e) => e.trim() === event || e.trim() === "*"))
      .map(async (hook) => {
        try {
          const body = JSON.stringify({ event, data: payload, sentAt: new Date().toISOString() });
          const signature = await hmac(hook.secret, body);
          const res = await fetch(hook.url, {
            method: "POST",
            headers: { "content-type": "application/json", "x-lbg-signature": signature },
            body,
            signal: AbortSignal.timeout(5000),
          });
          await db.update(schema.webhooks).set({ lastStatus: `${res.status}` }).where(eq(schema.webhooks.id, hook.id));
        } catch (err) {
          await db
            .update(schema.webhooks)
            .set({ lastStatus: `error: ${(err as Error).message.slice(0, 60)}` })
            .where(eq(schema.webhooks.id, hook.id));
        }
      }),
  );
}

async function hmac(secret: string, body: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const tracking = {
  /** Suivi public d'un colis : timeline + dernière position GPS */
  get: base.input(z.object({ number: z.string().min(4).max(64) })).handler(async ({ input }) => {
    const number = input.number.trim().toUpperCase();
    const [parcel] = await db.select().from(schema.trackings).where(eq(schema.trackings.trackingNumber, number));
    if (!parcel) {
      throw new ORPCError("NOT_FOUND", {
        message: "Aucun colis trouvé pour ce numéro. Vérifiez le format TRK-YYYYMMDD-XXXXXX.",
      });
    }
    const events = await db
      .select()
      .from(schema.trackingEvents)
      .where(eq(schema.trackingEvents.trackingNumber, number))
      .orderBy(desc(schema.trackingEvents.occurredAt));
    const [position] = await db
      .select()
      .from(schema.trackingLocations)
      .where(eq(schema.trackingLocations.trackingNumber, number))
      .orderBy(desc(schema.trackingLocations.createdAt))
      .limit(1);

    return {
      parcel,
      statusLabel: STATUS_LABELS[parcel.status as keyof typeof STATUS_LABELS] ?? { fr: parcel.status, en: parcel.status },
      events,
      position: position ?? null,
    };
  }),

  /** Création d'un suivi — back-office (session admin) ou clé API partenaire. */
  create: partnerOrAdmin
    .input(
      z.object({
        origin: z.string().min(2).max(300),
        destination: z.string().min(2).max(300),
        recipientName: z.string().max(160).optional(),
        service: z.enum(["economique", "standard", "express", "premium"]).default("standard"),
        weightKg: z.number().min(0).max(30000).optional(),
        externalCarrier: z.string().max(80).optional(),
        source: z.enum(["site", "pro", "api"]).default("pro"),
      }),
    )
    .handler(async ({ input }) => {
      const trackingNumber = generateTrackingNumber();
      const [parcel] = await db
        .insert(schema.trackings)
        .values({ ...input, trackingNumber, status: "cree" })
        .returning();
      await db.insert(schema.trackingEvents).values({
        trackingNumber,
        status: "cree",
        labelFr: "Expédition créée",
        labelEn: "Shipment created",
        location: input.origin,
      });
      await notifyWebhooks("tracking.created", { trackingNumber, status: "cree" });
      return parcel;
    }),

  /** Ajout d'un événement + mise à jour du statut — back-office ou clé API partenaire. */
  addEvent: partnerOrAdmin
    .input(
      z.object({
        trackingNumber: z.string().min(4),
        status: statusEnum,
        location: z.string().max(300).optional(),
        note: z.string().max(300).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const number = input.trackingNumber.trim().toUpperCase();
      const [parcel] = await db.select().from(schema.trackings).where(eq(schema.trackings.trackingNumber, number));
      if (!parcel) throw new ORPCError("NOT_FOUND", { message: "Colis introuvable" });

      const labels = STATUS_LABELS[input.status];
      await db.insert(schema.trackingEvents).values({
        trackingNumber: number,
        status: input.status,
        labelFr: input.note ? `${labels.fr} — ${input.note}` : labels.fr,
        labelEn: input.note ? `${labels.en} — ${input.note}` : labels.en,
        location: input.location,
      });
      await db
        .update(schema.trackings)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(schema.trackings.trackingNumber, number));
      await notifyWebhooks("tracking.updated", { trackingNumber: number, status: input.status });
      return { ok: true };
    }),

  /** Position GPS — back-office ou clé API partenaire (l'app livreur passe par drivers.pushLocation). */
  pushLocation: partnerOrAdmin
    .input(
      z.object({
        trackingNumber: z.string().min(4),
        driverId: z.number().optional(),
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
        accuracy: z.number().min(0).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const number = input.trackingNumber.trim().toUpperCase();
      const [parcel] = await db.select().from(schema.trackings).where(eq(schema.trackings.trackingNumber, number));
      if (!parcel) throw new ORPCError("NOT_FOUND", { message: "Colis introuvable" });
      const [row] = await db
        .insert(schema.trackingLocations)
        .values({ ...input, trackingNumber: number })
        .returning();
      await notifyWebhooks("tracking.location", { trackingNumber: number, lat: input.lat, lng: input.lng });
      return row;
    }),

  /** Liste des positions (carte de suivi) */
  locations: base.input(z.object({ trackingNumber: z.string().min(4) })).handler(({ input }) =>
    db
      .select()
      .from(schema.trackingLocations)
      .where(eq(schema.trackingLocations.trackingNumber, input.trackingNumber.trim().toUpperCase()))
      .orderBy(desc(schema.trackingLocations.createdAt))
      .limit(50),
  ),

  /** Recherche interne (dashboard pro) — back-office ou clé API partenaire. */
  search: partnerOrAdmin
    .input(z.object({ status: statusEnum.optional(), limit: z.number().min(1).max(200).default(50) }))
    .handler(({ input }) =>
      db
        .select()
        .from(schema.trackings)
        .where(input.status ? and(eq(schema.trackings.status, input.status)) : undefined)
        .orderBy(desc(schema.trackings.createdAt))
        .limit(input.limit),
    ),
};

export { notifyWebhooks };
