import { and, asc, eq, like } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { buildInvoicePdf } from "../lib/invoice-pdf";
import { createInvoice } from "../lib/invoicing";
import { itemsFromQuote } from "../lib/quote-items";
import { mailProforma } from "./email";

type Quote = typeof schema.quotes.$inferSelect;

/** Proforma PF existante du devis (une seule par devis). */
export async function findProforma(quoteRef: string) {
  const [pf] = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.quoteRef, quoteRef), like(schema.invoices.number, "PF-%")))
    .limit(1);
  return pf ?? null;
}

/**
 * Émet (ou retrouve) la facture proforma PF-AAAA-NNNN du devis, au montant exact
 * du devis (garde-fou central de createInvoice). Idempotent par devis.
 */
export async function issueProforma(quote: Quote, label?: string | null) {
  const existing = await findProforma(quote.ref);
  if (existing) return { invoice: existing, created: false };
  const { lines } = itemsFromQuote(quote, label);
  const { invoice } = await createInvoice({
    numberPrefix: "PF",
    quoteRef: quote.ref,
    userId: quote.userId ?? null,
    customerName: quote.customerName,
    customerEmail: quote.customerEmail,
    customerPhone: quote.customerPhone,
    customerCompany: quote.company,
    customerAddress: quote.fromAddress,
    subject: `Devis n° ${quote.orderNumber ?? quote.ref}`,
    items: lines,
    locale: quote.locale === "en" ? "en" : "fr",
    dueInDays: 15,
    totalTtcCents: quote.priceTtcCents,
  });
  return { invoice, created: true };
}

/**
 * Statut « Devis généré / En attente de paiement » : proforma PDF + e-mail client
 * avec bouton vers /paiement/:ref. Ne bloque jamais la création du devis.
 */
export async function sendProforma(
  quote: Quote,
  opts: { serviceLabel?: string | null; lineLabel?: string | null; lines?: { label: string; amount: number }[] } = {},
) {
  try {
    const { invoice } = await issueProforma(quote, opts.lineLabel);
    const items = await db
      .select()
      .from(schema.invoiceItems)
      .where(eq(schema.invoiceItems.invoiceId, invoice.id))
      .orderBy(asc(schema.invoiceItems.position));
    const pdf = await buildInvoicePdf(invoice, items);
    await mailProforma({
      to: quote.customerEmail,
      name: quote.customerName,
      firstName: quote.customerFirstName,
      ref: quote.ref,
      orderNumber: quote.orderNumber,
      proformaNumber: invoice.number,
      priceCents: quote.priceCents,
      ttcCents: invoice.totalCents,
      lines: opts.lines,
      validUntil: quote.validUntil,
      from: quote.fromAddress,
      to_: quote.toAddress,
      etaMin: quote.etaMin,
      etaMax: quote.etaMax,
      serviceLabel: opts.serviceLabel,
      pdfBase64: Buffer.from(pdf).toString("base64"),
    });
    return invoice.number;
  } catch (err) {
    console.error(`[proforma] devis ${quote.ref} : proforma/e-mail en échec :`, err);
    return null;
  }
}
