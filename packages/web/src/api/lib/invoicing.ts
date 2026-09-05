import { desc, like } from "drizzle-orm";
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

/** Numérotation séquentielle FA-AAAA-NNNN, sans trou dans l'année en cours. */
export async function nextInvoiceNumber(now = new Date()) {
  const year = now.getFullYear();
  const prefix = `FA-${year}-`;
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
    return {
      label: item.label,
      detail: item.detail ?? null,
      quantity,
      unit: item.unit ?? "forfait",
      unitPriceCents: Math.round(item.unitPriceCents),
      totalCents: Math.round(item.unitPriceCents * quantity),
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
}

/** Crée une facture pro numérotée + ses lignes, et renvoie le document complet. */
export async function createInvoice(args: CreateInvoiceArgs) {
  const now = new Date();
  const vatRate = args.vatRate ?? VAT_RATE;
  const { lines, subtotalCents, vatCents, totalCents } = totalsFor(args.items, vatRate);
  const number = await nextInvoiceNumber(now);

  const [invoice] = await db
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
      status: "en_attente_paiement",
      notes: args.notes ?? null,
      locale: args.locale ?? "fr",
      dueAt: new Date(now.getTime() + (args.dueInDays ?? 14) * 86400000),
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  if (lines.length > 0) {
    await db.insert(schema.invoiceItems).values(lines.map((line) => ({ ...line, invoiceId: invoice.id })));
  }

  return { invoice, items: lines };
}
