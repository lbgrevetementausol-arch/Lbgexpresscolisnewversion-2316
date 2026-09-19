import { Link } from "wouter";
import {
  ArrowRight,
  Boxes,
  Building2,
  Clock,
  Globe2,
  MapPin,
  MessageCircle,
  Package,
  Plane,
  ShieldCheck,
  Sofa,
  Star,
  Truck,
  Zap,
} from "lucide-react";
import { useI18n } from "../lib/i18n";
import { CONTACT, whatsappLink } from "../lib/format";
import { PriceCalculator } from "../components/site/price-calculator";
import { Card, Section, SectionHead } from "../components/site/section";
import { Reveal } from "../components/site/reveal";
import { ComparisonTable, ProblemSolution } from "../components/site/solution";
import { DeliveriesGallery } from "../components/site/deliveries-gallery";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";

const STATS = [
  { value: "8", fr: "départements d'Île-de-France couverts", en: "Greater Paris counties covered" },
  { value: "24-48 h", fr: "délai cible pour un colis en IDF", en: "target lead time for a parcel in Greater Paris" },
  { value: "100 000 €", fr: "biens confiés assurés (Simplis)", en: "goods entrusted insured (Simplis)" },
  { value: "1", fr: "interlocuteur, joignable sur WhatsApp", en: "single contact, reachable on WhatsApp" },
];

const SERVICES = [
  {
    icon: Package,
    image: "/images/livraison.jpg",
    fr: "Livraison de colis",
    en: "Parcel delivery",
    descFr: "Enlèvement à domicile, dépôt relais ou point à point, partout en France, en 24 à 72 h.",
    descEn: "Home pickup, drop-off or point-to-point delivery across France in 24 to 72 hours.",
    href: "/covoiturage-colis",
  },
  {
    icon: Zap,
    image: "/images/van-night.jpg",
    fr: "Course express",
    en: "Express courier",
    descFr: "Un coursier dédié pour vos urgences : plis, pièces, prélèvements. Prise en charge sous 2 h en Île-de-France.",
    descEn: "A dedicated courier for urgent runs: documents, parts, samples. Pickup within 2 h in Greater Paris.",
    href: "/services",
  },
  {
    icon: Boxes,
    image: "/images/palette.jpg",
    fr: "Fret & palettes",
    en: "Freight & pallets",
    descFr: "Groupage et palettes complètes, hayon, prise de rendez-vous livraison, jusqu'à 3,5 t.",
    descEn: "Groupage and full pallets, tail-lift, booked delivery slots, up to 3.5 t.",
    href: "/tarifs",
  },
  {
    icon: Sofa,
    image: "/images/demenagement.jpg",
    fr: "Déménagement",
    en: "Moving services",
    descFr: "Studio ou maison : emballage, démontage, portage, remontage. Devis au m³ transparent.",
    descEn: "Studio or house: packing, dismantling, carrying, reassembly. Transparent price per m³.",
    href: "/demenagement",
  },
  {
    icon: Plane,
    image: "/images/aerien.jpg",
    fr: "Aérien & maritime",
    en: "Air & sea freight",
    descFr: "Bénin (Cotonou), Togo (Lomé), Mali (Bamako) : aérien 5 à 10 jours, maritime 30 à 45 jours, douane incluse.",
    descEn: "Benin (Cotonou), Togo (Lomé), Mali (Bamako): air 5 to 10 days, sea 30 to 45 days, customs included.",
    href: "/commande-internationale",
  },
  {
    icon: Building2,
    image: "/images/entrepot.jpg",
    fr: "Logistique entreprise",
    en: "Business logistics",
    descFr: "Stockage tampon, préparation de commandes, tournées récurrentes, API et facturation mensuelle.",
    descEn: "Buffer storage, order preparation, recurring rounds, API access and monthly invoicing.",
    href: "/pro",
  },
];

