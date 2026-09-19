import { Link } from "wouter";
import {
  ArrowRight,
  Boxes,
  Building2,
  Globe2,
  Package,
  Plane,
  Sofa,
  Truck,
  Warehouse,
  Zap,
} from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { Reveal } from "../components/site/reveal";

const SERVICES = [
  {
    icon: Package,
    image: "/images/livraison.jpg",
    fr: "Covoiturage de colis en France",
    en: "Parcel ride-sharing in France",
    descFr:
      "Enlèvement à domicile ou en entreprise, livraison point à point partout en France métropolitaine en 24 à 72 h. Preuve de livraison photo et signature.",
    descEn:
      "Home or business pickup, point-to-point delivery across mainland France in 24 to 72 hours. Photo and signature proof of delivery.",
    points: [
      { fr: "0,5 à 70 kg par colis", en: "0.5 to 70 kg per parcel" },
      { fr: "Créneau confirmé par WhatsApp", en: "Slot confirmed by WhatsApp" },
      { fr: "Suivi TRK et notifications", en: "TRK tracking and notifications" },
    ],
    href: "/covoiturage-colis",
  },
  {
    icon: Zap,
    image: "/images/van-night.jpg",
    fr: "Course express dédiée",
    en: "Dedicated express courier",
    descFr:
      "Un véhicule et un chauffeur pour vous seul : plis urgents, pièces détachées, prélèvements médicaux. Prise en charge sous 2 h en Île-de-France, 7j/7.",
    descEn:
      "A vehicle and driver just for you: urgent documents, spare parts, medical samples. Pickup within 2 h in Greater Paris, 7 days a week.",
    points: [
      { fr: "Trajet direct, sans rupture de charge", en: "Direct run, no transshipment" },
      { fr: "Suivi GPS en direct", en: "Live GPS tracking" },
      { fr: "Disponible nuit et week-end", en: "Available nights and weekends" },
    ],
    href: "/devis?service=express",
  },
  {
    icon: Boxes,
    image: "/images/palette.jpg",
    fr: "Fret & palettes",
    en: "Freight & pallets",
    descFr:
      "Groupage, demi-palette et palette complète jusqu'à 3,5 t. Hayon élévateur, prise de rendez-vous livraison et manutention incluses.",
    descEn:
      "Groupage, half-pallet and full pallet up to 3.5 t. Tail-lift, booked delivery slots and handling included.",
    points: [
      { fr: "Hayon et transpalette", en: "Tail-lift and pallet truck" },
      { fr: "Rendez-vous livraison", en: "Booked delivery appointment" },
      { fr: "Assurance ad valorem", en: "Ad valorem insurance" },
    ],
    href: "/devis?kind=palette",
  },
  {
    icon: Sofa,
    image: "/images/demenagement-2.jpg",
    fr: "Déménagement",
    en: "Moving",
    descFr:
      "Particuliers et bureaux, du studio à la maison. Emballage, démontage, portage, remontage : nous prenons tout en charge, France et Europe.",
    descEn:
      "Homes and offices, from studio to house. Packing, dismantling, carrying, reassembly: we handle it all, France and Europe.",
    points: [
      { fr: "Équipe de 2 à 4 déménageurs", en: "Team of 2 to 4 movers" },
      { fr: "Fournitures d'emballage", en: "Packing supplies" },
      { fr: "Monte-meuble sur demande", en: "Furniture lift on request" },
    ],
    href: "/demenagement",
  },
  {
    icon: Plane,
    image: "/images/aerien-2.jpg",
    fr: "Envoi international",
    en: "International shipping",
    descFr:
      "Aérien express ou maritime groupage vers l'Afrique, le Maghreb, l'Europe et le reste du monde. Douanes et livraison finale gérées de bout en bout.",
    descEn:
      "Air express or sea groupage to Africa, the Maghreb, Europe and the rest of the world. Customs and final delivery handled end to end.",
    points: [
      { fr: "Plus de 40 pays desservis", en: "40+ countries served" },
      { fr: "Facture commerciale et colisage", en: "Commercial invoice and packing list" },
      { fr: "Remise à domicile ou en agence", en: "Home or agency handover" },
    ],
    href: "/commande-internationale",
  },
  {
    icon: Building2,
    image: "/images/entrepot.jpg",
    fr: "Comptes professionnels",
    en: "Business accounts",
    descFr:
      "Tarifs négociés au volume, facturation mensuelle, API de création d'expéditions et webhooks temps réel pour brancher votre boutique ou votre ERP.",
    descEn:
      "Volume-based rates, monthly invoicing, shipment-creation API and real-time webhooks to plug in your store or ERP.",
    points: [
      { fr: "Dashboard et exports CSV", en: "Dashboard and CSV exports" },
      { fr: "Clés API et webhooks HMAC", en: "API keys and HMAC webhooks" },
      { fr: "Interlocuteur dédié", en: "Dedicated account manager" },
    ],
    href: "/pro",
  },
];

const EXTRAS = [
  {
    icon: Warehouse,
    fr: "Stockage tampon",
    en: "Buffer storage",
    descFr: "Quelques jours à quelques semaines, en entrepôt sécurisé, entre deux étapes de votre projet.",
    descEn: "A few days to a few weeks in secure warehousing, between two stages of your project.",
  },
  {
    icon: Truck,
    fr: "Location avec chauffeur",
    en: "Van with driver",
    descFr: "Utilitaire 12 ou 20 m³ avec chauffeur à l'heure ou à la journée, idéal pour les petits volumes.",
    descEn: "12 or 20 m³ van with driver, hourly or daily, ideal for small volumes.",
  },
  {
    icon: Globe2,
    fr: "Achat & réexpédition",
    en: "Purchase & forwarding",
    descFr: "Nous achetons en France pour vous, regroupons vos commandes et expédions vers votre pays.",
    descEn: "We buy in France for you, consolidate your orders and ship to your country.",
  },
];

export default function ServicesPage() {
  const { t } = useI18n();
  useSeo(SEO_ROUTES["/services"]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Nos services", en: "Our services" })}
        title={t({ fr: "Un transporteur, toutes vos expéditions", en: "One carrier, all your shipments" })}
        lead={t({
          fr: "Du pli urgent au déménagement complet, en France comme à l'international : une équipe, un numéro de suivi, un interlocuteur.",
          en: "From an urgent envelope to a full house move, in France and abroad: one team, one tracking number, one contact.",
        })}
        image="/images/hero.jpg"
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((service, i) => (
            <Reveal key={service.fr} delay={i * 60}>
              <Card className="flex h-full flex-col overflow-hidden p-0">
                <div className="relative h-44 overflow-hidden">
                  <img src={service.image} alt="" className="size-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                  <span className="absolute bottom-4 left-5 grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <service.icon className="size-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h2 className="font-display text-xl font-bold">{t(service)}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {t({ fr: service.descFr, en: service.descEn })}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-muted">
                    {service.points.map((p) => (
                      <li key={p.fr} className="flex items-start gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                        {t(p)}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to={service.href}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition hover:gap-2.5"
                  >
                    {t({ fr: "Obtenir un prix", en: "Get a price" })}
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-surface/40">
        <SectionHead
          eyebrow={t({ fr: "Services complémentaires", en: "Additional services" })}
          title={t({ fr: "Ce que nous ajoutons quand c'est utile", en: "What we add when it helps" })}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {EXTRAS.map((extra, i) => (
            <Reveal key={extra.fr} delay={i * 70}>
              <Card className="h-full">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/15 text-primary">
                  <extra.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{t(extra)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t({ fr: extra.descFr, en: extra.descEn })}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
