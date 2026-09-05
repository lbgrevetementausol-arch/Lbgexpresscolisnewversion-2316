import { useState } from "react";
import { Link, useParams } from "wouter";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  Mail,
  Phone,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "../lib/i18n";
import { CONTACT, dateOnly, moneyCents } from "../lib/format";
import { Card, Section } from "../components/site/section";
import { TransferNotice } from "../components/site/pay-button";
import { useInvoice, useMyposSession } from "../queries/invoices";
import { startMyposPayment } from "../lib/mypos";

const STATUS_LABEL = {
  en_attente_paiement: { fr: "En attente de paiement", en: "Awaiting payment" },
  payee: { fr: "Payée", en: "Paid" },
  annulee: { fr: "Annulée", en: "Cancelled" },
  remboursee: { fr: "Remboursée", en: "Refunded" },
} as const;

export default function FacturePage() {
  const { t, lang } = useI18n();
  const params = useParams<{ numero?: string }>();
  const number = (params.numero ?? "").toUpperCase();
  const invoice = useInvoice(number || null);
  const session = useMyposSession();
  const [payError, setPayError] = useState<string | null>(null);

  const payNow = async () => {
    setPayError(null);
    try {
      const pay = await session.mutateAsync({ number, locale: lang });
      startMyposPayment(pay);
    } catch (err) {
      setPayError(
        err instanceof Error
          ? err.message
          : t({ fr: "Paiement indisponible, réessayez.", en: "Payment unavailable, please retry." }),
      );
    }
  };

  if (invoice.isLoading) {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-xl text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted">{t({ fr: "Chargement de la facture…", en: "Loading invoice…" })}</p>
        </Card>
      </Section>
    );
  }

  if (invoice.isError || !invoice.data) {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-xl">
          <p className="flex items-center gap-2 text-lg font-bold text-danger">
            <AlertTriangle className="size-5" />
            {t({ fr: "Facture introuvable", en: "Invoice not found" })}
          </p>
          <p className="mt-3 text-sm text-muted">
            {t({
              fr: `Aucune facture ne correspond au numéro ${number}. Vérifiez le lien reçu ou contactez-nous.`,
              en: `No invoice matches number ${number}. Check the link you received or contact us.`,
            })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/devis"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              {t({ fr: "Demander un devis", en: "Request a quote" })}
            </Link>
            <a
              href={CONTACT.phoneHref}
              className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition hover:border-primary/50"
            >
              {CONTACT.phone}
            </a>
          </div>
        </Card>
      </Section>
    );
  }

  const { invoice: doc, items, issuer } = invoice.data;
  const paid = doc.status === "payee";
  const status = STATUS_LABEL[doc.status as keyof typeof STATUS_LABEL] ?? STATUS_LABEL.en_attente_paiement;

  return (
    <Section>
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              {t({ fr: "Facture", en: "Invoice" })}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold">{doc.number}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={
                paid
                  ? "inline-flex items-center gap-2 rounded-full border border-success/40 bg-success/10 px-3 py-1.5 text-xs font-semibold text-success"
                  : "inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning"
              }
            >
              {paid ? <CheckCircle2 className="size-3.5" /> : <Clock className="size-3.5" />}
              {status[lang]}
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
            >
              <Printer className="size-4" />
              {t({ fr: "Imprimer / PDF", en: "Print / PDF" })}
            </button>
          </div>
        </div>

        <Card hover={false}>
          <div className="grid gap-8 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {t({ fr: "Émetteur", en: "Issuer" })}
              </p>
              <p className="mt-2 font-semibold">{issuer.company}</p>
              <p className="text-sm text-muted">{issuer.legal}</p>
              <p className="mt-2 text-sm text-muted">{issuer.phone}</p>
              <p className="text-sm text-muted">{issuer.email}</p>
              <p className="text-sm text-muted">{issuer.site}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {t({ fr: "Client", en: "Customer" })}
              </p>
              <p className="mt-2 font-semibold">{doc.customerName}</p>
              {doc.customerCompany ? <p className="text-sm text-muted">{doc.customerCompany}</p> : null}
              <p className="text-sm text-muted">{doc.customerEmail}</p>
              {doc.customerPhone ? <p className="text-sm text-muted">{doc.customerPhone}</p> : null}
              {doc.customerAddress ? <p className="text-sm text-muted">{doc.customerAddress}</p> : null}
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-border pt-6 text-sm sm:grid-cols-3">
            <p>
              <span className="text-muted">{t({ fr: "Date d'émission", en: "Issue date" })} : </span>
              {dateOnly(doc.createdAt, lang)}
            </p>
            <p>
              <span className="text-muted">{t({ fr: "Échéance", en: "Due date" })} : </span>
              {doc.dueAt ? dateOnly(doc.dueAt, lang) : "—"}
            </p>
            <p>
              <span className="text-muted">{t({ fr: "Commande", en: "Order" })} : </span>
              {doc.quoteRef ?? "—"}
            </p>
          </div>

          <p className="mt-6 text-sm font-semibold">{doc.subject}</p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-[0.12em] text-muted">
                  <th className="py-3">{t({ fr: "Prestation", en: "Service" })}</th>
                  <th className="py-3 text-right">{t({ fr: "Qté", en: "Qty" })}</th>
                  <th className="py-3 text-right">{t({ fr: "PU HT", en: "Unit excl. VAT" })}</th>
                  <th className="py-3 text-right">{t({ fr: "Total HT", en: "Total excl. VAT" })}</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 align-top">
                    <td className="py-3 pr-4">
                      <span className="font-medium">{item.label}</span>
                      {item.detail ? <span className="mt-1 block text-xs text-muted">{item.detail}</span> : null}
                    </td>
                    <td className="py-3 text-right">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 text-right">{moneyCents(item.unitPriceCents, lang)}</td>
                    <td className="py-3 text-right font-semibold">{moneyCents(item.totalCents, lang)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 ml-auto grid max-w-xs gap-2 text-sm">
            <p className="flex justify-between">
              <span className="text-muted">{t({ fr: "Total HT", en: "Subtotal excl. VAT" })}</span>
              <span>{moneyCents(doc.subtotalCents, lang)}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-muted">
                {t({ fr: "TVA", en: "VAT" })} {doc.vatRate}%
              </span>
              <span>{moneyCents(doc.vatCents, lang)}</span>
            </p>
            <p className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <span>{t({ fr: "Total TTC", en: "Total incl. VAT" })}</span>
              <span className="text-primary">{moneyCents(doc.totalCents, lang)}</span>
            </p>
          </div>

          {doc.notes ? <p className="mt-6 text-xs text-muted">{doc.notes}</p> : null}
          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-muted">
            {t({
              fr: "Paiement à réception. Pénalités de retard : 3× le taux d'intérêt légal, indemnité forfaitaire de recouvrement de 40 €. Prestation de transport soumise à la TVA française.",
              en: "Payment on receipt. Late payment interest: 3× the legal rate, plus a €40 fixed recovery fee. Transport service subject to French VAT.",
            })}
          </p>
        </Card>

        {paid ? (
          <Card hover={false} className="mt-6">
            <p className="flex items-center gap-2 font-semibold text-success">
              <CheckCircle2 className="size-5" />
              {t({ fr: "Règlement reçu — merci !", en: "Payment received — thank you!" })}
            </p>
            <p className="mt-2 text-sm text-muted">
              {doc.paymentReference
                ? t({
                    fr: `Référence de paiement : ${doc.paymentReference}.`,
                    en: `Payment reference: ${doc.paymentReference}.`,
                  })
                : t({ fr: "Votre expédition est planifiée.", en: "Your shipment is scheduled." })}
            </p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <Card hover={false}>
              <p className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4 text-primary" />
                {t({ fr: "Paiement sécurisé par carte", en: "Secure card payment" })}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t({
                  fr: `Vous êtes redirigé vers notre terminal MyPOS. Indiquez le montant de ${moneyCents(doc.totalCents, lang)} et la référence ${doc.number} dans le champ de commentaire.`,
                  en: `You'll be redirected to our MyPOS terminal. Enter the ${moneyCents(doc.totalCents, lang)} amount and reference ${doc.number} in the comment field.`,
                })}
              </p>
              <button
                type="button"
                onClick={payNow}
                disabled={session.isPending}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
              >
                <CreditCard className="size-4" />
                {session.isPending
                  ? t({ fr: "Ouverture du paiement…", en: "Opening payment…" })
                  : t({ fr: "Payer par carte bancaire", en: "Pay by card" })}
              </button>
              {payError ? <p className="mt-2 text-xs text-danger">{payError}</p> : null}
              <p className="mt-3 text-xs text-muted">
                {t({
                  fr: "Après paiement, revenez sur le site : notre équipe valide le règlement et la facture passe en « Payée ».",
                  en: "After paying, come back to the site: our team confirms the payment and the invoice switches to “Paid”.",
                })}
              </p>
            </Card>
            <TransferNotice />
          </div>
        )}

        <Card hover={false} className="mt-6">
          <p className="text-sm font-semibold">{t({ fr: "Une question sur cette facture ?", en: "A question about this invoice?" })}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
            >
              <Phone className="size-4 text-primary" />
              {CONTACT.phone}
            </a>
            <a
              href={`mailto:${CONTACT.email}?subject=${encodeURIComponent(`Facture ${doc.number}`)}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
            >
              <Mail className="size-4 text-primary" />
              {CONTACT.email}
            </a>
          </div>
        </Card>
      </div>
    </Section>
  );
}
