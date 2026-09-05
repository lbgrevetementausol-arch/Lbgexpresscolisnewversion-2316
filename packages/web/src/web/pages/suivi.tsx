import { useState } from "react";
import { Link } from "wouter";
import { AlertCircle, Loader2, MessageCircle, Package, Search } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { CONTACT, whatsappLink } from "../lib/format";
import { PageHero } from "../components/site/layout";
import { Section } from "../components/site/section";
import { Input } from "../components/site/field";
import { TrackingTimeline } from "../components/site/tracking-timeline";
import { useTracking } from "../queries/tracking";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { GuidesSection, GUIDES_SUIVI } from "../components/site/guides";

const DEMOS = ["TRK-20260824-DEMO01", "TRK-20260820-DEMO02", "TRK-20260812-DEMO03"];

export default function SuiviPage() {
  const { t } = useI18n();

  useSeo(SEO_ROUTES["/suivi"]);
  const initial = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search).get("n") ?? "";
  const [value, setValue] = useState(initial);
  const [query, setQuery] = useState(initial);
  const tracking = useTracking(query, query.length > 3);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(value.trim().toUpperCase());
  };

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Suivi en temps réel", en: "Real-time tracking" })}
        title={t({ fr: "Où est mon colis ?", en: "Where is my parcel?" })}
        lead={t({
          fr: "Entrez votre numéro de suivi LBG (format TRK-AAAAMMJJ-XXXXXX) pour voir la position du colis, l'historique complet et la date de livraison estimée.",
          en: "Enter your LBG tracking number (format TRK-YYYYMMDD-XXXXXX) to see the parcel position, full history and estimated delivery date.",
        })}
        image="/images/entrepot.jpg"
      >
        <form onSubmit={submit} className="flex max-w-xl flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="TRK-20260824-DEMO01"
              className="pl-11 uppercase"
              aria-label={t({ fr: "Numéro de suivi", en: "Tracking number" })}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-strong"
          >
            <Package className="size-4" />
            {t({ fr: "Suivre", en: "Track" })}
          </button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{t({ fr: "Exemples :", en: "Examples:" })}</span>
          {DEMOS.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setValue(d);
                setQuery(d);
              }}
              className="rounded-full border border-border px-2.5 py-1 font-medium transition hover:border-primary/50 hover:text-primary"
            >
              {d}
            </button>
          ))}
        </div>
      </PageHero>

      <Section>
        {tracking.isLoading && query.length > 3 ? (
          <div className="flex items-center gap-3 text-muted">
            <Loader2 className="size-5 animate-spin text-primary" />
            {t({ fr: "Recherche du colis…", en: "Looking up your parcel…" })}
          </div>
        ) : null}

        {tracking.isError ? (
          <div className="glass max-w-2xl rounded-card p-6">
            <p className="flex items-center gap-2 font-display text-lg font-bold text-danger">
              <AlertCircle className="size-5" />
              {t({ fr: "Colis introuvable", en: "Parcel not found" })}
            </p>
            <p className="mt-3 text-sm text-muted">
              {t({
                fr: "Vérifiez le numéro (format TRK-AAAAMMJJ-XXXXXX). Un colis tout juste enregistré peut mettre quelques minutes à apparaître.",
                en: "Check the number (format TRK-YYYYMMDD-XXXXXX). A newly registered parcel can take a few minutes to appear.",
              })}
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <a
                href={whatsappLink(t({ fr: `Bonjour, je cherche mon colis ${query}`, en: `Hello, I am looking for my parcel ${query}` }))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground transition hover:bg-primary-strong"
              >
                <MessageCircle className="size-4" />
                {t({ fr: "Demander sur WhatsApp", en: "Ask on WhatsApp" })}
              </a>
              <a
                href={CONTACT.phoneHref}
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 font-medium text-muted transition hover:border-primary/50 hover:text-foreground"
              >
                {CONTACT.phone}
              </a>
            </div>
          </div>
        ) : null}

        {tracking.data ? (
          <TrackingTimeline
            parcel={tracking.data.parcel}
            events={tracking.data.events}
            position={tracking.data.position}
          />
        ) : null}

        {!tracking.data && !tracking.isError && !tracking.isLoading ? (
          <div className="glass max-w-2xl rounded-card p-6">
            <h2 className="font-display text-lg font-bold">
              {t({ fr: "Pas encore de numéro de suivi ?", en: "No tracking number yet?" })}
            </h2>
            <p className="mt-3 text-sm text-muted">
              {t({
                fr: "Le numéro TRK est généré dès la validation de votre commande, et envoyé par email. Vous pouvez aussi nous écrire sur WhatsApp avec votre nom et l'adresse de livraison.",
                en: "The TRK number is generated as soon as your order is confirmed and sent by email. You can also message us on WhatsApp with your name and delivery address.",
              })}
            </p>
            <Link
              to="/devis"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              {t({ fr: "Créer une expédition", en: "Create a shipment" })}
            </Link>
          </div>
        ) : null}
      </Section>

      <GuidesSection guides={GUIDES_SUIVI} />
    </>
  );
}
