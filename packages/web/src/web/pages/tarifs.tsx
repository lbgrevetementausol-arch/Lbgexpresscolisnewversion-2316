import { Link } from "wouter";
import { NewsletterInline } from "../components/site/newsletter-inline";
import { Check, Loader2 } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { money } from "../lib/format";
import { PageHero } from "../components/site/layout";
import { Card, Section, SectionHead } from "../components/site/section";
import { Reveal } from "../components/site/reveal";
import { PriceCalculator } from "../components/site/price-calculator";
import { useQuoteOptions } from "../queries/quotes";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { GuidesSection, GUIDES_COLIS } from "../components/site/guides";

const FORMULES = [
  {
    id: "economique",
    fr: "Économique",
    en: "Economy",
    from: 10.9,
    coef: "-15 %",
    descFr: "Le meilleur prix quand la date n'est pas critique. Groupage, délais élargis.",
    descEn: "Best price when the date is flexible. Groupage, extended lead times.",
    points: [
      { fr: "Suivi TRK inclus", en: "TRK tracking included" },
      { fr: "Dépôt et retrait en point relais", en: "Drop-off and pickup point" },
      { fr: "Support par email", en: "Email support" },
    ],
  },
  {
    id: "standard",
    fr: "Standard",
    en: "Standard",
    from: 12.9,
    coef: "référence",
    descFr: "Le meilleur équilibre prix / délai. 1 à 3 jours ouvrés en France métropolitaine.",
    descEn: "The best price/speed balance. 1 to 3 working days in mainland France.",
    points: [
      { fr: "Enlèvement à domicile", en: "Home pickup" },
      { fr: "Notification du destinataire", en: "Recipient notification" },
      { fr: "Support WhatsApp 6j/7", en: "WhatsApp support 6 days a week" },
    ],
    featured: true,
  },
  {
    id: "express",
    fr: "Express 24-48 h",
    en: "Express 24-48 h",
    from: 18.7,
    coef: "+45 %",
    descFr: "Priorité de chargement, trajet direct et créneau garanti pour les envois urgents.",
    descEn: "Loading priority, direct run and guaranteed slot for urgent shipments.",
    points: [
      { fr: "Prise en charge sous 2 h en IDF", en: "Pickup within 2 h in Greater Paris" },
      { fr: "Suivi GPS du livreur", en: "Driver GPS tracking" },
      { fr: "Preuve de livraison photo", en: "Photo proof of delivery" },
    ],
  },
  {
    id: "premium",
    fr: "Premium sur-mesure",
    en: "Premium bespoke",
    from: 24.5,
    coef: "+90 %",
    descFr: "Véhicule dédié, manutention renforcée et coordination de A à Z par un référent unique.",
    descEn: "Dedicated vehicle, reinforced handling and end-to-end coordination by a single contact.",
    points: [
      { fr: "Créneau à l'heure près", en: "Slot to the hour" },
      { fr: "Emballage professionnel inclus", en: "Professional packing included" },
      { fr: "Assurance valeur déclarée", en: "Declared-value insurance" },
    ],
  },
];

const OPTIONS = [
  { fr: "Enlèvement à domicile", en: "Home pickup", price: "+ 7,90 € HT — 9,48 € TTC" },
  { fr: "Emballage professionnel", en: "Professional packing", price: "+ 14,90 € HT — 17,88 € TTC / lot" },
  { fr: "Carton standard fourni", en: "Standard box supplied", price: "4,50 € HT — 5,40 € TTC / unité" },
  { fr: "Contenu fragile", en: "Fragile contents", price: "+ 9 %" },
  {
    fr: "Assurance ad valorem",
    en: "Ad valorem insurance",
    price: "0,7 % de la valeur (min. 8 € HT — 9,60 € TTC)",
  },
  {
    fr: "Étage sans ascenseur (au-delà du 2e)",
    en: "Floor without lift (above 2nd)",
    price: "+ 15 € HT — 18 € TTC / étage / 10 m³",
  },
  { fr: "Monte-meuble (fenêtre / balcon)", en: "Furniture hoist (window / balcony)", price: "180 € HT — 216 € TTC" },
  { fr: "Express Île-de-France", en: "Express Greater Paris", price: "+ 35 € HT — 42 € TTC" },
  { fr: "Express hors Île-de-France", en: "Express outside Greater Paris", price: "+ 30 % du transport" },
  { fr: "Surcharge carburant", en: "Fuel surcharge", price: "14,2 % du transport HT" },
];

