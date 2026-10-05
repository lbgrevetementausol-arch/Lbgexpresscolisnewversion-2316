import { ORPCError } from "@orpc/server";
import { desc, eq, like } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

/** Coordonnées émetteur des factures (affichées sur le document). */
export const ISSUER = {
  company: "LBG Express Colis",
  legal: "LBG Express Colis — Transport de colis, fret et déménagement",
  phone: "+33 6 95 09 86 88",
  email: "contact@lbgexpresscolis.fr",
  site: "lbgexpresscolis.fr",
  address: "1 rue de Stockholm",
  postalCity: "75008 Paris",
  siret: "893 700 336 00025",
  vat: "FR68893700336",
  ape: "5320Z",
} as const;

export const VAT_RATE = 20;

/** Lien de paiement carte MyPOS. */
export function myposUrl() {
  return process.env.MYPOS_PAYMENT_URL ?? "https://mypos.com/@lbgrevetement";
}

/** Facture proforma (PF-AAAA-NNNN) : document avant paiement, sans valeur comptable. */
export const isProforma = (number: string) => number.startsWith("PF-");

/** Numérotation séquentielle FA-AAAA-NNNN, sans trou dans l'année en cours. */
export async function nextInvoiceNumber(now = new Date(), kind = "FA") {
  const year = now.getFullYear();
  const prefix = `${kind}-${year}-`;
  const rows = await db
    .select({ number: schema.invoices.number })
    .from(schema.invoices)
    .where(like(schema.invoices.number, `${prefix}%`))
    .orderBy(desc(schema.invoices.number))
    .limit(1);
  const last = rows[0]?.number;
  const seq = last ? Number.parseInt(last.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(4, "0")}`;
}

export interface DraftItem {
  label: string;
  detail?: string | null;
  quantity?: number;
  unit?: string;
  unitPriceCents: number;
}

export function totalsFor(items: DraftItem[], vatRate = VAT_RATE) {
  const lines = items.map((item, index) => {
    const quantity = item.quantity ?? 1;
    const unitPriceCents = Math.round(item.unitPriceCents);
    const totalCents = Math.round(unitPriceCents * quantity);

    // Contrôle de cohérence ligne : PU HT × Qté doit toujours égaler le Total HT.
    // On tolère 1 centime d'écart, qui ne peut venir que de l'arrondi sur une
    // quantité décimale (ex. 2,5 m³). Au-delà, la ligne est incohérente et la
    // facture ne doit pas partir chez le client.
    const expected = unitPriceCents * quantity;
    if (Math.abs(totalCents - expected) > 1) {
      throw new Error(
        `Ligne de facture incohérente « ${item.label} » : ` +
          `PU HT ${unitPriceCents} × Qté ${quantity} = ${expected}, or Total HT = ${totalCents}.`,
      );
    }

    return {
      label: item.label,
      detail: item.detail ?? null,
      quantity,
      unit: item.unit ?? "forfait",
      unitPriceCents,
      totalCents,
      position: index,
    };
  });
  const subtotalCents = lines.reduce((sum, line) => sum + line.totalCents, 0);
  const vatCents = Math.round((subtotalCents * vatRate) / 100);
  return { lines, subtotalCents, vatCents, totalCents: subtotalCents + vatCents };
}

export interface CreateInvoiceArgs {
  quoteRef?: string | null;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  customerCompany?: string | null;
  customerAddress?: string | null;
  subject?: string;
  items: DraftItem[];
  notes?: string | null;
  locale?: "fr" | "en";
  vatRate?: number;
  dueInDays?: number;
  /** « FA » facture, « AV » avoir, « PF » facture proforma (numérotations séparées). */
  numberPrefix?: "FA" | "AV" | "PF";
  /** TTC figé au devis : absorbe l'écart d'arrondi (±1 centime) HT×1,2 ≠ TTC affiché. */
  totalTtcCents?: number | null;
  /** Statut initial forcé (ex. FA émise directement « payee » à la confirmation myPOS). */
  status?: string;
}

/** Crée une facture pro numérotée + ses lignes, et renvoie le document complet. */
export async function createInvoice(args: CreateInvoiceArgs) {
  const now = new Date();
  const vatRate = args.vatRate ?? VAT_RATE;
  const computed = totalsFor(args.items, vatRate);
  const { lines, subtotalCents } = computed;
  let { vatCents, totalCents } = computed;
  if (args.totalTtcCents && Math.abs(args.totalTtcCents - totalCents) <= 1) {
    totalCents = args.totalTtcCents;
    vatCents = totalCents - subtotalCents;
  }
  // Garde-fou central (toutes les voies : paiement, back-office) : une facture liée à un
  // devis reprend EXACTEMENT le montant HT du devis accepté. Seul l'avoir y déroge.
  if (args.quoteRef && args.numberPrefix !== "AV") {
    const [quote] = await db
      .select({ priceCents: schema.quotes.priceCents })
      .from(schema.quotes)
      .where(eq(schema.quotes.ref, args.quoteRef))
      .limit(1);
    if (quote && subtotalCents !== quote.priceCents) {
      throw new ORPCError("BAD_REQUEST", {
        message: `Montant facture (${(subtotalCents / 100).toFixed(2)} € HT) différent du devis accepté (${(quote.priceCents / 100).toFixed(2)} € HT).`,
      });
    }
  }
  // Numérotation séquentielle : deux créations simultanées peuvent viser le même
  // numéro → l'index unique refuse la seconde, qui retente avec le suivant.
  let invoice: typeof schema.invoices.$inferSelect | undefined;
  for (let attempt = 0; attempt < 5 && !invoice; attempt++) {
    const number = await nextInvoiceNumber(now, args.numberPrefix ?? "FA");
    try {
      [invoice] = await db
    .insert(schema.invoices)
    .values({
      number,
      quoteRef: args.quoteRef ?? null,
      userId: args.userId ?? null,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone ?? null,
      customerCompany: args.customerCompany ?? null,
      customerAddress: args.customerAddress ?? null,
      subject: args.subject ?? "Prestation de transport",
      subtotalCents,
      vatRate,
      vatCents,
      totalCents,
      status: args.status ?? (args.numberPrefix === "AV" ? "avoir" : "en_attente_paiement"),
      notes: args.notes ?? null,
      locale: args.locale ?? "fr",
      dueAt: new Date(now.getTime() + (args.dueInDays ?? 14) * 86400000),
      createdAt: now,
      updatedAt: now,
    })
    .returning();
    } catch (err) {
      const msg = `${String(err)} ${String((err as { cause?: unknown }).cause ?? "")}`;
      if (attempt === 4 || !msg.includes("UNIQUE")) throw err;
    }
  }
  if (!invoice) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Numérotation de facture impossible." });

  if (lines.length > 0) {
    await db.insert(schema.invoiceItems).values(lines.map((line) => ({ ...line, invoiceId: invoice.id })));
  }

  return { invoice, items: lines };
}
