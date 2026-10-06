import { FileCheck2, Globe2, Plane, Ship } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { FormInternational } from "../components/site/form-international";
import { TrustBadges } from "../components/site/trust-badges";
import { Reveal } from "../components/site/reveal";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { GuidesSection, GUIDES_INTERNATIONAL } from "../components/site/guides";
import { ComparisonTable, ProblemSolution } from "../components/site/solution";

const MODES = [
  {
    icon: Plane,
    fr: "Aérien express",
    en: "Air express",
    descFr: "5 à 10 jours porte-à-porte (délai cible, vous êtes prévenu si la date bouge).",
    descEn: "5 to 10 days door-to-door (target lead time, you are told if it moves).",
  },
  {
    icon: Ship,
    fr: "Maritime groupage",
    en: "Sea groupage",
    descFr: "Cartons, barriques, meubles : 30 à 45 jours, dédouanement inclus.",
    descEn: "Boxes, drums, furniture: 30 to 45 days, clearance included.",
  },
  {
    icon: FileCheck2,
    fr: "Formalités douanières",
    en: "Customs formalities",
    descFr: "Facture commerciale, colisage et dédouanement préparés.",
    descEn: "Commercial invoice, packing list and clearance prepared.",
  },
  {
    icon: Globe2,
    fr: "Livraison finale",
    en: "Final delivery",
    descFr: "À domicile ou en agence partenaire, destinataire prévenu sur WhatsApp.",
    descEn: "At home or at a partner agency, recipient notified on WhatsApp.",
  },
];

const COUNTRIES = [
  { city: "Cotonou", country: { fr: "Bénin", en: "Benin" } },
  { city: "Lomé", country: { fr: "Togo", en: "Togo" } },
  { city: "Bamako", country: { fr: "Mali", en: "Mali" } },
];

export default function InternationalPage() {
  const { t } = useI18n();

  useSeo(SEO_ROUTES["/commande-internationale"]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Commande internationale", en: "International order" })}
        title={t({ fr: "Envoyer un colis à l'étranger, sans mauvaise surprise", en: "Ship abroad, without nasty surprises" })}
        lead={t({
          fr: "Paris → Cotonou, Lomé et Bamako, en aérien ou en maritime. Prix ferme au devis, facture avec TVA, assurance nommée et suivi en ligne du départ jusqu'à la remise au destinataire.",
          en: "Paris → Cotonou, Lomé and Bamako, by air or by sea. Firm quoted price, invoice with VAT, named insurance and online tracking from departure to final handover.",
        })}
        image="/images/aerien.jpg"
        compact
      />

      {/* Formulaire dès le premier écran : c'est l'action attendue en arrivant. */}
      <Section className="py-10 md:py-12" id="devis">
        <Card className="mb-6 border-primary/25 bg-primary/5">
          <p className="text-sm leading-relaxed text-fg sm:text-base">
            {t({
              fr: "Pour un colis de 10 kg vers l'Afrique de l'Ouest, l'envoi classique par Colissimo International vous coûtera 148,99 € (Tarif officiel La Poste - Zone C), tandis que notre solution de fret / covoiturage vous permet de diviser ce coût par deux.",
              en: "For a 10 kg parcel to West Africa, a standard Colissimo International shipment costs €148.99 (official La Poste rate - Zone C), while our freight / shared-load solution lets you halve that cost.",
            })}
          </p>
          <p className="mt-3 text-sm text-muted">
            {t({
              fr: "Notre tarif pour ces 10 kg en aérien : 94,99 €, dédouanement à l'agence locale inclus.",
              en: "Our price for those 10 kg by air: €94.99, local agency clearance included.",
            })}
          </p>
        </Card>
        <FormInternational />
        <TrustBadges className="mt-6" />
      </Section>

      <Section className="border-t border-border bg-surface/40">
        <SectionHead
          eyebrow={t({ fr: "Comment ça marche", en: "How it works" })}
          title={t({ fr: "Aérien ou maritime, nous gérons la chaîne complète", en: "Air or sea, we handle the full chain" })}
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {MODES.map((mode, i) => (
            <Reveal key={mode.fr} delay={i * 70}>
              <Card className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <mode.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{t(mode)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t({ fr: mode.descFr, en: mode.descEn })}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-12">
          <h3 className="font-display text-lg font-bold">
            {t({ fr: "Les destinations que nous desservons", en: "The destinations we serve" })}
          </h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {COUNTRIES.map((c) => (
              <li
                key={c.city}
                className="rounded-full border border-border bg-surface-2/60 px-3.5 py-1.5 text-sm"
              >
                <span className="font-semibold">{c.city}</span>
                <span className="text-muted"> — {t(c.country)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            {t({
              fr: "Une autre destination ? Écrivez-nous : étude au cas par cas.",
              en: "Another destination? Write to us: case-by-case review.",
            })}
          </p>
        </Reveal>
      </Section>

      <ProblemSolution className="border-t border-border" />

      <ComparisonTable className="border-t border-border bg-surface/40" />

      <GuidesSection guides={GUIDES_INTERNATIONAL} />
    </>
  );
}
