/**
 * Envoi d'événements de conversion vers Meta Pixel et Google Tag Manager.
 * Les scripts de base sont chargés dans index.html ; ces helpers ne font rien
 * si les tags sont bloqués (adblock, consentement refusé).
 */

type Params = Record<string, string | number | boolean | undefined>;

interface TagWindow extends Window {
  fbq?: (...args: unknown[]) => void;
  dataLayer?: Record<string, unknown>[];
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
}

/** Clic sur le paiement carte bancaire. */
export function trackCheckout(params: Params = {}) {
  trackEvent("InitiateCheckout", { currency: "EUR", ...params });
}

/** Création de compte client. */
export function trackSignup(params: Params = {}) {
  trackEvent("CompleteRegistration", params);
}

/** Message de contact ou candidature transporteur. */
export function trackContact(params: Params = {}) {
  trackEvent("Contact", params);
}
