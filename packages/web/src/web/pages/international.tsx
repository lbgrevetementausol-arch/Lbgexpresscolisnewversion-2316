import { FileCheck2, Globe2, Plane, Ship } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { QuoteForm } from "../components/site/quote-form";
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
    descFr: "5 à 10 jours porte-à-porte vers Cotonou, Lomé et Bamako. C'est un délai cible, pas une garantie : si la date bouge, nous vous prévenons.",
    descEn: "5 to 10 days door-to-door to Cotonou, Lomé and Bamako. This is a target lead time, not a guarantee: if the date moves, we tell you.",
  },
  {
    icon: Ship,
    fr: "Maritime groupage",
    en: "Sea groupage",
    descFr: "L'option économique pour les cartons, barriques et meubles : comptez 30 à 45 jours de porte à porte, avec dédouanement à l'arrivée.",
    descEn: "The economical option for boxes, drums and furniture: expect 30 to 45 days door-to-door, with clearance on arrival.",
  },
  {
    icon: FileCheck2,
    fr: "Formalités douanières",
    en: "Customs formalities",
    descFr: "Nous préparons la facture commerciale, la liste de colisage et le dédouanement à l'arrivée.",
    descEn: "We prepare the commercial invoice, packing list and clearance on arrival.",
  },
  {
    icon: Globe2,
    fr: "Livraison finale",
    en: "Final delivery",
    descFr: "Remise à domicile ou retrait en agence partenaire, avec notification WhatsApp au destinataire.",
    descEn: "Home delivery or pickup at a partner agency, with WhatsApp notification to the recipient.",
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
      />

      <Section>
        <QuoteForm variant="international" />
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
              fr: "Nous préférons annoncer trois destinations que nous maîtrisons plutôt qu'une liste de quarante pays. Pour une autre destination, écrivez-nous : nous étudions le dossier au cas par cas et nous refusons si nous ne pouvons pas tenir.",
              en: "We would rather announce three destinations we truly master than a list of forty countries. For anywhere else, write to us: we study each case individually, and we say no when we cannot deliver.",
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
