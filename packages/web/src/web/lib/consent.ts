/**
 * Consentement cookies : un seul choix binaire, mémorisé 6 mois.
 * Refus = aucune mesure d'audience, aucune publicité / remarketing.
 */
export type ConsentValue = "granted" | "denied";

const KEY = "lbg-cookie-consent";
const SIX_MONTHS = 1000 * 60 * 60 * 24 * 182;

interface StoredConsent {
  value: ConsentValue;
  at: number;
}

function read(): StoredConsent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConsent;
    if (parsed.value !== "granted" && parsed.value !== "denied") return null;
    if (Date.now() - parsed.at > SIX_MONTHS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getConsent(): ConsentValue | null {
  return read()?.value ?? null;
}

export function setConsent(value: ConsentValue) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ value, at: Date.now() } satisfies StoredConsent));
  } catch {
    // Navigation privée saturée : le bandeau réapparaîtra, ce n'est pas bloquant.
  }
  applyConsent(value);
  window.dispatchEvent(new CustomEvent("lbg-consent", { detail: value }));
}

/**
 * Applique le choix au niveau du navigateur : signal Consent Mode pour toute
 * balise publicitaire future, et neutralisation de la mesure d'audience en cas de refus.
 */
export function applyConsent(value: ConsentValue) {
  const granted = value === "granted";
  const w = window as unknown as {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    __lbgAnalyticsDisabled?: boolean;
  };

  w.__lbgAnalyticsDisabled = !granted;
  w.dataLayer = w.dataLayer ?? [];
  w.dataLayer.push({
    event: "consent_update",
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
  });
  w.gtag?.("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
  });

  if (!granted) clearNonEssentialCookies();
}

/** Supprime les cookies non essentiels déjà déposés (mesure d'audience, publicité). */
function clearNonEssentialCookies() {
  const essential = ["lbg-lang", "better-auth"];
  const host = window.location.hostname;
  const domains = [host, `.${host}`, `.${host.split(".").slice(-2).join(".")}`];
  for (const entry of document.cookie.split(";")) {
    const name = entry.split("=")[0]?.trim();
    if (!name) continue;
    if (essential.some((keep) => name.startsWith(keep))) continue;
    if (!/^(_ga|_gid|_gcl|_fb|_hj|ajs_|1ds|lilstts)/i.test(name)) continue;
    for (const domain of domains) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`;
    }
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }
}
