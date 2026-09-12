import { asc, eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { mailInvoicePaid } from "./email";
import { publishJobOffer } from "./job-offers";
import { buildInvoicePdf } from "../lib/invoice-pdf";
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
 * Encaisse une facture après notification myPOS vérifiée :
 * facture → payee, paiement enregistré, commande liée → paye, e-mail de confirmation.
 * Idempotent : une seconde notification pour la même facture ne duplique rien.
 */
export async function settleMyposPayment(input: SettleInput): Promise<SettleResult> {
  const [invoice] = await db
    .select()
    .from(schema.invoices)
    .where(eq(schema.invoices.number, input.orderId))
    .limit(1);
  if (!invoice) return { ok: false, error: "facture inconnue", status: 404 };

  if (invoice.status === "payee") return { ok: true, alreadyPaid: true };

  // Contrôle du montant : myPOS renvoie un montant décimal (ex. "117.00").
  if (input.amount) {
    const cents = Math.round(Number.parseFloat(input.amount) * 100);
    if (Number.isFinite(cents) && Math.abs(cents - invoice.totalCents) > 1) {
      return { ok: false, error: "montant non concordant", status: 409 };
    }
  }

  const reference = input.transactionRef ?? invoice.number;
  await db
    .update(schema.invoices)
    .set({
      status: "payee",
      paymentMethod: "carte_mypos",
      paymentReference: reference,
      paidAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(schema.invoices.id, invoice.id));

  if (invoice.quoteRef) {
    await db.insert(schema.payments).values({
      quoteRef: invoice.quoteRef,
      provider: "carte_mypos",
      amountCents: invoice.totalCents,
      status: "confirme",
      reference,
      payerEmail: invoice.customerEmail,
    });
    await db.update(schema.quotes).set({ status: "paye" }).where(eq(schema.quotes.ref, invoice.quoteRef));
    // Commande payée par carte → publication de la course aux livreurs disponibles.
    await publishJobOffer(invoice.quoteRef).catch(() => null);
  }

  await db.insert(schema.auditLog).values({
    userId: null,
    userEmail: invoice.customerEmail,
    action: "invoice.payee.mypos",
    target: invoice.number,
  });

  // Facture PDF + e-mail + inscription à la base emailing.
  // Encapsulé : un échec ici ne doit jamais empêcher la facture d'être payée.
  const paidAt = new Date();
  try {
    const items = await db
      .select()
      .from(schema.invoiceItems)
      .where(eq(schema.invoiceItems.invoiceId, invoice.id))
      .orderBy(asc(schema.invoiceItems.position));

    const pdf = await buildInvoicePdf(
      { ...invoice, status: "payee", paymentMethod: "carte_mypos", paymentReference: reference, paidAt },
      items,
    );

    await mailInvoicePaid({
      to: invoice.customerEmail,
      name: invoice.customerName,
      number: invoice.number,
      subject: invoice.subject ?? "Prestation de transport",
      totalCents: invoice.totalCents,
      paidAt,
      paymentReference: reference,
      pdfBase64: Buffer.from(pdf).toString("base64"),
      unsubscribeUrl: unsubscribeUrl(invoice.customerEmail),
    });
  } catch (err) {
    console.error(`[mypos] facture ${invoice.number} encaissée mais e-mail/PDF en échec :`, err);
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
