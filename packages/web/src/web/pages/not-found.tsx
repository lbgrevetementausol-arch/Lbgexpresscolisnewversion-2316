import { Link } from "wouter";
import { ArrowLeft, Package, Search } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { Section } from "../components/site/section";

export default function NotFoundPage() {
  const { t } = useI18n();
  // Le serveur renvoie 200 pour toute URL inconnue (SPA) : le noindex évite
  // que Google tente d'indexer ces pages et les compte en « Soft 404 ».
  useSeo({
    title: t({ fr: "Page introuvable — LBG Express Colis", en: "Page not found — LBG Express Colis" }),
    description: t({
      fr: "Cette page n'existe pas ou plus. Revenez à l'accueil ou suivez votre colis.",
      en: "This page does not exist any more. Go back home or track your parcel.",
    }),
    path: "/404",
    noindex: true,
  });

  return (
    <Section className="py-24 md:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-display text-[5rem] font-extrabold leading-none text-primary">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold">
          {t({ fr: "Cette page a été livrée ailleurs", en: "This page was delivered elsewhere" })}
        </h1>
        <p className="mt-4 text-muted">
          {t({
            fr: "Le lien est peut-être obsolète. Revenez à l'accueil ou suivez directement votre colis.",
            en: "The link may be outdated. Go back home or track your parcel directly.",
          })}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
          >
            <ArrowLeft className="size-4" />
            {t({ fr: "Retour à l'accueil", en: "Back home" })}
          </Link>
          <Link
            to="/suivi"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:border-primary/50 hover:text-foreground"
          >
            <Search className="size-4" />
            {t({ fr: "Suivre un colis", en: "Track a parcel" })}
          </Link>
          <Link
            to="/devis"
            className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted transition hover:border-primary/50 hover:text-foreground"
          >
            <Package className="size-4" />
            {t({ fr: "Demander un devis", en: "Get a quote" })}
          </Link>
        </div>
      </div>
    </Section>
  );
}
