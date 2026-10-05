import { and, asc, eq, ne } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { mailOrderConfirmed } from "./email";
import { publishJobOffer } from "./job-offers";
import { buildInvoicePdf, buildReceiptPdf } from "../lib/invoice-pdf";
import { createInvoice, isProforma } from "../lib/invoicing";
import { unsubscribeUrl } from "../lib/unsubscribe-token";

export interface SettleInput {
  /** OrderID renvoyé par myPOS — c'est le numéro de facture. */
  orderId: string;
  amount?: string | null;
  currency?: string | null;
  transactionRef?: string | null;
}

export type SettleResult =
  | { ok: true; alreadyPaid: boolean }
  | { ok: false; error: string; status: 400 | 404 | 409 };

/**
 * Seul déclencheur de « Commande confirmée » : notification myPOS vérifiée (signature RSA).
 *  - OrderID = proforma PF-… (nouveau parcours) : PF → payee, facture définitive FA émise
 *    payée au même montant, commande → paye ;
 *  - OrderID = facture FA-… (anciennes commandes) : FA → payee, commande → paye.
 * Puis paiement enregistré, course publiée aux livreurs, e-mail de confirmation avec
 * quittance de paiement myPOS. Idempotent : le passage en « payee » est un update
 * conditionnel, une notification rejouée ou simultanée ne duplique rien.
 */
