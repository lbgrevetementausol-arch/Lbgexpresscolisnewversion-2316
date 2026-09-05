import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { Card, Section, SectionHead } from "./section";

/** Guides du blog liés à une page de conversion — maillage interne SEO. */
export type GuideLink = { slug: string; title: { fr: string; en: string } };

export const GUIDES_DEMENAGEMENT: GuideLink[] = [
  {
    slug: "comment-calculer-le-volume-de-son-demenagement",
    title: {
      fr: "Comment calculer le volume de son déménagement en m³",
      en: "How to calculate your moving volume in m³",
    },
  },
  {
    slug: "tarif-demenagement-prix-2026",
    title: { fr: "Tarif déménagement 2026 : les vrais prix", en: "Moving prices 2026: the real numbers" },
  },
  {
    slug: "demenagement-pas-cher-groupage",
    title: { fr: "Déménagement pas cher : la méthode du groupage", en: "Cheap moving: the groupage method" },
  },
  {
    slug: "combien-de-cartons-pour-un-demenagement",
    title: { fr: "Combien de cartons pour un déménagement ?", en: "How many boxes for a move?" },
  },
];

export const GUIDES_COLIS: GuideLink[] = [
  {
    slug: "envoyer-un-colis-pas-cher-en-france",
    title: { fr: "Envoyer un colis pas cher en France", en: "Sending a cheap parcel in France" },
  },
  {
    slug: "prix-envoi-colis-10-kg",
    title: { fr: "Prix d'un envoi de colis de 10 kg", en: "Price of a 10 kg parcel" },
  },
  {
    slug: "poids-volumetrique-colis-explication",
    title: { fr: "Poids volumétrique : pourquoi votre colis coûte plus cher", en: "Volumetric weight explained" },
  },
  {
    slug: "envoyer-un-gros-colis-hors-format",
    title: { fr: "Envoyer un gros colis ou un hors-format", en: "Shipping oversized parcels" },
  },
];

export const GUIDES_INTERNATIONAL: GuideLink[] = [
  {
    slug: "envoi-colis-international-europe-maghreb-afrique",
    title: { fr: "Envoi de colis international : Europe, Maghreb, Afrique", en: "International parcels: Europe, Maghreb, Africa" },
  },
  {
    slug: "envoyer-un-colis-en-afrique",
    title: { fr: "Envoyer un colis en Afrique sans mauvaise surprise", en: "Shipping to Africa without surprises" },
  },
  {
    slug: "bien-emballer-son-colis",
    title: { fr: "Bien emballer son colis : la méthode des pros", en: "Packing a parcel like a pro" },
  },
];

export const GUIDES_SUIVI: GuideLink[] = [
  {
    slug: "suivre-un-colis-comprendre-les-statuts",
    title: { fr: "Suivre un colis : comprendre chaque statut", en: "Tracking a parcel: every status explained" },
  },
  {
    slug: "delais-transport-france",
    title: { fr: "Délais de transport en France : à quoi s'attendre", en: "Transit times in France" },
  },
  {
    slug: "point-relais-ou-enlevement-a-domicile",
    title: { fr: "Point relais ou enlèvement à domicile ?", en: "Pickup point or home collection?" },
  },
];

export function GuidesSection({ guides, eyebrow }: { guides: GuideLink[]; eyebrow?: string }) {
  const { t } = useI18n();

  return (
    <Section className="border-t border-border">
      <SectionHead
        eyebrow={eyebrow ?? t({ fr: "Guides", en: "Guides" })}
        title={t({ fr: "À lire avant de vous lancer", en: "Read this before you start" })}
        lead={t({
          fr: "Nos guides pratiques, chiffres réels à l'appui, pour éviter les mauvaises surprises.",
          en: "Practical guides with real numbers, so nothing catches you out.",
        })}
      />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {guides.map((guide) => (
          <Link key={guide.slug} to={`/blog/${guide.slug}`} className="block">
            <Card className="flex items-center justify-between gap-4 p-5 transition hover:border-primary/50">
              <span className="text-[0.975rem] font-medium leading-snug">{t(guide.title)}</span>
              <ArrowRight className="size-4 shrink-0 text-primary" />
            </Card>
          </Link>
        ))}
      </div>
    </Section>
  );
}
