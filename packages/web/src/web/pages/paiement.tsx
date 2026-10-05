import { Link, useParams } from "wouter";
import { AlertTriangle, CheckCircle2, Clock, Loader2, Package, ShieldCheck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { CONTACT, dateOnly, money, moneyCents, whatsappLink } from "../lib/format";
import { Section } from "../components/site/section";
import { Card } from "../components/site/section";
import { PageHero } from "../components/site/layout";
import { PayButton, TransferNotice } from "../components/site/pay-button";
import { useState } from "react";
import { useAcceptQuote, useQuote } from "../queries/quotes";
import { trackFunnel } from "../lib/pixels";

const ACCEPTED = ["accepte", "paye", "en_cours", "livre"];

/** Acceptation explicite du devis : obligatoire avant tout paiement. */
function AcceptQuote({
  reference,
  status,
  expired,
  ttcCents,
  onDone,
}: {
  reference: string;
  status: string;
  expired: boolean;
  ttcCents: number;
  onDone: () => void;
}) {
  const { t, lang } = useI18n();
  const [checked, setChecked] = useState(false);
  const accept = useAcceptQuote();
  if (status === "a_valider") {
    return (
      <p className="rounded-xl border border-border bg-surface-2/60 p-4 text-sm text-muted">
        {t({
          fr: "Votre demande est en cours de vérification par notre équipe. Nous vous recontactons avec votre devis définitif.",
          en: "Our team is reviewing your request. We will get back to you with your final quote.",
        })}
      </p>
    );
  }
  if (status !== "nouveau" || expired) {
    return (
      <p className="rounded-xl border border-border bg-surface-2/60 p-4 text-sm text-muted">
        {expired
          ? t({ fr: "Ce devis a expiré (validité 15 jours). Demandez un nouveau devis.", en: "This quote has expired (15-day validity). Please request a new one." })
          : t({ fr: "Ce devis n'est plus valable.", en: "This quote is no longer valid." })}
      </p>
    );
  }
  return (
    <div className="grid gap-3">
      <label className="flex cursor-pointer items-start gap-3 text-sm">
        <input
          type="checkbox"
            className="mt-1 size-4 accent-[var(--primary)]"
            aria-label="Accepter le devis"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
        />
        <span>
          {t({
            fr: `J'accepte ce devis de ${moneyCents(ttcCents, lang)} TTC, prix ferme sous réserve que le volume et les accès soient conformes à ma déclaration.`,
            en: `I accept this quote of ${moneyCents(ttcCents, lang)} incl. VAT, firm price provided the volume and access match my description.`,
          })}
        </span>
      </label>
      <button
        type="button"
        disabled={!checked || accept.isPending}
        onClick={() =>
          accept.mutate(
            { ref: reference, accept: true },
            {
              onSuccess: (r) => {
                if (!r.already) trackFunnel("quote_accepted", { value: ttcCents / 100, currency: "EUR", quote_id: reference });
                onDone();
              },
            },
          )
        }
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-50"
      >
        {accept.isPending ? <Loader2 className="size-5 animate-spin" /> : t({ fr: "Accepter le devis", en: "Accept the quote" })}
      </button>
      {accept.isError ? (
        <p className="flex items-start gap-2 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          {accept.error instanceof Error ? accept.error.message : t({ fr: "Erreur, réessayez.", en: "Error, please retry." })}
        </p>
      ) : null}
    </div>
  );
}

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
        eyebrow={
          q.orderNumber
            ? ACCEPTED.includes(q.status)
              ? t({ fr: `Commande n° ${q.orderNumber}`, en: `Order no. ${q.orderNumber}` })
              : t({ fr: `Devis n° ${q.orderNumber}`, en: `Quote no. ${q.orderNumber}` })
            : t({ fr: `Devis ${q.ref}`, en: `Quote ${q.ref}` })
        }
        title={
          paid
            ? t({ fr: "Commande enregistrée", en: "Order recorded" })
            : ACCEPTED.includes(q.status)
              ? t({ fr: "Réglez votre commande", en: "Pay for your order" })
              : t({ fr: "Votre devis", en: "Your quote" })
        }
        lead={
          paid
            ? t({
                fr: "Votre numéro de suivi est actif : vous et votre destinataire pouvez suivre le colis en temps réel.",
                en: "Your tracking number is live: you and your recipient can follow the parcel in real time.",
              })
            : t({
                fr: "Acceptez le devis (valable 15 jours) puis choisissez votre moyen de paiement ; la prestation est planifiée dès confirmation.",
                en: "Accept the quote (valid 15 days), then pick your payment method; the service is scheduled once confirmed.",
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
                  {!ACCEPTED.includes(q.status) ? (
                    <AcceptQuote reference={q.ref} status={q.status} expired={q.expired} ttcCents={q.priceTtcCents} onDone={() => quote.refetch()} />
                  ) : (
                  <>
                  <PayButton
                    target={{ quoteRef: q.ref }}
                    label={t({
                      fr: `Payer ${moneyCents(q.priceTtcCents, lang)} par carte`,
                      en: `Pay ${moneyCents(q.priceTtcCents, lang)} by card`,
                    })}
                    className="w-full py-3.5"
                  />
                  <TransferNotice />
                  </>
                  )}
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
            {q.orderNumber ? (
              <div className="mt-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                  {t({ fr: "Votre numéro de commande", en: "Your order number" })}
                </p>
                <p className="font-display text-2xl font-extrabold text-primary">{q.orderNumber}</p>
                <p className="mt-1 text-xs text-muted">
                  {t({
                    fr: "Gardez ce numéro : il suffit de le donner par téléphone ou par e-mail.",
                    en: "Keep this number: just quote it by phone or email.",
                  })}
                </p>
              </div>
            ) : null}
            <p className="mt-2 font-mono text-xs text-muted">{q.ref}</p>

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
                {moneyCents(q.priceTtcCents, lang)}
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
