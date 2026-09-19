/**
 * Relance de panier abandonné.
 *
 * Un devis est créé dès la validation d'un formulaire, puis le client arrive sur
 * la page de paiement. S'il repart sans régler, le devis reste en statut
 * "nouveau" : c'est notre définition du panier abandonné.
 *
 * Deux cadences, selon la nature de l'envoi :
 *  - petits colis / covoiturage  → relance 1 à 1 h, relance 2 à 24 h
 *  - gros volumes, déménagement, fret international → relance 1 à 24 h, relance 2 à 4 jours
 *
 * Un gros volume abandonné déclenche en plus une alerte interne (e-mail + notification
 * back-office) pour permettre un rappel commercial.
 *
 * Le déclencheur est la route HTTP /api/cron/abandoned-carts, appelée par un timer
 * systemd sur le VPS. La date d'envoi est écrite en base avant d'être considérée
 * comme traitée : aucune relance ne peut partir deux fois.
 */
import { and, desc, eq, inArray, isNotNull, isNull, lte, or } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { mailAbandonOps, mailAbandonedCartColis, mailAbandonedCartFret } from "./email";

/** Statuts qui ne sont plus des paniers abandonnés (payé, traité ou abandonné volontairement). */
const CLOSED_STATUSES = ["paye", "annule", "refuse", "livre", "expedie", "en_cours"];

/** Types de devis traités comme du gros volume (cadence lente, tarif garanti, alerte interne). */
const FREIGHT_KINDS = ["international", "demenagement", "palette", "fret"];

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Délais de relance, en millisecondes après la création du devis. */
export const CART_DELAYS = {
  colis: { first: 1 * HOUR, second: 24 * HOUR },
  fret: { first: 24 * HOUR, second: 4 * DAY },
} as const;

/**
 * Au-delà de cette ancienneté, on ne relance plus : un devis oublié depuis des
 * semaines n'a plus de tarif valable et la relance passerait pour du spam.
 */
export const CART_MAX_AGE = 14 * DAY;

export type CartTrack = "colis" | "fret";

export interface CartRunResult {
  candidates: number;
  sent: number;
  opsAlerts: number;
  skipped: number;
  failed: number;
  details: { ref: string; track: CartTrack; step: 1 | 2; outcome: string }[];
}

/** Cadence applicable à un devis. */
export function trackFor(kind: string): CartTrack {
  return FREIGHT_KINDS.includes(kind) ? "fret" : "colis";
}

const KIND_LABELS: Record<string, string> = {
  colis: "Colis",
  palette: "Palette",
  demenagement: "Déménagement",
  international: "Fret international",
  fret: "Fret",
};

function kindLabel(kind: string) {
  return KIND_LABELS[kind] ?? kind;
}

/**
 * Un devis peut avoir été réglé sans que son statut ait été mis à jour (virement
 * saisi à la main, facture acquittée). On vérifie donc aussi les paiements et
 * les factures avant toute relance.
 */
async function isSettled(quoteRef: string): Promise<boolean> {
  const [payment] = await db
    .select({ id: schema.payments.id })
    .from(schema.payments)
    .where(and(eq(schema.payments.quoteRef, quoteRef), inArray(schema.payments.status, ["confirme", "paye"])))
    .limit(1);
  if (payment) return true;

  const [invoice] = await db
    .select({ id: schema.invoices.id })
    .from(schema.invoices)
    .where(
      and(
        eq(schema.invoices.quoteRef, quoteRef),
        or(eq(schema.invoices.status, "payee"), isNotNull(schema.invoices.paidAt)),
      ),
    )
    .limit(1);
  return Boolean(invoice);
}

/** Notification interne consultable depuis le back-office. */
async function pushNotification(args: {
  title: string;
  body: string;
  quote: typeof schema.quotes.$inferSelect;
}) {
  try {
    await db.insert(schema.notifications).values({
      kind: "panier_abandonne",
      title: args.title,
      body: args.body,
      quoteRef: args.quote.ref,
      orderNumber: args.quote.orderNumber,
      amountCents: args.quote.priceCents,
      customerName: args.quote.customerName,
      customerEmail: args.quote.customerEmail,
      customerPhone: args.quote.customerPhone,
    });
  } catch {
    // Une notification manquée ne doit jamais empêcher l'envoi de la relance.
  }
}