export default function TarifsPage() {
  const { t, lang } = useI18n();

  useSeo(SEO_ROUTES["/tarifs"]);
  const options = useQuoteOptions();

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Tarifs", en: "Pricing" })}
        title={t({ fr: "Une grille claire, un prix ferme", en: "A clear grid, a firm price" })}
        lead={t({
          fr: "Base par zone + prix au kilo (ou au m³ pour les volumes), multiplié par la formule choisie. Les options sont facturées à l'unité, jamais au forfait caché.",
          en: "Zone base + price per kilo (or per m³ for volumes), multiplied by your chosen service level. Options are billed per unit, never as hidden lump sums.",
        })}
        image="/images/palette.jpg"
      />

      <Section>
        <SectionHead
          eyebrow={t({ fr: "Formules", en: "Service levels" })}
          title={t({ fr: "Quatre niveaux de service", en: "Four service levels" })}
        />
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {FORMULES.map((f, i) => (
            <Reveal key={f.id} delay={i * 60}>
              <Card
                className={
                  f.featured
                    ? "h-full border-primary/45 shadow-[0_24px_70px_-40px_rgba(57,213,255,0.55)]"
                    : "h-full"
                }
              >
                {f.featured ? (
                  <span className="mb-3 inline-block rounded-full bg-primary px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wider text-primary-foreground">
                    {t({ fr: "Le plus choisi", en: "Most chosen" })}
                  </span>
                ) : null}
                <h3 className="font-display text-lg font-bold">{t(f)}</h3>
                <p className="mt-3 text-xs uppercase tracking-wider text-muted">
                  {t({ fr: "À partir de", en: "From" })}
                </p>
                <p className="font-display text-3xl font-extrabold text-primary">{money(f.from, lang)}</p>
                <p className="text-xs font-semibold text-muted">
                  {t({ fr: "HT · soit", en: "excl. VAT · i.e." })} {money(Math.round(f.from * 1.2 * 100) / 100, lang)}{" "}
                  {t({ fr: "TTC", en: "incl. VAT" })}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {t({ fr: "coefficient", en: "coefficient" })} : {f.coef}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-muted">{t({ fr: f.descFr, en: f.descEn })}</p>
                <ul className="mt-4 space-y-2 text-sm">
                  {f.points.map((p) => (
                    <li key={p.fr} className="flex items-start gap-2 text-muted">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {t(p)}
                    </li>
                  ))}
                </ul>
                <Link
                  to={`/devis?service=${f.id}`}
                  className={
                    f.featured
                      ? "mt-6 block rounded-xl bg-primary px-4 py-2.5 text-center text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
                      : "mt-6 block rounded-xl border border-border px-4 py-2.5 text-center text-sm font-semibold text-muted transition hover:border-primary/50 hover:text-foreground"
                  }
                >
                  {t({ fr: "Choisir", en: "Choose" })}
                </Link>
              </Card>
            </Reveal>
          ))}
        </div>
      </Section>

      <Section className="border-t border-border bg-surface/40">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <SectionHead
              eyebrow={t({ fr: "Grille par zone", en: "Zone grid" })}
              title={t({ fr: "Base, prix au kilo et délais", en: "Base, per-kilo price and lead times" })}
              lead={t({
                fr: "Montants en euros (EUR), hors taxes, formule Standard et hors options : la surcharge carburant et la TVA de 20 % s'ajoutent. Le devis que vous recevez affiche le total à payer, toutes taxes et tous frais compris. Le poids taxable retenu est le plus élevé entre poids réel et poids volumétrique (L × l × H / 5000).",
                en: "Amounts in euros (EUR), excluding tax, Standard level and excluding options: the fuel surcharge and 20% VAT are added. The quote you receive shows the total amount payable, all taxes and fees included. Chargeable weight is the higher of actual and volumetric weight (L × W × H / 5000).",
              })}
            />
            <div className="mt-8 overflow-hidden rounded-card border border-border">
              {options.isLoading ? (
                <div className="flex items-center gap-2 p-6 text-sm text-muted">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  {t({ fr: "Chargement de la grille…", en: "Loading the grid…" })}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t({ fr: "Zone", en: "Zone" })}</th>
                      <th className="px-4 py-3 font-semibold">{t({ fr: "Base ≤ 5 kg", en: "Base ≤ 5 kg" })}</th>
                      <th className="px-4 py-3 font-semibold">{t({ fr: "5–30 kg", en: "5–30 kg" })}</th>
                      <th className="px-4 py-3 font-semibold">{t({ fr: "> 30 kg", en: "> 30 kg" })}</th>
                      <th className="px-4 py-3 font-semibold">{t({ fr: "Délai", en: "Lead time" })}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(options.data?.zones ?? []).map((z) => (
                      <tr key={z.id} className="border-t border-border">
                        <td className="px-4 py-3 font-medium">{t(z.label)}</td>
                        <td className="px-4 py-3 tabular-nums text-muted">{money(z.base, lang)}</td>
                        <td className="px-4 py-3 tabular-nums text-muted">{money(z.perKg, lang)}/kg</td>
                        <td className="px-4 py-3 tabular-nums text-muted">{money(z.perKgHeavy, lang)}/kg</td>
                        <td className="px-4 py-3 text-muted">
                          {z.days[0] === z.days[1]
                            ? `${z.days[0]} ${t({ fr: "jour ouvré", en: "working day" })}`
                            : `${z.days[0]}–${z.days[1]} ${t({ fr: "jours ouvrés", en: "working days" })}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <p className="mt-3 text-xs text-muted">
              {t({
                fr: `Palette Europe : de 65 € HT (moins de 50 km) à 240 € HT (plus de 300 km). Déménagement : de 40 à 165 € HT le m³ selon la formule et la distance. Surcharge carburant ${options.data?.config.fuelSurchargePercent ?? 14.2} % et TVA ${options.data?.config.vatRate ?? 20} % appliquées au total.`,
                en: `Europe pallet: from €65 excl. VAT (under 50 km) to €240 excl. VAT (over 300 km). Moving: €40 to €165 excl. VAT per m³ depending on level and distance. Fuel surcharge ${options.data?.config.fuelSurchargePercent ?? 14.2}% and ${options.data?.config.vatRate ?? 20}% VAT applied to the total.`,
              })}
            </p>

            <h3 className="mt-10 font-display text-lg font-bold">{t({ fr: "Options", en: "Options" })}</h3>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {OPTIONS.map((o) => (
                <li
                  key={o.fr}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface-2/60 px-4 py-3 text-sm"
                >
                  <span className="text-muted">{t(o)}</span>
                  <span className="font-semibold tabular-nums">{o.price}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:sticky lg:top-24">
            <PriceCalculator />
          </div>
        </div>
      </Section>

      <GuidesSection guides={GUIDES_COLIS} />
    <NewsletterInline source="tarifs" />
    </>
  );
}
