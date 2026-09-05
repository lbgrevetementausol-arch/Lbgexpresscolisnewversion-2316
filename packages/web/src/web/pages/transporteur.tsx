import { useState } from "react";
import { CheckCircle2, Euro, FileCheck2, Loader2, MapPinned, Smartphone, Truck } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { CONTACT, whatsappLink } from "../lib/format";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { Field, Input, Select, Textarea } from "../components/site/field";
import { Reveal } from "../components/site/reveal";
import { trackContact } from "../lib/pixels";
import { useApplyCarrier } from "../queries/content";

const PERKS = [
  {
    icon: Euro,
    fr: "Courses payées sous 7 jours",
    en: "Jobs paid within 7 days",
    descFr: "Facturation automatique à la course, virement hebdomadaire, aucune commission cachée.",
    descEn: "Automatic per-job invoicing, weekly transfer, no hidden commission.",
  },
  {
    icon: MapPinned,
    fr: "Des tournées près de chez vous",
    en: "Routes close to you",
    descFr: "Vous choisissez vos zones et vos créneaux : messagerie urbaine, régional, ou longue distance.",
    descEn: "You pick your areas and slots: urban courier, regional, or long distance.",
  },
  {
    icon: Smartphone,
    fr: "Une app livreur simple",
    en: "A simple driver app",
    descFr: "Courses, adresses, statuts et partage de position en trois taps depuis votre téléphone.",
    descEn: "Jobs, addresses, statuses and location sharing in three taps from your phone.",
  },
  {
    icon: FileCheck2,
    fr: "Volume régulier, zéro prospection",
    en: "Steady volume, zero prospecting",
    descFr: "Nos clients particuliers et pro alimentent le planning, vous roulez au lieu de démarcher.",
    descEn: "Our retail and business clients fill the planning — you drive instead of chasing leads.",
  },
];

const VEHICLES = [
  { fr: "Voiture / break", en: "Car / estate" },
  { fr: "Fourgonnette (3 m³)", en: "Small van (3 m³)" },
  { fr: "Fourgon 12 m³", en: "Van 12 m³" },
  { fr: "Fourgon 20 m³", en: "Van 20 m³" },
  { fr: "Camion 20 t (hayon)", en: "20 t truck (tail lift)" },
  { fr: "Deux-roues / cargo", en: "Two-wheeler / cargo bike" },
];

const STEPS = [
  {
    fr: "Vous candidatez",
    en: "You apply",
    descFr: "Formulaire ci-dessous, 2 minutes. Nous vérifions votre zone et votre véhicule.",
    descEn: "The form below takes 2 minutes. We check your area and your vehicle.",
  },
  {
    fr: "Dossier & conformité",
    en: "Documents & compliance",
    descFr: "KBIS, licence de transport, attestation d'assurance marchandises et permis.",
    descEn: "Company registration, transport licence, goods insurance certificate and licence.",
  },
  {
    fr: "Accès à l'espace livreur",
    en: "Driver area access",
    descFr: "Vous recevez vos identifiants et vos premières courses arrivent dans la semaine.",
    descEn: "You get your credentials and your first jobs land within the week.",
  },
];