const STEPS = [
  {
    fr: "Estimez en 30 secondes",
    en: "Estimate in 30 seconds",
    descFr: "Poids, dimensions, destination : le prix s'affiche immédiatement, sans inscription.",
    descEn: "Weight, dimensions, destination: the price shows instantly, no sign-up needed.",
  },
  {
    fr: "Validez votre commande",
    en: "Confirm your order",
    descFr: "Adresses complétées automatiquement, options d'assurance et d'emballage, paiement en ligne.",
    descEn: "Auto-completed addresses, insurance and packing options, online payment.",
  },
  {
    fr: "Nous enlevons le colis",
    en: "We pick it up",
    descFr: "Un livreur passe à l'adresse convenue et scanne votre envoi au format TRK.",
    descEn: "A driver collects at the agreed address and scans your shipment into the TRK system.",
  },
  {
    fr: "Suivez en temps réel",
    en: "Track in real time",
    descFr: "Chaque étape est horodatée, avec la position GPS du livreur et une notification de livraison.",
    descEn: "Every step is timestamped, with the driver's GPS position and a delivery notification.",
  },
];

const ZONES_HOME = [
  { fr: "Paris et Île-de-France (75, 77, 78, 91, 92, 93, 94, 95)", en: "Paris and Greater Paris (75, 77, 78, 91, 92, 93, 94, 95)", delay: "24-48 h", price: "9,90 €" },
  { fr: "Déménagement en Île-de-France", en: "Moving within Greater Paris", delay: "3 j", price: "" },
  { fr: "Bénin — Cotonou (aérien)", en: "Benin — Cotonou (air)", delay: "5-10 j", price: "" },
  { fr: "Togo — Lomé (aérien)", en: "Togo — Lomé (air)", delay: "5-10 j", price: "" },
  { fr: "Mali — Bamako (aérien)", en: "Mali — Bamako (air)", delay: "5-10 j", price: "" },
  { fr: "Bénin, Togo, Mali (maritime groupage)", en: "Benin, Togo, Mali (sea groupage)", delay: "30-45 j", price: "" },
];

const TRUSTPILOT_URL = "https://fr.trustpilot.com/review/lbgexpresscolis.fr";
const TRUSTPILOT_SCORE = "4,0";
const TRUSTPILOT_COUNT = 3;

/** Avis réellement publiés sur Trustpilot, repris mot pour mot. Source : TRUSTPILOT_URL */
const TESTIMONIALS = [
  {
    name: "Esco Sensei",
    date: { fr: "20 novembre 2025", en: "20 November 2025" },
    text: "Merci pour le service",
  },
  {
    name: "Abdelhak",
    date: { fr: "20 novembre 2025", en: "20 November 2025" },
    text: "Entreprise fiable je l'a recommande",
  },
  {
    name: "Abdoulaye Toure",
    date: { fr: "20 novembre 2025", en: "20 November 2025" },
    text: "super je recommande",
  },
];

const FAQ_SHORT = [
  {
    q: { fr: "Sous combien de temps venez-vous chercher mon colis ?", en: "How fast do you collect my parcel?" },
    a: {
      fr: "Sous 24 à 48 h en Île-de-France, du lundi au samedi. En express, l'enlèvement peut être organisé dans la journée. Ce sont des délais cibles : nous vous donnons une date, et nous vous prévenons si elle bouge.",
      en: "Within 24 to 48 h across Greater Paris, Monday to Saturday. Express pickups can be arranged the same day. These are target lead times: we give you a date, and we tell you if it moves.",
    },
  },
  {
    q: { fr: "Mes envois sont-ils assurés ?", en: "Are my shipments insured?" },
    a: {
      fr: "Nous sommes assurés chez Simplis en responsabilité civile professionnelle : les biens confiés sont couverts jusqu'à 100 000 € par sinistre, avec une franchise de 200 €. Pour un envoi de valeur, déclarez-la : l'assurance ad valorem coûte 1,2 % de la valeur déclarée, minimum 8 € HT.",
      en: "We are insured with Simplis under professional liability: goods entrusted are covered up to €100,000 per claim, with a €200 deductible. For a valuable shipment, declare its value: ad valorem insurance costs 1.2% of the declared value, minimum €8 excl. VAT.",
    },
  },
  {
    q: { fr: "Comment fonctionne le suivi ?", en: "How does tracking work?" },
    a: {
      fr: "Vous recevez un numéro TRK-AAAAMMJJ-XXXXXX dès la validation. Il donne accès à la timeline complète et à la position du livreur sur la page Suivi.",
      en: "You get a TRK-YYYYMMDD-XXXXXX number as soon as you confirm. It unlocks the full timeline and the driver position on the Tracking page.",
    },
  },
];