export async function settleMyposPayment(input: SettleInput): Promise<SettleResult> {
  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.number, input.orderId))
    .limit(1);
  if (!invoice) return { ok: false, error: "facture inconnue", status: 404 };
  if (invoice.number.startsWith("AV-")) return { ok: false, error: "avoir non payable", status: 409 };

  if (invoice.status === "payee") return { ok: true, alreadyPaid: true };
  if (invoice.status === "annulee") return { ok: false, error: "facture annulée", status: 409 };

  // Contrôle du montant : myPOS renvoie un montant décimal (ex. "117.00").
  if (input.amount) {
    const cents = Math.round(Number.parseFloat(input.amount) * 100);
    if (Number.isFinite(cents) && Math.abs(cents - invoice.totalCents) > 1) {
      return { ok: false, error: "montant non concordant", status: 409 };
    }
  }

  const reference = input.transactionRef ?? invoice.number;
  const paidAt = new Date();
  const claimed = await db
    .update(schema.invoices)
    .set({
      status: "payee",
      paymentMethod: "carte_mypos",
      paymentReference: reference,
      paidAt,
      updatedAt: paidAt,
    })
    .where(and(eq(schema.invoices.id, invoice.id), ne(schema.invoices.status, "payee")))
    .returning({ id: schema.invoices.id });
  if (claimed.length === 0) return { ok: true, alreadyPaid: true };

  const pfItems = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, invoice.id))
    .orderBy(asc(schema.invoiceItems.position));

  // Proforma payée → facture définitive FA, émise directement « payée ».
  let finalInvoice: typeof schema.invoices.$inferSelect = { ...invoice, status: "payee", paymentMethod: "carte_mypos", paymentReference: reference, paidAt };
  let finalItems = pfItems;
  if (isProforma(invoice.number)) {
    try {
      const created = await createInvoice({
        numberPrefix: "FA",
        status: "payee",
        quoteRef: invoice.quoteRef,
        userId: invoice.userId,
        customerName: invoice.customerName,
        customerEmail: invoice.customerEmail,
        customerPhone: invoice.customerPhone,
        customerCompany: invoice.customerCompany,
        customerAddress: invoice.customerAddress,
        subject: invoice.subject ?? "Prestation de transport",
        notes: `Facture définitive de la proforma ${invoice.number}`,
        items: pfItems.map((it) => ({
          label: it.label,
          detail: it.detail,
          quantity: it.quantity,
          unit: it.unit,
          unitPriceCents: it.unitPriceCents,
        })),
        locale: invoice.locale === "en" ? "en" : "fr",
        vatRate: invoice.vatRate,
        dueInDays: 0,
        totalTtcCents: invoice.totalCents,
      });
      await db
        .update(schema.invoices)
        .set({ paymentMethod: "carte_mypos", paymentReference: reference, paidAt, updatedAt: paidAt })
        .where(eq(schema.invoices.id, created.invoice.id));
      await db
        .update(schema.invoices)
        .set({ notes: `Payée — facture définitive ${created.invoice.number}` })
        .where(eq(schema.invoices.id, invoice.id));
      finalInvoice = { ...created.invoice, paymentMethod: "carte_mypos", paymentReference: reference, paidAt };
      finalItems = await db
        .select()
        .from(schema.invoiceItems)
        .where(eq(schema.invoiceItems.invoiceId, created.invoice.id))
        .orderBy(asc(schema.invoiceItems.position));
    } catch (err) {
      // Le paiement est acquis : on confirme quand même, la FA sera émise depuis le back-office.
      console.error(`[mypos] proforma ${invoice.number} payée mais facture FA non émise :`, err);
    }
  }

  let quote: typeof schema.quotes.$inferSelect | undefined;
  if (invoice.quoteRef) {
    [quote] = await db.select().from(schema.quotes).where(eq(schema.quotes.ref, invoice.quoteRef)).limit(1);
    await db.insert(schema.payments).values({
      quoteRef: invoice.quoteRef,
      provider: "carte_mypos",
      amountCents: invoice.totalCents,
      status: "confirme",
      reference,
      payerEmail: invoice.customerEmail,
    });
    // « Commande confirmée » = statut paye.
    await db
      .update(schema.quotes)
      .set({ status: "paye", invoiceId: finalInvoice.id })
      .where(eq(schema.quotes.ref, invoice.quoteRef));
    if (quote?.trackingNumber) {
      await db.insert(schema.trackingEvents).values({
        trackingNumber: quote.trackingNumber,
        status: "cree",
        labelFr: "Paiement myPOS reçu — commande confirmée",
        labelEn: "myPOS payment received — order confirmed",
        location: quote.fromAddress,
      });
    }
    // Commande payée par carte → publication de la course aux livreurs disponibles.
    await publishJobOffer(invoice.quoteRef).catch(() => null);
  }

  await db.insert(schema.auditLog).values({
    userId: null,
    userEmail: invoice.customerEmail,
    action: "invoice.payee.mypos",
    target: invoice.number,
    detail: finalInvoice.number !== invoice.number ? `facture ${finalInvoice.number}` : null,
  });

  // Quittance + facture PDF + e-mail de confirmation + inscription emailing.
  // Encapsulé : un échec ici ne doit jamais empêcher l'encaissement.
  try {
    const receipt = await buildReceiptPdf({
      invoiceNumber: finalInvoice.number,
      proformaNumber: isProforma(invoice.number) ? invoice.number : null,
      orderNumber: quote?.orderNumber ?? null,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      subject: invoice.subject,
      totalCents: invoice.totalCents,
      paidAt,
      transactionRef: reference,
    });
    const pdf = isProforma(finalInvoice.number) ? null : await buildInvoicePdf(finalInvoice, finalItems);

    await mailOrderConfirmed({
      to: invoice.customerEmail,
      name: invoice.customerName,
      ref: invoice.quoteRef,
      orderNumber: quote?.orderNumber ?? null,
      invoiceNumber: finalInvoice.number,
      proformaNumber: isProforma(invoice.number) ? invoice.number : null,
      subject: invoice.subject ?? "Prestation de transport",
      totalCents: invoice.totalCents,
      paidAt,
      paymentReference: reference,
      receiptPdfBase64: Buffer.from(receipt).toString("base64"),
      invoicePdfBase64: pdf ? Buffer.from(pdf).toString("base64") : null,
      unsubscribeUrl: unsubscribeUrl(invoice.customerEmail),
    });
  } catch (err) {
    console.error(`[mypos] ${invoice.number} encaissée mais e-mail/PDF en échec :`, err);
  }

  try {
    await addToNewsletter(invoice);
  } catch (err) {
    console.error(`[mypos] inscription newsletter impossible pour ${invoice.customerEmail} :`, err);
  }

  return { ok: true, alreadyPaid: false };
}

/**
 * Soft opt-in client (art. L34-5 CPCE) : un client ayant payé une prestation
 * peut être prospecté sur des services analogues, à condition d'être informé
 * et de disposer d'un lien de désinscription — les deux figurent dans l'e-mail
 * de confirmation. Source "achat" pour rester séparable du consentement popup.
 */
async function addToNewsletter(invoice: typeof schema.invoices.$inferSelect) {
  const email = invoice.customerEmail.trim().toLowerCase();
  if (!email) return;

  const [existing] = await db
    .select()
    .from(schema.newsletterSubscribers)
    .where(eq(schema.newsletterSubscribers.email, email))
    .limit(1);

  if (existing) return; // déjà connu : on ne réactive pas un désabonné.

  await db.insert(schema.newsletterSubscribers).values({
    email,
    name: invoice.customerName?.trim() || null,
    source: "achat",
    locale: invoice.locale === "en" ? "en" : "fr",
  });
}
