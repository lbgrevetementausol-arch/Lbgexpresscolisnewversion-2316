import { Boxes, Sofa, Users, Wrench } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { QuoteForm } from "../components/site/quote-form";
import { Reveal } from "../components/site/reveal";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { GuidesSection, GUIDES_DEMENAGEMENT } from "../components/site/guides";

const VOLUMES = [
  { fr: "Studio / 1 pièce", en: "Studio / 1 room", volume: "10 – 15 m³" },
  { fr: "T2 (2 pièces)", en: "2-room flat", volume: "18 – 25 m³" },
  { fr: "T3 (3 pièces)", en: "3-room flat", volume: "28 – 38 m³" },
  { fr: "T4 / maison", en: "4-room / house", volume: "45 – 70 m³" },
];

const INCLUDED = [
  {
    icon: Users,
    fr: "Équipe de 2 à 4 déménageurs",
    en: "Team of 2 to 4 movers",
    descFr: "Portage, sanglage, chargement et calage dans le camion. Monte-meuble sur demande.",
    descEn: "Carrying, strapping, loading and securing in the truck. Furniture lift on request.",
  },
  {
    icon: Boxes,
    fr: "Fournitures d'emballage",
    en: "Packing supplies",
    descFr: "Cartons standards et penderie, papier bulle, film étirable, couvertures de protection.",
    descEn: "Standard and wardrobe boxes, bubble wrap, stretch film, protective blankets.",
  },
  {
    icon: Wrench,
    fr: "Démontage / remontage",
    en: "Dismantling / reassembly",
    descFr: "Lits, armoires, bureaux : démontés au départ, remontés à l'arrivée dans la bonne pièce.",
    descEn: "Beds, wardrobes, desks: dismantled at origin, reassembled in the right room on arrival.",
  },
  {
    icon: Sofa,
    fr: "Objets lourds et fragiles",
    en: "Heavy and fragile items",
    descFr: "Piano droit, coffre-fort, électroménager, œuvres : matériel et sangles adaptés.",
    descEn: "Upright piano, safe, appliances, artwork: proper equipment and straps.",
  },
];

export default function DemenagementPage() {
  const { t } = useI18n();

  useSeo(SEO_ROUTES["/demenagement"]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Déménagement", en: "Moving" })}
        title={t({ fr: "Déménagement clé en main, France et Europe", en: "Turnkey moving, France and Europe" })}
        lead={t({
          fr: "Estimez votre déménagement au volume, avec ou sans emballage, étages et ascenseur pris en compte. Devis instantané, visite technique offerte au-delà de 30 m³.",
          en: "Estimate your move by volume, with or without packing, floors and elevator taken into account. Instant quote, free survey above 30 m³.",
        })}
        image="/images/demenagement.jpg"
      />

      <Section>
        <QuoteForm variant="demenagement" />
      </Section>

      <Section className="border-t border-border bg-surface/40">
        <SectionHead
          eyebrow={t({ fr: "Repères de volume", en: "Volume benchmarks" })}
          title={t({ fr: "Quel volume pour mon logement ?", en: "How much volume for my home?" })}
          lead={t({
            fr: "Un ordre de grandeur suffit pour l'estimation. Nous affinons ensemble par téléphone ou en visite technique.",
            en: "A rough figure is enough for the estimate. We refine it together by phone or during a survey.",
          })}
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {VOLUMES.map((v, i) => (
            <Reveal key={v.fr} delay={i * 60}>
              <Card>
                <p className="font-display text-2xl font-extrabold text-primary">{v.volume}</p>
                <p className="mt-2 text-sm font-medium">{t(v)}</p>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {INCLUDED.map((item, i) => (
            <Reveal key={item.fr} delay={i * 70}>
              <Card className="flex gap-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <item.icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{t(item)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {t({ fr: item.descFr, en: item.descEn })}
                  </p>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <GuidesSection guides={GUIDES_DEMENAGEMENT} />
    </>
  );
}
