import { Link } from "wouter";
import { ArrowRight, Loader2, MapPin } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { Reveal } from "../components/site/reveal";
import { useQuoteOptions } from "../queries/quotes";

const CITIES = [
  "Paris",
  "Boulogne-Billancourt",
  "Créteil",
  "Saint-Denis",
  "Versailles",
  "Lille",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Toulouse",
  "Nantes",
  "Rennes",
  "Strasbourg",
  "Montpellier",
  "Nice",
  "Rouen",
  "Le Havre",
  "Orléans",
];

const ZONE_DETAIL: Record<string, { fr: string; en: string; image: string }> = {
  idf: {
    fr: "Paris et les 7 départements de la couronne, avec enlèvement en 2 h et livraison le jour même possible.",
    en: "Paris and the 7 surrounding départements, with 2-hour pickup and same-day delivery available.",
    image: "/images/van-night.jpg",
  },
  france: {
    fr: "Les 96 départements métropolitains, livraison à domicile, en entreprise ou en point relais.",
    en: "All 96 mainland départements, delivered to homes, businesses or pickup points.",
    image: "/images/livraison.jpg",
  },
  corse: {
    fr: "Corse, Guadeloupe, Martinique, Guyane, La Réunion et Mayotte par voie maritime ou aérienne.",
    en: "Corsica, Guadeloupe, Martinique, French Guiana, Réunion and Mayotte by sea or air.",
    image: "/images/entrepot.jpg",
  },
  europe: {
    fr: "Union européenne, Suisse et Royaume-Uni : route ou aérien, formalités incluses hors UE.",
    en: "European Union, Switzerland and the UK: road or air, formalities included outside the EU.",
    image: "/images/palette.jpg",
  },
  maghreb: {
    fr: "Maroc, Algérie, Tunisie : sur devis, via nos partenaires aériens et maritimes.",
    en: "Morocco, Algeria, Tunisia: on quotation, through our air and sea partners.",
    image: "/images/aerien.jpg",
  },
  afrique: {
    fr: "Bénin (Cotonou), Togo (Lomé), Mali (Bamako) : aérien 5 à 10 jours, maritime 30 à 45 jours, livraison finale à domicile.",
    en: "Benin (Cotonou), Togo (Lomé), Mali (Bamako): 5-10 days by air, 30-45 days by sea, final home delivery.",
    image: "/images/aerien-2.jpg",
  },
  monde: {
    fr: "Amériques, Asie, Moyen-Orient et Océanie : sur devis uniquement, via nos partenaires.",
    en: "Americas, Asia, Middle East and Oceania: on quotation only, through our partners.",
    image: "/images/hero.jpg",
  },
};

export default function ZonesPage() {
  const { t } = useI18n();
  const options = useQuoteOptions();
  useSeo(SEO_ROUTES["/zones"]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Zones desservies", en: "Coverage" })}
        title={t({ fr: "De l'Île-de-France au Bénin, au Togo et au Mali", en: "From Greater Paris to Benin, Togo and Mali" })}
        lead={t({
          fr: "Notre cœur de métier : l'Île-de-France au quotidien, et l'envoi vers Cotonou, Lomé et Bamako. Les autres zones sont traitées sur devis, avec le même numéro de suivi du départ à la remise.",
          en: "Our core business: the Paris region day to day, and shipping to Cotonou, Lomé and Bamako. Other zones are handled on quotation, with the same tracking number from departure to final handover.",
        })}
        image="/images/entrepot.jpg"
      />

      <Section>
        {options.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin text-primary" />
            {t({ fr: "Chargement des zones…", en: "Loading zones…" })}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(options.data?.zones ?? []).map((zone, i) => {
              const detail = ZONE_DETAIL[zone.id];
              return (
                <Reveal key={zone.id} delay={i * 55}>
                  <Card className="flex h-full flex-col overflow-hidden p-0">
                    <div className="relative h-36 overflow-hidden">
                      <img src={detail?.image ?? "/images/hero.jpg"} alt="" className="size-full object-cover" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center gap-2 text-primary">
                        <MapPin className="size-4" />
                        <h2 className="font-display text-base font-bold text-foreground">{t(zone.label)}</h2>
                      </div>
                      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                        {detail ? t({ fr: detail.fr, en: detail.en }) : null}
                      </p>
                      <p className="mt-4 text-sm font-semibold">
                        {zone.days[0] === zone.days[1]
                          ? `${zone.days[0]} ${t({ fr: "jour ouvré", en: "working day" })}`
                          : `${zone.days[0]}–${zone.days[1]} ${t({ fr: "jours ouvrés", en: "working days" })}`}
                      </p>
                      <Link
                        to={`/devis?zone=${zone.id}`}
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5"
                      >
                        {t({ fr: "Tarif pour cette zone", en: "Price for this zone" })}
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </Card>
                </Reveal>
              );
            })}
          </div>
        )}
      </Section>

      <Section className="border-t border-border bg-surface/40">
        <SectionHead
          eyebrow={t({ fr: "Villes", en: "Cities" })}
          title={t({ fr: "Enlèvement quotidien dans ces villes", en: "Daily pickup in these cities" })}
          lead={t({
            fr: "Et partout ailleurs en France sur simple demande, avec un délai d'enlèvement de 24 à 48 h.",
            en: "And anywhere else in France on request, with a 24 to 48-hour pickup lead time.",
          })}
        />
        <ul className="mt-8 flex flex-wrap gap-2">
          {CITIES.map((city) => (
            <li
              key={city}
              className="rounded-full border border-border bg-surface-2/60 px-3.5 py-1.5 text-sm text-muted"
            >
              {city}
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
