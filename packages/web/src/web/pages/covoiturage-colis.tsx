import { BadgeCheck, HandCoins, Leaf, Route, ShieldCheck, Truck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { QuoteForm } from "../components/site/quote-form";
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
    descFr:
      "Ville de départ, ville d'arrivée, date souhaitée et gabarit du colis. Le prix s'affiche immédiatement.",
    descEn: "Departure city, arrival city, preferred date and parcel size. The price appears immediately.",
  },
  {
    icon: Truck,
    fr: "2. On le place sur une tournée existante",
    en: "2. We place it on an existing run",
    descFr:
      "Votre colis part avec un transporteur professionnel qui roule déjà sur cet axe : on utilise la place disponible dans son véhicule au lieu d'affréter un trajet pour rien.",
    descEn:
      "Your parcel travels with a professional carrier already driving that route: we use the free space in the vehicle instead of chartering a trip for nothing.",
  },
  {
    icon: HandCoins,
    fr: "3. Remise en main propre",
    en: "3. Handed over in person",
    descFr:
      "Enlèvement et livraison en main propre, aux points convenus. Suivi et contact direct du transporteur pendant tout le trajet.",
    descEn:
      "Pickup and delivery in person at the agreed points. Tracking and direct carrier contact the whole way.",
  },
];

/** Réassurance : trois engagements que l'entreprise peut réellement tenir. */
const REASSURANCE = [
  {
    icon: BadgeCheck,
    fr: "Transporteurs professionnels uniquement",
    en: "Licensed professional carriers only",
    descFr:
      "Aucun particulier ne transporte vos colis. Chaque conducteur est une entreprise de transport inscrite au registre, avec sa licence, son assurance professionnelle et ses attestations à jour, vérifiées avant sa première tournée.",
    descEn:
      "No private individuals carry your parcels. Every driver is a registered transport company with a valid licence, professional insurance and up-to-date certificates, checked before their first run.",
  },
  {
    icon: ShieldCheck,
    fr: "Marchandise couverte",
    en: "Goods covered",
    descFr:
      "Chaque envoi est couvert par notre police marchandises transportées. Vous pouvez y ajouter l'assurance ad valorem sur la valeur déclarée, en une case à cocher lors de la commande.",
    descEn:
      "Every shipment is covered by our goods-in-transit policy. You can add ad valorem cover on the declared value with a single checkbox at order time.",
  },
  {
    icon: Leaf,
    fr: "Paiement sécurisé et prix ferme",
    en: "Secure payment, firm price",
    descFr:
      "Paiement en ligne sécurisé (myPOS), facture émise à la commande. Le montant affiché est celui que vous payez : pas de frais de dossier, pas de supplément à la livraison.",
    descEn:
      "Secure online payment (myPOS), invoice issued with the order. The amount shown is what you pay: no admin fees, no surcharge on delivery.",
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
        image="/images/livraison.jpg"
      />

      <Section>
        <SectionHead
          eyebrow={t({ fr: "Le principe", en: "How it works" })}
          title={t({
            fr: "Un trajet déjà prévu, une place de libre, votre colis dedans",
            en: "A trip already planned, a free spot, your parcel in it",
          })}
          lead={t({
            fr: "Des milliers de véhicules professionnels roulent chaque jour entre les grandes villes françaises avec de la place disponible. Nous remplissons cette place au lieu de la laisser vide : c'est ce partage du trajet qui fait baisser le coût de votre envoi, sans intermédiaire supplémentaire.",
            en: "Thousands of professional vehicles drive between French cities every day with space to spare. We fill that space instead of leaving it empty: sharing the trip is what brings your shipping cost down, with no extra middleman.",
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
      </Section>

      <Section className="border-t border-border bg-surface/40" id="devis">
        <SectionHead
          eyebrow={t({ fr: "Votre envoi", en: "Your shipment" })}
          title={t({ fr: "Calculez votre trajet en 60 secondes", en: "Price your route in 60 seconds" })}
          lead={t({
            fr: "Le prix se met à jour en direct pendant que vous remplissez. Vous validez, nous plaçons le colis sur la prochaine tournée compatible.",
            en: "The price updates live as you fill in the form. You confirm, we place the parcel on the next matching run.",
          })}
        />
        <div className="mt-10">
          <QuoteForm variant="colis" />
        </div>
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