export default function TransporteurPage() {
  const { t } = useI18n();
  const apply = useApplyCarrier();
  useSeo(SEO_ROUTES["/devenir-transporteur"]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [vehicle, setVehicle] = useState(VEHICLES[2]!.fr);
  const [capacity, setCapacity] = useState("");
  const [siret, setSiret] = useState("");
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    apply.mutate({
      name,
      email,
      phone,
      city,
      vehicle,
      capacityM3: capacity ? Number(capacity) : undefined,
      siret: siret || undefined,
      message: message || undefined,
    }, { onSuccess: () => trackContact({ content_name: "Candidature transporteur" }) });
  };

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Devenir transporteur partenaire", en: "Become a partner carrier" })}
        title={t({ fr: "Roulez avec LBG Express Colis", en: "Drive with LBG Express Colis" })}
        lead={t({
          fr: "Vous êtes chauffeur indépendant, artisan du transport ou petite flotte ? Nous confions chaque semaine des courses colis, palettes et déménagements à nos partenaires en France et vers l'international.",
          en: "Independent driver, owner-operator or small fleet? Every week we hand parcel, pallet and moving jobs to our partners across France and internationally.",
        })}
        image="/images/van-night.jpg"
      >
        <div className="flex flex-wrap gap-3">
          <a
            href="#candidature"
            className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
          >
            {t({ fr: "Déposer ma candidature", en: "Submit my application" })}
          </a>
          <a
            href={whatsappLink(
              t({
                fr: "Bonjour, je suis transporteur et je souhaite travailler avec LBG Express Colis.",
                en: "Hello, I'm a carrier and I'd like to work with LBG Express Colis.",
              }),
            )}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold transition hover:border-primary/50"
          >
            {t({ fr: "En parler sur WhatsApp", en: "Chat on WhatsApp" })}
          </a>
        </div>
      </PageHero>

      <Section>
        <SectionHead
          eyebrow={t({ fr: "Pourquoi nous rejoindre", en: "Why join us" })}
          title={t({ fr: "Du volume, payé vite, sans paperasse inutile", en: "Volume, paid fast, without pointless paperwork" })}
          lead={t({
            fr: "Nous gérons la relation client, la tarification et le suivi. Vous vous concentrez sur la route.",
            en: "We handle the customer relationship, pricing and tracking. You focus on the road.",
          })}
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PERKS.map((perk, i) => (
            <Reveal key={perk.fr} delay={i * 70}>
              <Card className="h-full">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/15 text-primary">
                  <perk.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold">{t(perk)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {t({ fr: perk.descFr, en: perk.descEn })}
                </p>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-y border-border bg-surface/40">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <Reveal>
            <img
              src="/images/entrepot.jpg"
              alt=""
              className="rounded-card border border-border object-cover"
            />
          </Reveal>
          <div>
            <SectionHead
              eyebrow={t({ fr: "Le parcours", en: "The process" })}
              title={t({ fr: "Trois étapes avant votre première course", en: "Three steps before your first job" })}
            />
            <ol className="mt-8 grid gap-4">
              {STEPS.map((step, i) => (
                <Reveal key={step.fr} delay={i * 80} as="li">
                  <div className="flex gap-4 rounded-card border border-border bg-surface-2/60 p-5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 font-display text-sm font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-display text-base font-bold">{t(step)}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {t({ fr: step.descFr, en: step.descEn })}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section id="candidature">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <Card hover={false}>
            <h2 className="font-display text-xl font-bold">
              {t({ fr: "Candidature transporteur", en: "Carrier application" })}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {t({
                fr: "Tous les profils sont étudiés : deux-roues, fourgon, camion hayon, flotte régionale.",
                en: "All profiles are reviewed: two-wheelers, vans, tail-lift trucks, regional fleets.",
              })}
            </p>

            {apply.isSuccess ? (
              <div className="mt-6 rounded-card border border-success/40 bg-success/10 p-5">
                <p className="flex items-center gap-2 font-semibold text-success">
                  <CheckCircle2 className="size-5" />
                  {t({ fr: "Candidature reçue", en: "Application received" })}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {t({
                    fr: "Notre équipe exploitation vous rappelle sous 48 h ouvrées pour valider votre dossier et vos zones.",
                    en: "Our operations team will call you back within 48 working hours to validate your file and areas.",
                  })}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label={t({ fr: "Nom et prénom", en: "Full name" })}>
                  <Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label={t({ fr: "Téléphone", en: "Phone" })}>
                  <Input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 6 ..."
                  />
                </Field>
                <Field label={t({ fr: "Ville de rattachement", en: "Home base city" })}>
                  <Input required value={city} onChange={(e) => setCity(e.target.value)} placeholder="Paris" />
                </Field>
                <Field label={t({ fr: "Véhicule", en: "Vehicle" })}>
                  <Select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
                    {VEHICLES.map((v) => (
                      <option key={v.fr} value={v.fr}>
                        {t(v)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field
                  label={t({ fr: "Capacité (m³)", en: "Capacity (m³)" })}
                  hint={t({ fr: "Optionnel", en: "Optional" })}
                >
                  <Input
                    type="number"
                    min={0}
                    step="0.5"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="12"
                  />
                </Field>
                <Field
                  label="SIRET"
                  className="sm:col-span-2"
                  hint={t({
                    fr: "Optionnel — obligatoire avant la première course.",
                    en: "Optional — required before your first job.",
                  })}
                >
                  <Input value={siret} onChange={(e) => setSiret(e.target.value)} />
                </Field>
                <Field
                  label={t({ fr: "Vos zones, disponibilités, expérience", en: "Your areas, availability, experience" })}
                  className="sm:col-span-2"
                >
                  <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
                </Field>

                {apply.isError ? (
                  <p className="text-sm text-danger sm:col-span-2">
                    {t({
                      fr: "Envoi impossible. Vérifiez vos informations ou appelez-nous.",
                      en: "Could not send. Check your details or give us a call.",
                    })}
                  </p>
                ) : null}

                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={apply.isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
                  >
                    {apply.isPending ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
                    {t({ fr: "Envoyer ma candidature", en: "Send my application" })}
                  </button>
                </div>
              </form>
            )}
          </Card>

          <Reveal delay={80}>
            <Card hover={false} className="lg:sticky lg:top-28">
              <h3 className="font-display text-lg font-bold">
                {t({ fr: "Documents à prévoir", en: "Documents to prepare" })}
              </h3>
              <ul className="mt-4 grid gap-2 text-sm text-muted">
                {[
                  { fr: "Extrait KBIS de moins de 3 mois", en: "Company registration less than 3 months old" },
                  { fr: "Licence de transport intérieur ou communautaire", en: "Domestic or EU transport licence" },
                  { fr: "Attestation d'assurance marchandises transportées", en: "Goods-in-transit insurance certificate" },
                  { fr: "Permis de conduire et carte grise du véhicule", en: "Driving licence and vehicle registration" },
                  { fr: "Attestation de vigilance URSSAF", en: "URSSAF compliance certificate" },
                ].map((doc) => (
                  <li key={doc.fr} className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                    {t(doc)}
                  </li>
                ))}
              </ul>
              <div className="mt-6 border-t border-border pt-5 text-sm">
                <p className="text-muted">
                  {t({ fr: "Une question avant de candidater ?", en: "A question before applying?" })}
                </p>
                <a href={CONTACT.phoneHref} className="mt-1 block font-display font-bold text-primary">
                  {CONTACT.phone}
                </a>
                <a href={`mailto:${CONTACT.email}`} className="text-muted hover:text-foreground">
                  {CONTACT.email}
                </a>
              </div>
            </Card>
          </Reveal>
        </div>
      </Section>
    </>
  );
}
