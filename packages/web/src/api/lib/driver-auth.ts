import { randomBytes, timingSafeEqual } from "node:crypto";
import { scrypt as scryptCb } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/** Durée de validité du code de vérification d'e-mail : 30 minutes. */
export const VERIFY_TTL_MS = 30 * 60 * 1000;
/** Durée de validité d'un lien de réinitialisation : 1 heure. */
export const RESET_TTL_MS = 60 * 60 * 1000;

/** Hash scrypt salé — format `scrypt$<sel hex>$<clé hex>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt, 64);
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

/** Vérifie un mot de passe contre un hash, en temps constant. */
export async function verifyPassword(password: string, stored: string | null): Promise<boolean> {
  if (!stored) return false;
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt" || !saltHex || !keyHex) return false;
  const key = await scrypt(password, Buffer.from(saltHex, "hex"), 64);
  const expected = Buffer.from(keyHex, "hex");
  if (key.length !== expected.length) return false;
  return timingSafeEqual(key, expected);
}

/** Code numérique à 6 chiffres envoyé par e-mail. */
export function newVerifyCode(): string {
  return String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

/** Jeton opaque pour le lien de réinitialisation de mot de passe. */
export function newResetToken(): string {
  return randomBytes(32).toString("hex");
}

/** Code d'accès historique (compatibilité avec les comptes créés depuis /admin). */
export function newAccessCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(6);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
