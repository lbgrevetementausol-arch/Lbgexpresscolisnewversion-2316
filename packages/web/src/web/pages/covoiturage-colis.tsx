import { BadgeCheck, HandCoins, Leaf, Route, ShieldCheck, Truck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { FormCovoiturage } from "../components/site/form-covoiturage";
import { TrustBadges } from "../components/site/trust-badges";
import { PhotoBand } from "../components/site/photo-band";
import { Reveal } from "../components/site/reveal";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { GuidesSection, GUIDES_COLIS } from "../components/site/guides";

/** Le principe, en trois temps — texte volontairement factuel, sans promesse chiffrée. */
const ETAPES = [
  {
    icon: Route,
    fr: "1. Vous donnez votre trajet",
    en: "1. You give us your route",
    descFr: "Villes, date et gabarit : prix immédiat.",
    descEn: "Cities, date and size: instant price.",
  },
  {
    icon: Truck,
    fr: "2. On le place sur une tournée existante",
    en: "2. We place it on an existing run",
    descFr: "Un transporteur pro qui roule déjà sur cet axe, avec de la place libre.",
    descEn: "A professional carrier already driving that route, with free space.",
  },
  {
    icon: HandCoins,
    fr: "3. Remise en main propre",
    en: "3. Handed over in person",
    descFr: "Aux points convenus, suivi et contact direct du transporteur.",
    descEn: "At the agreed points, with tracking and direct carrier contact.",
  },
];

/** Réassurance : trois engagements que l'entreprise peut réellement tenir. */
const REASSURANCE = [
  {
    icon: BadgeCheck,
    fr: "Transporteurs professionnels uniquement",
    en: "Licensed professional carriers only",
    descFr: "Aucun particulier : licence et attestations vérifiées avant la première tournée.",
    descEn: "No private individuals: licence and certificates checked before the first run.",
  },
  {
    icon: ShieldCheck,
    fr: "Assuré RC Pro chez Simplis",
    en: "Insured with Simplis",
    descFr: "Biens confiés couverts jusqu'à 100 000 € par sinistre. Option ad valorem en une case.",
    descEn: "Goods entrusted covered up to €100,000 per claim. Ad valorem option in one checkbox.",
  },
  {
    icon: Leaf,
    fr: "Paiement sécurisé et prix ferme",
    en: "Secure payment, firm price",
    descFr: "myPOS, facture proforma avant paiement, aucun supplément à la livraison.",
    descEn: "myPOS, proforma invoice before payment, no surcharge on delivery.",
  },
];

export default function CovoiturageColisPage() {
  const { t } = useI18n();

  useSeo(SEO_ROUTES["/covoiturage-colis"]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Covoiturage de colis", en: "Parcel ride-sharing" })}
        title={t({
          fr: "Le covoiturage de colis, partout en France",
          en: "Parcel ride-sharing, everywhere in France",
        })}
        lead={t({
          fr: "Votre colis monte dans un véhicule qui fait déjà la route. Le trajet est mutualisé, donc vous ne payez pas un camion entier — juste la place que votre colis occupe. Transporteurs professionnels, remise en main propre, prix ferme annoncé avant la commande.",
          en: "Your parcel rides in a vehicle already making the trip. The route is shared, so you don't pay for a whole truck — only the space your parcel takes. Professional carriers, in-person handover, firm price before you order.",
        })}
        image="/images/camion-autoroute-paris-lyon.jpg"
        compact
      />

      {/* Section du calculateur resserrée : l'utilisateur doit atteindre le bouton
          de calcul sans défiler, l'en-tête ne doit donc pas manger l'écran. */}
      <Section className="border-t border-border bg-surface/40 py-12 md:py-14" id="devis">
        <SectionHead
          eyebrow={t({ fr: "Votre envoi", en: "Your shipment" })}
          title={t({ fr: "Calculez votre trajet en 60 secondes", en: "Price your route in 60 seconds" })}
          lead={t({
            fr: "Vos petits colis dès 8,99 € sur les trajets courts. Renseignez les deux villes et le gabarit, lancez le calcul : le prix affiché est ferme, c'est celui que vous payez.",
            en: "Small parcels from €8.99 on short routes. Enter both cities and the size, run the calculation: the price shown is firm, and it is the one you pay.",
          })}
          className="[&_h2]:text-2xl [&_h2]:md:text-3xl [&_p]:mt-3 [&_p]:text-[0.95rem]"
        />
        <div className="mt-6">
          <FormCovoiturage />
        </div>
        <TrustBadges className="mt-6" />
      </Section>

      <Section>
        <SectionHead
          eyebrow={t({ fr: "Le principe", en: "How it works" })}
          title={t({
            fr: "Un trajet déjà prévu, une place de libre, votre colis dedans",
            en: "A trip already planned, a free spot, your parcel in it",
          })}
          lead={t({
            fr: "Le trajet est partagé, donc votre envoi coûte moins cher.",
            en: "The trip is shared, so your shipment costs less.",
          })}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ETAPES.map((item, i) => (
            <Reveal key={item.fr} delay={i * 80}>
              <Card className="h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{t(item)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t({ fr: item.descFr, en: item.descEn })}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
        <PhotoBand
          className="mt-12"
          src="/images/camion-autoroute-paris-lyon.jpg"
          alt={t({
            fr: "Utilitaire LBG Express Colis sur l'autoroute Paris – Lyon",
            en: "LBG Express Colis van on the Paris – Lyon motorway",
          })}
          title={t({ fr: "Paris → Lyon : votre colis prend la route avec nous", en: "Paris → Lyon: your parcel hits the road with us" })}
          position="center 60%"
          chips={[
            { icon: Route, label: t({ fr: "Trajet mutualisé", en: "Shared route" }) },
            { icon: HandCoins, label: t({ fr: "Remise en main propre", en: "In-person handover" }) },
            { icon: ShieldCheck, label: t({ fr: "Assuré RC Pro", en: "Insured" }) },
          ]}
        />
      </Section>


      <Section>
        <SectionHead
          eyebrow={t({ fr: "Nos engagements", en: "Our commitments" })}
          title={t({ fr: "Mutualisé ne veut pas dire amateur", en: "Shared doesn't mean amateur" })}
        />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {REASSURANCE.map((item, i) => (
            <Reveal key={item.fr} delay={i * 80}>
              <Card className="h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold">{t(item)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {t({ fr: item.descFr, en: item.descEn })}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <GuidesSection guides={GUIDES_COLIS} />
    </>
  );
}
