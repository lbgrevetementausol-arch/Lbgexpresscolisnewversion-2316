import { Link, useParams } from "wouter";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Package, ShieldCheck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { CONTACT, dateOnly, money, moneyCents, whatsappLink } from "../lib/format";
import { Section } from "../components/site/section";
import { Card } from "../components/site/section";
import { PageHero } from "../components/site/layout";
import { PayButton, TransferNotice } from "../components/site/pay-button";
import { useQuote } from "../queries/quotes";

export default function PaiementPage() {
  const { t, lang } = useI18n();
  const params = useParams<{ ref?: string }>();
  const ref = (params.ref ?? "").toUpperCase();
  const quote = useQuote(ref);

  if (quote.isLoading) {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-xl text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted">{t({ fr: "Chargement du devis…", en: "Loading the quote…" })}</p>
        </Card>
      </Section>
    );
  }

  if (quote.isError || !quote.data) {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-xl">
          <p className="flex items-center gap-2 font-display text-lg font-bold text-danger">
            <AlertTriangle className="size-5" />
            {t({ fr: "Devis introuvable", en: "Quote not found" })}
          </p>
          <p className="mt-3 text-sm text-muted">
            {t({
              fr: `Aucun devis ne correspond à la référence ${ref}. Vérifiez le lien reçu par email ou refaites une demande.`,
              en: `No quote matches reference ${ref}. Check the link you received by email or request a new quote.`,
            })}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/devis"
              className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              {t({ fr: "Nouveau devis", en: "New quote" })}
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

  const q = quote.data;
  const paid = q.payment
    ? {
        reference: q.payment.reference ?? "",
        status: q.payment.status,
        amount: q.payment.amountCents / 100,
        trackingNumber: q.trackingNumber,
      }
    : null;

  return (
    <>
      <PageHero
        eyebrow={t({ fr: `Devis ${q.ref}`, en: `Quote ${q.ref}` })}
        title={
          paid
            ? t({ fr: "Commande enregistrée", en: "Order recorded" })
            : t({ fr: "Réglez votre expédition", en: "Pay for your shipment" })
        }
        lead={
          paid
            ? t({
                fr: "Votre numéro de suivi est actif : vous et votre destinataire pouvez suivre le colis en temps réel.",
                en: "Your tracking number is live: you and your recipient can follow the parcel in real time.",
              })
            : t({
                fr: "Le prix est ferme. Choisissez votre moyen de paiement, l'enlèvement est planifié dès confirmation.",
                en: "The price is firm. Pick your payment method — pickup is scheduled as soon as it's confirmed.",
              })
        }
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          {/* Colonne paiement */}
          <div className="grid gap-6">
            {paid ? (
              <Card hover={false}>
                <p className="flex items-center gap-2 font-display text-lg font-bold text-success">
                  <CheckCircle2 className="size-5" />
                  {paid.status === "en_attente"
                    ? t({ fr: "Virement en attente de réception", en: "Transfer pending receipt" })
                    : t({ fr: "Paiement confirmé", en: "Payment confirmed" })}
                </p>
                <dl className="mt-5 grid gap-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{t({ fr: "Référence paiement", en: "Payment reference" })}</dt>
                    <dd className="font-mono text-xs">{paid.reference}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted">{t({ fr: "Montant", en: "Amount" })}</dt>
                    <dd className="font-display font-bold">{money(paid.amount, lang)}</dd>
                  </div>
                  {paid.trackingNumber ? (
                    <div className="flex justify-between gap-3">
                      <dt className="text-muted">{t({ fr: "Numéro de suivi", en: "Tracking number" })}</dt>
                      <dd className="font-mono text-xs text-primary">{paid.trackingNumber}</dd>
                    </div>
                  ) : null}
                </dl>

                {paid.status === "en_attente" ? (
                  <div className="mt-5 rounded-card border border-warning/40 bg-warning/10 p-4 text-sm">
                    <p className="font-semibold text-warning">
                      {t({ fr: "Prochaine étape", en: "Next step" })}
                    </p>
                    <p className="mt-1 text-muted">
                      {t({
                        fr: `Nos coordonnées bancaires vous sont envoyées à ${q.customerEmail}. Indiquez la référence ${q.ref} dans le libellé : l'enlèvement est planifié dès réception des fonds.`,
                        en: `Our bank details are being sent to ${q.customerEmail}. Put reference ${q.ref} in the transfer label: pickup is scheduled as soon as the funds arrive.`,
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-muted">
                    {t({
                      fr: "Un email de confirmation part immédiatement. Notre exploitation vous contacte pour fixer le créneau d'enlèvement.",
                      en: "A confirmation email is on its way. Our operations team will contact you to set the pickup slot.",
                    })}
                  </p>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {q.trackingNumber ? (
                    <Link
                      to={`/suivi?n=${q.trackingNumber}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
                    >
                      <Package className="size-4" />
                      {t({ fr: "Suivre mon colis", en: "Track my parcel" })}
                    </Link>
                  ) : null}
                  <a
                    href={whatsappLink(
                      t({
                        fr: `Bonjour, je viens de régler le devis ${q.ref}.`,
                        en: `Hello, I've just paid quote ${q.ref}.`,
                      }),
                    )}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold transition hover:border-primary/50"
                  >
                    {t({ fr: "Confirmer sur WhatsApp", en: "Confirm on WhatsApp" })}
                  </a>
                </div>
              </Card>
            ) : (
              <Card hover={false}>
                <h2 className="font-display text-xl font-bold">
                  {t({ fr: "Moyen de paiement", en: "Payment method" })}
                </h2>
                <p className="mt-2 text-sm text-muted">
                  {t({
                    fr: "Le règlement par carte se fait sur notre page de paiement sécurisée MyPOS. Nous éditons d'abord votre facture professionnelle numérotée.",
                    en: "Card payments run on our secure MyPOS page. We first issue your numbered professional invoice.",
                  })}
                </p>

                <div className="mt-6 grid gap-4">
                  <PayButton
                    target={{ quoteRef: q.ref }}
                    label={t({
                      fr: `Payer ${moneyCents(q.priceCents, lang)} par carte`,
                      en: `Pay ${moneyCents(q.priceCents, lang)} by card`,
                    })}
                    className="w-full py-3.5"
                  />
                  <TransferNotice />
                </div>

                <p className="mt-4 flex items-center justify-center gap-2 text-xs text-muted">
                  <ShieldCheck className="size-3.5" />
                  {t({
                    fr: "Aucune donnée bancaire n'est stockée sur nos serveurs.",
                    en: "No banking data is stored on our servers.",
                  })}
                </p>
              </Card>
            )}

            <Card hover={false}>
              <h3 className="font-display text-base font-bold">{t({ fr: "Détail du trajet", en: "Route details" })}</h3>
              <dl className="mt-4 grid gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">{t({ fr: "Départ", en: "From" })}</dt>
                  <dd>{q.fromAddress}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted">{t({ fr: "Arrivée", en: "To" })}</dt>
                  <dd>{q.toAddress}</dd>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">{t({ fr: "Type", en: "Type" })}</dt>
                    <dd className="capitalize">{q.kind}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">Service</dt>
                    <dd className="capitalize">{q.service}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">{t({ fr: "Zone", en: "Zone" })}</dt>
                    <dd className="capitalize">{q.zone}</dd>
                  </div>
                </div>
                {q.goodsDescription ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted">
                      {t({ fr: "Marchandise", en: "Goods" })}
                    </dt>
                    <dd className="text-muted">{q.goodsDescription}</dd>
                  </div>
                ) : null}
              </dl>
            </Card>
          </div>

          {/* Récapitulatif */}
          <Card hover={false} className="lg:sticky lg:top-28">
            <h2 className="font-display text-lg font-bold">{t({ fr: "Récapitulatif", en: "Summary" })}</h2>
            <p className="mt-1 font-mono text-xs text-primary">{q.ref}</p>

            <ul className="mt-5 grid gap-2 text-sm">
              {q.breakdown.map((line) => (
                <li key={line.key} className="flex justify-between gap-3">
                  <span className="text-muted">{t(line.label)}</span>
                  <span>{money(line.amount, lang)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="text-sm text-muted">{t({ fr: "Total TTC", en: "Total incl. VAT" })}</span>
              <span className="font-display text-3xl font-extrabold text-primary">
                {moneyCents(q.priceCents, lang)}
              </span>
            </div>

            <div className="mt-5 grid gap-2 text-sm text-muted">
              {q.etaMin && q.etaMax ? (
                <p className="flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  {t({
                    fr: `Livraison estimée en ${q.etaMin} à ${q.etaMax} jours ouvrés`,
                    en: `Estimated delivery in ${q.etaMin} to ${q.etaMax} working days`,
                  })}
                </p>
              ) : null}
              <p className="flex items-center gap-2">
                <Package className="size-4 text-primary" />
                {t({ fr: "Devis émis le", en: "Quote issued on" })} {dateOnly(q.createdAt, lang)}
              </p>
              {q.insurance ? (
                <p className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-primary" />
                  {t({ fr: "Assurance ad valorem incluse", en: "Ad valorem insurance included" })}
                </p>
              ) : null}
            </div>

            <div className="mt-6 border-t border-border pt-5 text-sm">
              <p className="text-muted">{t({ fr: "Une question sur ce devis ?", en: "A question on this quote?" })}</p>
              <a href={CONTACT.phoneHref} className="mt-1 block font-display font-bold text-primary">
                {CONTACT.phone}
              </a>
              <a href={`mailto:${CONTACT.email}`} className="text-muted hover:text-foreground">
                {CONTACT.email}
              </a>
            </div>
          </Card>
        </div>
      </Section>
    </>
  );
}
