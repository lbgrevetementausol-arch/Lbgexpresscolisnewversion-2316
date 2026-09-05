import { useLocation, Link } from "wouter";
import { useI18n } from "../lib/i18n";
import { PageHero } from "../components/site/layout";
import { useSeo } from "../lib/seo";
import { Section } from "../components/site/section";
import {
  ANNULATION,
  CGV,
  CONFIDENTIALITE,
  LIVRAISON,
  MENTIONS,
  type Block,
} from "../lib/legal-content";
import type { Bi } from "../lib/i18n";

interface LegalView {
  blocks: Block[];
  eyebrow: Bi;
  title: Bi;
  lead: Bi;
}

const VIEWS: { match: string; view: LegalView }[] = [
  {
    match: "/cgv",
    view: {
      blocks: CGV,
      eyebrow: { fr: "Informations légales", en: "Legal information" },
      title: { fr: "Conditions générales de vente", en: "Terms and conditions of sale" },
      lead: {
        fr: "Les règles qui encadrent nos prestations de transport, de l'enlèvement à la livraison.",
        en: "The rules that frame our transport services, from pickup to delivery.",
      },
    },
  },
  {
    match: "/livraison-delais",
    view: {
      blocks: LIVRAISON,
      eyebrow: { fr: "Avant de commander", en: "Before you order" },
      title: { fr: "Livraison, modes et délais", en: "Delivery methods and lead times" },
      lead: {
        fr: "Ce que nous livrons, où, en combien de temps — et ce que nous ne promettons pas.",
        en: "What we deliver, where, how fast — and what we do not promise.",
      },
    },
  },
  {
    match: "/annulation-remboursement",
    view: {
      blocks: ANNULATION,
      eyebrow: { fr: "Avant de commander", en: "Before you order" },
      title: { fr: "Annulation, retour et remboursement", en: "Cancellation, return and refund" },
      lead: {
        fr: "Barème d'annulation, retours, indemnisation en cas de perte ou d'avarie.",
        en: "Cancellation scale, returns, compensation in the event of loss or damage.",
      },
    },
  },
  {
    match: "/confidentialite",
    view: {
      blocks: CONFIDENTIALITE,
      eyebrow: { fr: "Vos données", en: "Your data" },
      title: { fr: "Politique de confidentialité", en: "Privacy policy" },
      lead: {
        fr: "Quelles données nous collectons, pourquoi, combien de temps et quels sont vos droits.",
        en: "What data we collect, why, for how long, and what your rights are.",
      },
    },
  },
];

const MENTIONS_VIEW: LegalView = {
  blocks: MENTIONS,
  eyebrow: { fr: "Informations légales", en: "Legal information" },
  title: { fr: "Mentions légales", en: "Legal notice" },
  lead: {
    fr: "Cadre juridique, confidentialité, propriété intellectuelle, paiement et règlement des litiges.",
    en: "Legal framework, privacy, intellectual property, payment and dispute resolution.",
  },
};

const RELATED: { href: string; label: Bi }[] = [
  { href: "/mentions-legales", label: { fr: "Mentions légales", en: "Legal notice" } },
  { href: "/cgv", label: { fr: "CGV", en: "Terms of sale" } },
  { href: "/livraison-delais", label: { fr: "Livraison & délais", en: "Delivery & lead times" } },
  {
    href: "/annulation-remboursement",
    label: { fr: "Annulation & remboursement", en: "Cancellation & refund" },
  },
  { href: "/confidentialite", label: { fr: "Confidentialité", en: "Privacy" } },
];

export default function LegalPage() {
  const [location] = useLocation();
  const { t } = useI18n();
  const current = VIEWS.find((v) => location.startsWith(v.match))?.view ?? MENTIONS_VIEW;

  useSeo({
    title: `${t(current.title)} — LBG Express Colis`,
    description: t(current.lead),
    path: location,
    noindex: true,
  });

  return (
    <>
      <PageHero eyebrow={t(current.eyebrow)} title={t(current.title)} lead={t(current.lead)} />

      <Section>
        <div className="max-w-3xl">
          <div className="mt-8 space-y-10">
            {current.blocks.map((block) => (
              <div key={block.title.fr}>
                <h2 className="font-display text-xl font-bold">{t(block.title)}</h2>
                <p className="mt-3 whitespace-pre-line text-[1.0125rem] leading-[1.8] text-muted">
                  {t(block.body)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 border-t border-border pt-6">
            <p className="text-sm font-semibold">
              {t({ fr: "Autres documents", en: "Other documents" })}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {RELATED.filter((r) => !location.startsWith(r.href)).map((r) => (
                <Link
                  key={r.href}
                  to={r.href}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition hover:border-primary hover:text-primary"
                >
                  {t(r.label)}
                </Link>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">
              {t({ fr: "Dernière mise à jour : 1er septembre 2026.", en: "Last updated: 1 September 2026." })}
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
