import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Cookie } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { applyConsent, getConsent, setConsent } from "../../lib/consent";

/**
 * Bandeau de consentement cookies : accepter ou refuser, choix mémorisé 6 mois.
 * Le refus coupe la mesure d'audience et toute publicité / remarketing.
 */
export function CookieBanner() {
  const { t } = useI18n();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = getConsent();
    if (stored) {
      applyConsent(stored);
      return;
    }
    // Aucun choix enregistré : par défaut on refuse tant que le visiteur n'a pas tranché.
    applyConsent("denied");
    setVisible(true);
  }, []);

  const choose = (value: "granted" | "denied") => {
    setConsent(value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4">
      <div className="glass container-lbg flex flex-col gap-4 rounded-card border border-border p-5 shadow-2xl md:flex-row md:items-center md:justify-between">
        <div className="flex gap-3">
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Cookie className="size-5" />
          </span>
          <p className="text-sm leading-relaxed text-muted">
            {t({
              fr: "Nous utilisons des cookies de mesure d'audience pour comprendre ce qui intéresse nos visiteurs. Les cookies nécessaires au fonctionnement du site (langue, connexion, panier de devis) restent actifs dans tous les cas. Vous pouvez refuser : le site fonctionne exactement pareil.",
              en: "We use audience-measurement cookies to understand what interests our visitors. Cookies required for the site to work (language, login, quote basket) stay active either way. You can decline: the site works exactly the same.",
            })}{" "}
            <Link to="/confidentialite" className="font-semibold text-primary underline-offset-2 hover:underline">
              {t({ fr: "Politique de confidentialité", en: "Privacy policy" })}
            </Link>
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => choose("denied")}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:border-primary/50 md:flex-none"
          >
            {t({ fr: "Refuser", en: "Decline" })}
          </button>
          <button
            type="button"
            onClick={() => choose("granted")}
            className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong md:flex-none"
          >
            {t({ fr: "Accepter", en: "Accept" })}
          </button>
        </div>
      </div>
    </div>
  );
}
