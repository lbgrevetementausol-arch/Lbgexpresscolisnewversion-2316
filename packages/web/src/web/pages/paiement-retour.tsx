import { useEffect, useMemo } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { Clock, Phone, ShieldCheck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { CONTACT, whatsappLink } from "../lib/format";
import { rememberedMyposInvoice } from "../lib/mypos";
import { trackPurchase } from "../lib/pixels";
import { useInvoice } from "../queries/invoices";
import { Card, Section } from "../components/site/section";
import { PageHero } from "../components/site/layout";

/** Page de retour après passage sur le terminal MyPOS (aucune donnée bancaire ne transite ici). */
export default function PaiementRetourPage() {
  const { t } = useI18n();
  const [params] = useSearchParams();
  const [location] = useLocation();
  // myPOS n'accepte que des URLs de retour sans paramètre : le numéro de facture
  // est repris du sessionStorage posé juste avant le départ vers le terminal.
  const invoice = useMemo(() => params.get("facture") || rememberedMyposInvoice(), [params]);
  const cancelled = location.startsWith("/paiement/annule") || params.get("statut") === "annule";

  // Conversion Purchase (Meta Pixel + GTM), une seule fois par facture meme si
  // le client recharge la page de retour.
  const paid = useInvoice(!cancelled && invoice ? invoice : null);
  const total = paid.data?.invoice.totalCents;
  useEffect(() => {
    if (cancelled || !invoice || typeof total !== "number") return;
    const key = `lbg-purchase-${invoice}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // navigation privee : on accepte le risque d'un doublon plutot que de perdre la conversion
    }
    trackPurchase({ value: total / 100, transaction_id: invoice });
  }, [cancelled, invoice, total]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Paiement", en: "Payment" })}
        title={
          cancelled
            ? t({ fr: "Paiement interrompu", en: "Payment interrupted" })
            : t({ fr: "Merci, votre paiement est en cours de validation", en: "Thanks, your payment is being confirmed" })
        }
        lead={
          cancelled
            ? t({
                fr: "Le paiement par carte n'a pas été finalisé : aucun montant n'a été débité. Vous pouvez réessayer depuis votre facture ou régler par virement.",
                en: "The card payment wasn't completed: nothing has been charged. You can retry from your invoice or pay by bank transfer.",
              })
            : t({
                fr: "Notre équipe vérifie le règlement sur le terminal MyPOS et passe votre facture en « Payée ». Vous recevez la confirmation par email.",
                en: "Our team checks the payment on the MyPOS terminal and switches your invoice to “Paid”. You'll get an email confirmation.",
              })
        }
      />
      <Section>
        <div className="mx-auto grid max-w-3xl gap-4">
          <Card hover={false}>
            <p className="flex items-center gap-2 font-semibold">
              <Clock className="size-4 text-primary" />
              {t({ fr: "Prochaine étape", en: "Next step" })}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {cancelled
                ? t({
                    fr: "Votre facture reste ouverte et payable : reprenez le paiement par carte depuis sa page, ou demandez-nous nos coordonnées bancaires pour un virement.",
                    en: "Your invoice stays open and payable: resume the card payment from its page, or ask us for our bank details to pay by transfer.",
                  })
                : t({
                    fr: "La validation est manuelle (contrôle humain du règlement) et intervient sous quelques heures ouvrées. Dès validation, l'enlèvement est planifié et votre numéro de suivi est généré.",
                    en: "Confirmation is manual (a human checks the payment) and happens within a few business hours. Once confirmed, pickup is scheduled and your tracking number is issued.",
                  })}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {invoice ? (
                <Link
                  to={`/facture/${invoice}`}
                  className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
                >
                  {cancelled
                    ? t({ fr: "Reprendre le paiement", en: "Resume the payment" })
                    : t({ fr: "Revoir ma facture", en: "View my invoice" })}
                </Link>
              ) : null}
              <Link
                to="/espace-client"
                className="rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition hover:border-primary/50"
              >
                {t({ fr: "Mon espace client", en: "My customer area" })}
              </Link>
            </div>
          </Card>

          <Card hover={false}>
            <p className="flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-4 text-primary" />
              {t({ fr: "Un doute sur le paiement ?", en: "Unsure about the payment?" })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a
                href={CONTACT.phoneHref}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
              >
                <Phone className="size-4 text-primary" />
                {CONTACT.phone}
              </a>
              <a
                href={whatsappLink(
                  cancelled
                    ? invoice
                      ? `Bonjour, le paiement par carte de la facture ${invoice} n'a pas abouti.`
                      : "Bonjour, mon paiement par carte n'a pas abouti."
                    : invoice
                      ? `Bonjour, j'ai réglé la facture ${invoice} par carte.`
                      : "Bonjour, je viens de régler par carte.",
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
              >
                WhatsApp
              </a>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
