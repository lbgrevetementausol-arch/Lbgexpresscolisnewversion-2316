import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Jeton de désinscription newsletter : HMAC-SHA256 de l'e-mail.
 * Sans jeton, n'importe qui pourrait désinscrire l'adresse d'un tiers.
 * Volontairement sans expiration : un lien de désinscription reçu par mail
 * doit rester valable indéfiniment (exigence pratique de l'art. L34-5 CPCE).
 */
function secret(): string {
  return process.env.BETTER_AUTH_SECRET ?? "lbg-newsletter-dev-secret";
}

export function signUnsubscribe(email: string): string {
  return createHmac("sha256", secret()).update(email.trim().toLowerCase()).digest("hex");
}

export function verifyUnsubscribe(email: string, token: string): boolean {
  const expected = signUnsubscribe(email);
  const a = Buffer.from(token, "utf8");
  const b = Buffer.from(expected, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** URL cliquable à insérer en pied de chaque e-mail marketing. */
export function unsubscribeUrl(email: string, siteUrl = "https://www.lbgexpresscolis.fr"): string {
  const clean = email.trim().toLowerCase();
  return `${siteUrl}/api/newsletter/unsubscribe?email=${encodeURIComponent(clean)}&token=${signUnsubscribe(clean)}`;
}
