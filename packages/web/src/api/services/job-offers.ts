import { and, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { getDriverShare } from "../lib/settings";
import { mailJobOffer } from "./email";

/**
 * Publie une course à tous les livreurs disponibles dès qu'une commande est payée.
 * Idempotent : une offre existe au plus une fois par numéro de suivi.
 */
export async function publishJobOffer(quoteRef: string): Promise<{ ok: boolean; reason?: string; notified?: number }> {
  const [quote] = await db.select().from(schema.quotes).where(eq(schema.quotes.ref, quoteRef)).limit(1);
  if (!quote?.trackingNumber) return { ok: false, reason: "devis ou numéro de suivi introuvable" };

  const [existing] = await db
    .select()
    .from(schema.jobOffers)
    .where(eq(schema.jobOffers.trackingNumber, quote.trackingNumber))
    .limit(1);
  if (existing) return { ok: false, reason: "offre déjà publiée" };

  const share = await getDriverShare();
  const payoutCents = quote.priceCents ? Math.round(quote.priceCents * share) : null;

  const [offer] = await db
    .insert(schema.jobOffers)
    .values({
      trackingNumber: quote.trackingNumber,
      quoteRef: quote.ref,
      service: quote.service,
      kind: quote.kind,
      pickupAddress: quote.fromAddress,
      dropAddress: quote.toAddress,
      recipientName: quote.customerName,
      recipientPhone: quote.customerPhone,
      weightKg: quote.weightKg,
      volumeM3: quote.volumeM3,
      payoutCents,
      status: "ouverte",
    })
    .returning();
  if (!offer) return { ok: false, reason: "offre non enregistrée" };

  const notified = await notifyAvailableDrivers(offer);
  return { ok: true, notified };
}

/** Envoie l'offre à tous les livreurs actifs, validés et disponibles. */
export async function notifyAvailableDrivers(offer: typeof schema.jobOffers.$inferSelect): Promise<number> {
  const rows = await db
    .select()
    .from(schema.drivers)
    .where(
      and(
        eq(schema.drivers.active, true),
        eq(schema.drivers.available, true),
        eq(schema.drivers.approvalStatus, "valide"),
      ),
    );

  let sent = 0;
  for (const driver of rows) {
    const result = await mailJobOffer({
      to: driver.email,
      name: driver.firstName ?? driver.name,
      trackingNumber: offer.trackingNumber,
      pickup: offer.pickupAddress,
      drop: offer.dropAddress,
      service: offer.service,
      weightKg: offer.weightKg,
      volumeM3: offer.volumeM3,
      payoutCents: offer.payoutCents,
      scheduledAt: offer.scheduledAt,
    }).catch(() => ({ ok: false }) as const);
    if (result.ok) sent += 1;
  }

  await db.update(schema.jobOffers).set({ notifiedCount: sent }).where(eq(schema.jobOffers.id, offer.id));
  return sent;
}