export async function runAbandonedCarts(options?: { dryRun?: boolean; limit?: number }): Promise<CartRunResult> {
  const limit = options?.limit ?? 100;
  const dryRun = options?.dryRun ?? false;
  const now = Date.now();
  const result: CartRunResult = { candidates: 0, sent: 0, opsAlerts: 0, skipped: 0, failed: 0, details: [] };

  // Le plus court des délais possibles : rien de plus récent ne peut être éligible.
  const youngest = new Date(now - CART_DELAYS.colis.first);
  const oldest = new Date(now - CART_MAX_AGE);

  const candidates = await db
    .select()
    .from(schema.quotes)
    .where(
      and(
        lte(schema.quotes.createdAt, youngest),
        isNull(schema.quotes.reminder2SentAt),
        eq(schema.quotes.status, "nouveau"),
      ),
    )
    .orderBy(desc(schema.quotes.createdAt))
    .limit(limit);

  for (const quote of candidates) {
    const track = trackFor(quote.kind);
    const delays = CART_DELAYS[track];
    const age = now - quote.createdAt.getTime();

    // Quelle étape est due ? La seconde n'est envoyée qu'après la première.
    let step: 1 | 2 | null = null;
    if (!quote.reminder1SentAt && age >= delays.first) step = 1;
    else if (quote.reminder1SentAt && !quote.reminder2SentAt && age >= delays.second) step = 2;
    if (step === null) continue;

    result.candidates += 1;

    if (quote.createdAt < oldest) {
      result.skipped += 1;
      result.details.push({ ref: quote.ref, track, step, outcome: "trop ancien" });
      continue;
    }
    if (!quote.customerEmail) {
      result.skipped += 1;
      result.details.push({ ref: quote.ref, track, step, outcome: "pas d'e-mail" });
      continue;
    }
    if (CLOSED_STATUSES.includes(quote.status)) {
      result.skipped += 1;
      result.details.push({ ref: quote.ref, track, step, outcome: `statut ${quote.status}` });
      continue;
    }
    if (await isSettled(quote.ref)) {
      result.skipped += 1;
      result.details.push({ ref: quote.ref, track, step, outcome: "déjà réglé" });
      continue;
    }
    // Adresse désinscrite : on respecte le refus, y compris pour une relance.
    const [optOut] = await db
      .select({ active: schema.newsletterSubscribers.active })
      .from(schema.newsletterSubscribers)
      .where(eq(schema.newsletterSubscribers.email, quote.customerEmail.trim().toLowerCase()))
      .limit(1);
    if (optOut && !optOut.active) {
      result.skipped += 1;
      result.details.push({ ref: quote.ref, track, step, outcome: "désinscrit" });
      continue;
    }

    if (dryRun) {
      result.details.push({ ref: quote.ref, track, step, outcome: "simulation" });
      continue;
    }

    // Date écrite AVANT l'envoi : en cas d'erreur réseau, on ne réessaie pas en boucle.
    const stamp = step === 1 ? { reminder1SentAt: new Date() } : { reminder2SentAt: new Date() };
    await db.update(schema.quotes).set(stamp).where(eq(schema.quotes.id, quote.id));

    const payload = {
      to: quote.customerEmail,
      firstName: quote.customerFirstName,
      name: quote.customerName,
      ref: quote.ref,
      orderNumber: quote.orderNumber,
      priceCents: quote.priceCents,
      from: quote.fromAddress,
      to_: quote.toAddress,
      weightKg: quote.weightKg,
      volumeM3: quote.volumeM3,
      pieces: quote.pieces,
      serviceLabel: kindLabel(quote.kind),
      step,
    };

    const sendResult =
      track === "fret" ? await mailAbandonedCartFret(payload) : await mailAbandonedCartColis(payload);

    if (sendResult.ok) {
      result.sent += 1;
      result.details.push({ ref: quote.ref, track, step, outcome: sendResult.skipped ? "e-mail désactivé" : "envoyé" });
    } else {
      result.failed += 1;
      result.details.push({ ref: quote.ref, track, step, outcome: `échec: ${sendResult.error ?? "inconnu"}` });
    }

    await pushNotification({
      title: `Relance ${step} envoyée — ${kindLabel(quote.kind)} n° ${quote.orderNumber ?? quote.ref}`,
      body: `${quote.customerName} · ${quote.fromAddress} → ${quote.toAddress} · panier non réglé.`,
      quote,
    });

    // Gros volume abandonné : alerte commerciale, une seule fois par dossier.
    if (track === "fret" && !quote.opsAbandonNotifiedAt) {
      await db
        .update(schema.quotes)
        .set({ opsAbandonNotifiedAt: new Date() })
        .where(eq(schema.quotes.id, quote.id));
      const ops = await mailAbandonOps({
        ref: quote.ref,
        orderNumber: quote.orderNumber,
        kindLabel: kindLabel(quote.kind),
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        priceCents: quote.priceCents,
        from: quote.fromAddress,
        to_: quote.toAddress,
        weightKg: quote.weightKg,
        volumeM3: quote.volumeM3,
        createdAt: quote.createdAt,
      });
      if (ops.ok) result.opsAlerts += 1;
      await pushNotification({
        title: `À rappeler — fret abandonné n° ${quote.orderNumber ?? quote.ref}`,
        body: `${quote.customerName} · ${quote.customerPhone ?? "téléphone non fourni"} · suivi commercial conseillé.`,
        quote,
      });
    }
  }

  return result;
}
