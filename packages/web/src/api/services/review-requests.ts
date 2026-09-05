/**
 * Demande d'avis Trustpilot après livraison.
 *
 * Un colis devient éligible quand :
 *  - son statut est "livre",
 *  - l'événement de livraison date d'au moins REVIEW_DELAY_DAYS jours,
 *  - aucune demande n'a encore été envoyée (trackings.review_requested_at vide),
 *  - un e-mail client est rattaché via le devis d'origine.
 *
 * Le déclencheur est la route HTTP /api/cron/review-requests, appelée par un
 * timer systemd sur le VPS. Aucun envoi n'est fait deux fois : la date d'envoi
 * est écrite en base avant de considérer le colis comme traité.
 */
import { and, eq, isNull, lte } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { mailReviewRequest } from "./email";

export const REVIEW_URL = process.env.REVIEW_URL ?? "https://fr.trustpilot.com/review/lbgexpresscolis.fr";

/** Délai entre la livraison et la demande d'avis, en jours. */
export const REVIEW_DELAY_DAYS = Number(process.env.REVIEW_DELAY_DAYS ?? 2);

export interface ReviewRunResult {
  eligible: number;
  sent: number;
  skipped: number;
  failed: number;
  details: { trackingNumber: string; outcome: string }[];
}

/** Date de livraison réelle : dernier événement "livre" du colis. */
async function deliveredAt(trackingNumber: string): Promise<Date | null> {
  const rows = await db
    .select({ occurredAt: schema.trackingEvents.occurredAt })
    .from(schema.trackingEvents)
    .where(
      and(eq(schema.trackingEvents.trackingNumber, trackingNumber), eq(schema.trackingEvents.status, "livre")),
    );
  if (rows.length === 0) return null;
  return rows.reduce((latest, r) => (r.occurredAt > latest ? r.occurredAt : latest), rows[0]!.occurredAt);
}

export async function runReviewRequests(options?: { dryRun?: boolean; limit?: number }): Promise<ReviewRunResult> {
  const limit = options?.limit ?? 50;
  const dryRun = options?.dryRun ?? false;
  const cutoff = new Date(Date.now() - REVIEW_DELAY_DAYS * 24 * 60 * 60 * 1000);

  const candidates = await db
    .select()
    .from(schema.trackings)
    .where(
      and(
        eq(schema.trackings.status, "livre"),
        isNull(schema.trackings.reviewRequestedAt),
        lte(schema.trackings.updatedAt, cutoff),
      ),
    )
    .limit(limit);

  const result: ReviewRunResult = { eligible: candidates.length, sent: 0, skipped: 0, failed: 0, details: [] };

  for (const tracking of candidates) {
    const number = tracking.trackingNumber;
    const delivered = await deliveredAt(number);
    if (delivered && delivered > cutoff) {
      result.skipped += 1;
      result.details.push({ trackingNumber: number, outcome: "livraison trop récente" });
      continue;
    }

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

    if (!to) {
      result.skipped += 1;
      result.details.push({ trackingNumber: number, outcome: "aucun e-mail client" });
      continue;
    }

    if (dryRun) {
      result.details.push({ trackingNumber: number, outcome: `simulation → ${to}` });
      continue;
    }

    const sent = await mailReviewRequest({ to, name, trackingNumber: number, reviewUrl: REVIEW_URL });
    if (sent.ok) {
      await db
        .update(schema.trackings)
        .set({ reviewRequestedAt: new Date() })
        .where(eq(schema.trackings.id, tracking.id));
      result.sent += 1;
      result.details.push({ trackingNumber: number, outcome: `envoyé à ${to}` });
    } else {
      result.failed += 1;
      result.details.push({ trackingNumber: number, outcome: `échec : ${sent.error ?? "envoi ignoré"}` });
    }
  }

  return result;
}