function Index() {
  const { t } = useI18n();

  useSeo(SEO_ROUTES["/"]);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src="/images/hero.jpg"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-30"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/70" />
        <div className="grid-bg absolute inset-0 opacity-60" />
        <div
          className="absolute -right-32 top-[-10rem] size-[34rem] rounded-full blur-[130px]"
          style={{ background: "radial-gradient(circle, rgba(57,213,255,0.25), transparent 70%)" }}
        />

        <div className="container-lbg relative grid gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-28">
          <div className="animate-rise">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary">
              <span className="size-1.5 animate-pulse rounded-full bg-primary" />
              {t({ fr: "Enlèvement à domicile en 24 h", en: "Home pickup within 24 h" })}
            </span>
            <h1 className="mt-6 font-display text-[clamp(2.4rem,5vw,4.1rem)] font-extrabold leading-[1.04]">
              {t({ fr: "Vos colis partent", en: "Your parcels leave" })}{" "}
              <span className="text-gradient">{t({ fr: "aujourd'hui", en: "today" })}</span>
              {t({ fr: ", où qu'ils aillent.", en: ", wherever they go." })}
            </h1>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-muted">
              {t({
                fr: "Colis et déménagements en Île-de-France, envois vers le Bénin, le Togo et le Mali. Prix affiché en 30 secondes, enlèvement chez vous, facture avec TVA, suivi en ligne sans créer de compte.",
                en: "Parcels and moving across Greater Paris, shipping to Benin, Togo and Mali. Price in 30 seconds, pickup at your door, invoice with VAT, online tracking without an account.",
              })}
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-primary">
              {t({
                fr: "10 kg vers l'Afrique de l'Ouest : 94,99 € chez nous en aérien, contre 148,99 € en Colissimo International (tarif officiel La Poste – Zone C). Petits colis en France dès 8,99 €.",
                en: "10 kg to West Africa: €94.99 with us by air, versus €148.99 with Colissimo International (official La Poste rate – Zone C). Small parcels in France from €8.99.",
              })}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                to="/devis"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary-strong"
              >
                {t({ fr: "Obtenir mon prix", en: "Get my price" })}
                <ArrowRight className="size-4" />
              </Link>
              <Link
                to="/suivi"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold transition hover:border-primary/50 hover:text-primary"
              >
                <Package className="size-4" />
                {t({ fr: "Suivre un colis", en: "Track a parcel" })}
              </Link>
              <a
                href={whatsappLink(t({ fr: "Bonjour, j'ai un envoi à organiser.", en: "Hello, I have a shipment to organise." }))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-semibold text-muted transition hover:text-primary"
              >
                <MessageCircle className="size-4" />
                {CONTACT.phone}
              </a>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-border pt-8 sm:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.value}>
                  <dt className="font-display text-2xl font-extrabold text-primary">{stat.value}</dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">{t(stat)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-rise [animation-delay:180ms]">
            <PriceCalculator />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <Section id="services">
        <SectionHead
          eyebrow={t({ fr: "Nos services", en: "Our services" })}
          title={t({ fr: "Un transporteur, tous vos besoins", en: "One carrier, every need" })}
          lead={t({
            fr: "Du pli urgent au déménagement complet, la même exigence : un prix clair, un interlocuteur, un suivi.",
            en: "From an urgent envelope to a full move, the same standard: clear pricing, one contact, full tracking.",
          })}
        />
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Reveal key={service.fr} delay={i * 60}>
              <Link to={service.href} className="group block h-full">
                <Card className="h-full overflow-hidden p-0">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={service.image}
                      alt=""
                      className="size-full object-cover opacity-70 transition duration-500 group-hover:scale-105 group-hover:opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
                    <span className="absolute bottom-3 left-4 grid size-10 place-items-center rounded-xl border border-primary/40 bg-background/80 text-primary">
                      <service.icon className="size-5" />
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold">{t(service)}</h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {t({ fr: service.descFr, en: service.descEn })}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                      {t({ fr: "En savoir plus", en: "Learn more" })}
                      <ArrowRight className="size-3.5 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Card>
              </Link>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* POSITIONNEMENT */}
      <ProblemSolution className="border-y border-border bg-surface/40" />

      {/* PROCESS */}
      <Section className="border-y border-border bg-surface/40">
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <SectionHead
              eyebrow={t({ fr: "Comment ça marche", en: "How it works" })}
              title={t({ fr: "Quatre étapes, zéro surprise", en: "Four steps, no surprises" })}
              lead={t({
                fr: "Le prix affiché est le prix payé. Pas de frais de dossier, pas de supplément carburant caché.",
                en: "The displayed price is the price you pay. No admin fees, no hidden fuel surcharge.",
              })}
            />
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/tarifs"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:border-primary/50 hover:text-primary"
              >
                {t({ fr: "Voir la grille tarifaire", en: "See the price list" })}
              </Link>
              <Link
                to="/aide"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:border-primary/50 hover:text-primary"
              >
                {t({ fr: "Parler à un conseiller", en: "Talk to an advisor" })}
              </Link>
            </div>
          </div>
          <ol className="space-y-4">
            {STEPS.map((step, i) => (
              <Reveal as="li" key={step.fr} delay={i * 80}>
                <div className="glass flex gap-5 rounded-card p-5">
                  <span className="font-display text-3xl font-extrabold text-primary/40">{`0${i + 1}`}</span>
                  <div>
                    <h3 className="font-display text-base font-bold">{t(step)}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">
                      {t({ fr: step.descFr, en: step.descEn })}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* ZONES */}
      <Section>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-card border border-border">
              <img src="/images/aerien-2.jpg" alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-tr from-background/80 via-transparent to-transparent" />
              <div className="glass absolute bottom-5 left-5 right-5 rounded-2xl p-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Globe2 className="size-4 text-primary" />
                  {t({ fr: "Aérien, maritime et routier combinés", en: "Air, sea and road combined" })}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {t({
                    fr: "Nous choisissons le mode le plus rapide au meilleur coût pour chaque envoi.",
                    en: "We pick the fastest mode at the best cost for every shipment.",
                  })}
                </p>
              </div>
            </div>
          </Reveal>
          <div>
            <SectionHead
              eyebrow={t({ fr: "Zones desservies", en: "Coverage" })}
              title={t({ fr: "De la porte à côté à l'autre continent", en: "From next door to another continent" })}
            />
            <ul className="mt-8 divide-y divide-border overflow-hidden rounded-card border border-border">
              {ZONES_HOME.map((zone) => (
                <li key={zone.fr} className="flex items-center justify-between gap-4 bg-surface/40 px-5 py-4">
                  <span className="flex items-center gap-2.5 text-sm font-medium">
                    <MapPin className="size-4 text-primary" />
                    {t(zone)}
                  </span>
                  <span className="flex items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      {zone.delay}
                    </span>
                    {zone.price ? (
                      <span className="font-display text-sm font-bold text-foreground">
                        {t({ fr: "dès", en: "from" })} {zone.price}
                      </span>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to="/zones"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              {t({ fr: "Détail des délais par pays", en: "Transit times by country" })}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </Section>

      {/* COMPARATIF */}
      <ComparisonTable className="border-t border-border bg-surface/40" />

      {/* GARANTIES */}
      <Section className="border-y border-border bg-surface/40">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              fr: "Assuré chez Simplis, jusqu'à 100 000 €",
              en: "Insured with Simplis, up to €100,000",
              descFr: "Responsabilité civile professionnelle, biens confiés couverts jusqu'à 100 000 € par sinistre, franchise de 200 €. Assureur et plafonds publiés sur le site.",
              descEn: "Professional liability insurance, goods entrusted covered up to €100,000 per claim, €200 deductible. Insurer and limits published on the site.",
            },
            {
              icon: Truck,
              fr: "Flotte adaptée",
              en: "Right vehicle, every time",
              descFr: "Du scooter au 20 m³ avec hayon : le véhicule est choisi selon le volume réel.",
              descEn: "From scooter to 20 m³ tail-lift van: the vehicle matches the actual volume.",
            },
            {
              icon: Clock,
              fr: "Support 7j/7",
              en: "Support 7 days a week",
              descFr: "WhatsApp, téléphone, email : un humain répond entre 8 h et 20 h, samedi et dimanche inclus.",
              descEn: "WhatsApp, phone, email: a human answers from 8 am to 8 pm, weekends included.",
            },
          ].map((item, i) => (
            <Reveal key={item.fr} delay={i * 70}>
              <Card className="h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/12 text-primary">
                  <item.icon className="size-5" />
                </span>
                <h3 className="mt-5 font-display text-base font-bold">{t(item)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t({ fr: item.descFr, en: item.descEn })}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <DeliveriesGallery />

      {/* AVIS TRUSTPILOT */}
      <Section>
        <SectionHead
          align="center"
          eyebrow={t({ fr: "Avis clients", en: "Customer reviews" })}
          title={t({ fr: "Ce que nos clients écrivent", en: "What our customers write" })}
          lead={t({
            fr: "Des avis publics et vérifiables, publiés directement sur Trustpilot. Nous n'en inventons aucun.",
            en: "Public, verifiable reviews published directly on Trustpilot. We make none of them up.",
          })}
        />

        <div className="mt-10 flex justify-center">
          <a
            href={TRUSTPILOT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="glass glow-ring flex items-center gap-4 rounded-card px-6 py-4 transition hover:border-primary"
          >
            <div className="flex gap-0.5 text-primary">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="size-5 fill-current" />
              ))}
            </div>
            <div className="text-left">
              <p className="font-display text-lg font-bold leading-none">
                {TRUSTPILOT_SCORE}
                <span className="text-muted">/5</span>
              </p>
              <p className="mt-1 text-xs text-muted">
                {t({
                  fr: `${TRUSTPILOT_COUNT} avis sur Trustpilot`,
                  en: `${TRUSTPILOT_COUNT} reviews on Trustpilot`,
                })}
              </p>
            </div>
          </a>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((item, i) => (
            <Reveal key={item.name} delay={i * 70}>
              <Card className="h-full">
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star key={s} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed">« {item.text} »</p>
                <p className="mt-5 font-display text-sm font-bold">{item.name}</p>
                <p className="text-xs text-muted">
                  {t(item.date)} · {t({ fr: "avis Trustpilot", en: "Trustpilot review" })}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          {t({ fr: "Vous avez fait appel à nous ?", en: "Have you used our service?" })}{" "}
          <a
            href={`${TRUSTPILOT_URL}#write-review`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
            {t({ fr: "Laissez votre avis sur Trustpilot", en: "Leave your review on Trustpilot" })}
          </a>
        </p>
      </Section>

      {/* FAQ COURTE */}
      <Section className="border-t border-border bg-surface/40">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHead
            eyebrow="FAQ"
            title={t({ fr: "Les questions qu'on nous pose", en: "What people ask us" })}
            lead={
              <Link to="/faq" className="font-semibold text-primary hover:underline">
                {t({ fr: "Voir toutes les questions", en: "See all questions" })}
              </Link>
            }
          />
          <div className="space-y-4">
            {FAQ_SHORT.map((item, i) => (
              <Reveal key={item.q.fr} delay={i * 60}>
                <div className="glass rounded-card p-6">
                  <h3 className="font-display text-base font-bold">{t(item.q)}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">{t(item.a)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border">
        <img src="/images/livraison-2.jpg" alt="" className="absolute inset-0 size-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
        <div className="container-lbg relative py-20 text-center">
          <h2 className="mx-auto max-w-2xl font-display text-3xl font-extrabold leading-tight md:text-[2.6rem]">
            {t({ fr: "Un envoi à organiser aujourd'hui ?", en: "Something to ship today?" })}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-muted">
            {t({
              fr: "Obtenez votre prix en 30 secondes ou appelez-nous : on organise l'enlèvement dans la journée.",
              en: "Get your price in 30 seconds or call us: we can arrange pickup the same day.",
            })}
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              to="/devis"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              {t({ fr: "Calculer mon tarif", en: "Calculate my price" })}
              <ArrowRight className="size-4" />
            </Link>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-7 py-4 font-semibold transition hover:border-primary/50 hover:text-primary"
            >
              {CONTACT.phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Index;
