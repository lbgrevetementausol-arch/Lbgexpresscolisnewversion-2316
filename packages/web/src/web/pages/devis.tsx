import { BadgeEuro, Clock, ShieldCheck, Truck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { PageHero } from "../components/site/layout";
import { Section } from "../components/site/section";
import { QuoteForm } from "../components/site/quote-form";
import { Reveal } from "../components/site/reveal";
import { TrustBadges } from "../components/site/trust-badges";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";

const ARGS = [
  {
    icon: BadgeEuro,
    fr: "Prix ferme immédiat",
    en: "Firm price, instantly",
    descFr: "Zéro frais de dossier, zéro surprise.",
    descEn: "No admin fees, no surprises.",
  },
  {
    icon: Clock,
    fr: "Enlèvement sous 24 h",
    en: "Pickup within 24 h",
    descFr: "Créneau confirmé par SMS ou WhatsApp, du lundi au samedi.",
    descEn: "Slot confirmed by SMS or WhatsApp, Monday to Saturday.",
  },
  {
    icon: ShieldCheck,
    fr: "Assurance ad valorem",
    en: "Ad valorem insurance",
    descFr: "Valeur déclarée couverte pour 0,7 %, en une case.",
    descEn: "Declared value covered for 0.7%, one checkbox.",
  },
  {
    icon: Truck,
    fr: "Suivi TRK dès la validation",
    en: "TRK tracking on confirmation",
    descFr: "Timeline et position du livreur, pour vous et le destinataire.",
    descEn: "Timeline and driver position, for you and the recipient.",
  },
];

export default function DevisPage() {
  const { t } = useI18n();

  useSeo(SEO_ROUTES["/devis"]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Devis colis & fret", en: "Parcel & freight quote" })}
        title={t({ fr: "Votre devis en 60 secondes", en: "Your quote in 60 seconds" })}
        lead={t({
          fr: "Remplissez le trajet et la marchandise : le prix se met à jour en direct. Vous validez, nous planifions l'enlèvement.",
          en: "Fill in the route and the goods: the price updates live. You confirm, we schedule the pickup.",
        })}
        image="/images/camion-la-courneuve-93.jpg"
      />

      <Section>
        <QuoteForm variant="colis" />
        <TrustBadges className="mt-6" />
      </Section>

      <Section className="border-t border-border bg-surface/40 py-16 md:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ARGS.map((item, i) => (
            <Reveal key={item.fr} delay={i * 70}>
              <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-bold">{t(item)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {t({ fr: item.descFr, en: item.descEn })}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
