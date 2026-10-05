import { ORPCError } from "@orpc/server";
import type * as schema from "../database/schema";
import { SERVICES, ZONES } from "./pricing";
import type { ServiceId, ZoneId } from "./pricing";

/**
 * Détail des lignes facturées à partir d'une commande/devis (proforma et facture).
 *
 * IMPORTANT — le montant facturé est TOUJOURS le `priceCents` enregistré sur le
 * devis, c'est-à-dire le prix annoncé au client. On ne recalcule jamais le tarif
 * au moment de la facturation : plusieurs paramètres de la simulation d'origine
 * (distance routière, accès difficile, barème du jour) ne sont pas stockés en
 * colonnes dédiées, un recalcul produirait un montant jamais annoncé.
 */
export function itemsFromQuote(quote: typeof schema.quotes.$inferSelect, label?: string | null) {
  const zone = (quote.zone ?? "france") as ZoneId;
  const service = (quote.service ?? "standard") as ServiceId;

  const acceptedCents = Math.round(quote.priceCents ?? 0);
  if (acceptedCents <= 0) {
    throw new ORPCError("BAD_REQUEST", {
      message: `Commande ${quote.ref} : aucun montant de devis enregistré, facturation impossible.`,
    });
  }

  const detail = [
    `Enlèvement : ${quote.fromAddress}`,
    `Livraison : ${quote.toAddress}`,
    quote.weightKg ? `Poids : ${quote.weightKg} kg` : null,
    quote.volumeM3 ? `Volume : ${quote.volumeM3} m³` : null,
    quote.pieces && quote.pieces > 1 ? `${quote.pieces} colis` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const lines = [
    {
      label: label || `Transport ${ZONES[zone]?.label.fr ?? zone} — service ${SERVICES[service]?.label.fr ?? service}`,
      detail,
      quantity: 1,
      unit: "forfait",
      unitPriceCents: acceptedCents,
    },
  ];
  return { lines, acceptedCents };
}

/** Validité d'un devis, en jours. */
export const VALIDITE_JOURS = 15;
/**
 * Statuts de commande (clés DB inchangées) :
 *  - nouveau = « Devis généré / En attente de paiement » (accepte = ancien statut équivalent) ;
 *  - paye    = « Commande confirmée » — posé uniquement par la notification myPOS.
 */
export const WAITING_STATUSES = ["nouveau", "accepte"];
export const CONFIRMED_STATUSES = ["paye", "en_cours", "livre"];
/** Statuts où le paiement en ligne est ouvert (ou la facture déjà émise, reprise). */
export const PAYABLE_STATUSES = [...WAITING_STATUSES, ...CONFIRMED_STATUSES];

export const isExpired = (q: { validUntil: Date | null; createdAt: Date }) =>
  Date.now() > (q.validUntil ?? new Date(q.createdAt.getTime() + VALIDITE_JOURS * 86400000)).getTime();
