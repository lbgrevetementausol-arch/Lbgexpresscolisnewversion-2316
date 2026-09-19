/**
 * Envoi d'événements de conversion vers Meta Pixel et Google Tag Manager.
 * Les scripts de base sont chargés dans index.html ; ces helpers ne font rien
 * si les tags sont bloqués (adblock, consentement refusé).
 */

type Params = Record<string, string | number | boolean | undefined>;

interface TagWindow extends Window {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
  gtag?: (...args: unknown[]) => void;
}

/** Action de conversion Google Ads « Envoi de formulaire de lead ». */
const ADS_LEAD_CONVERSION = "AW-18432366308/WhRBCL-J8_gcEOStntVE";

/**
 * Conversion Google Ads. En SPA React on appelle gtag directement plutôt que
 * l'attribut onclick="gtag_report_conversion(...)" de la doc Google, qui ne
 * s'applique qu'à des pages HTML statiques. La navigation n'est pas bloquée :
 * l'événement part en fire-and-forget.
 */
function trackAdsConversion(sendTo: string, params: Params = {}) {
  const w = win();
  if (!w) return;
  try {
    w.gtag?.("event", "conversion", {
      send_to: sendTo,
      currency: "EUR",
      ...params,
    });
  } catch {
    /* tag bloqué */
  }
}

function win(): TagWindow | null {
  return typeof window === "undefined" ? null : (window as TagWindow);
}

/** Événement standard Meta + push dataLayer (GTM). */
export function trackEvent(name: string, params: Params = {}) {
  const w = win();
  if (!w) return;
  try {
    w.fbq?.("track", name, params);
  } catch {
    /* tag bloqué */
  }
  try {
    (w.dataLayer ??= []).push({ event: name, ...params });
  } catch {
    /* tag bloqué */
  }
}

/** Demande de devis envoyée. */
export function trackLead(params: Params = {}) {
  trackEvent("Lead", { currency: "EUR", ...params });
  // Valeur réelle du devis quand elle est connue, sinon 1.0 comme valeur par défaut.
  trackAdsConversion(ADS_LEAD_CONVERSION, {
    value: typeof params.value === "number" ? params.value : 1.0,
  });
}

/** Clic sur le paiement carte bancaire. */
export function trackCheckout(params: Params = {}) {
  trackEvent("InitiateCheckout", { currency: "EUR", ...params });
}

/** Création de compte client. */
export function trackSignup(params: Params = {}) {
  trackEvent("CompleteRegistration", params);
}

/** Paiement encaisse (retour myPOS). Envoye une seule fois par facture. */
export function trackPurchase(params: Params = {}) {
  trackEvent("Purchase", { currency: "EUR", ...params });
}

/** Message de contact ou candidature transporteur. */
export function trackContact(params: Params = {}) {
  trackEvent("Contact", params);
  trackAdsConversion(ADS_LEAD_CONVERSION, { value: 1.0 });
}
