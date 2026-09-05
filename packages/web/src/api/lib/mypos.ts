import { createSign, createVerify } from "node:crypto";

/**
 * Intégration myPOS Checkout (IPC v1.4).
 *
 * Toutes les clés viennent du .env racine — jamais du code, jamais du client :
 *   MYPOS_STORE_ID, MYPOS_CLIENT_NUMBER, MYPOS_KEY_INDEX,
 *   MYPOS_PRIVATE_KEY_B64 (PEM encodé base64), MYPOS_CERT_B64 (certificat myPOS en base64),
 *   MYPOS_SANDBOX ("true" tant que le compte n'est pas passé en production).
 *
 * Signature : base64(valeurs jointes par "-") signé en RSA-SHA256, résultat en base64.
 * L'ordre des champs est celui du tableau envoyé — il doit rester identique côté myPOS.
 */

const SANDBOX_URL = "https://mypos.com/vmp/checkout-test";
const LIVE_URL = "https://mypos.com/vmp/checkout";

export type MyposFields = Record<string, string>;

export interface MyposConfig {
  storeId: string;
  clientNumber: string;
  keyIndex: string;
  privateKey: string;
  certificate: string;
  sandbox: boolean;
  actionUrl: string;
}

function decode(value: string | undefined) {
  if (!value) return "";
  const raw = value.trim();
  if (raw.includes("-----BEGIN")) return raw;
  try {
    return Buffer.from(raw, "base64").toString("utf8");
  } catch {
    return "";
  }
}

/** Configuration myPOS lue dans l'env — null si le Checkout n'est pas configuré. */
export function myposConfig(): MyposConfig | null {
  const storeId = process.env.MYPOS_STORE_ID?.trim();
  const clientNumber = process.env.MYPOS_CLIENT_NUMBER?.trim();
  const keyIndex = process.env.MYPOS_KEY_INDEX?.trim() || "1";
  const privateKey = decode(process.env.MYPOS_PRIVATE_KEY_B64);
  const certificate = decode(process.env.MYPOS_CERT_B64);
  if (!storeId || !clientNumber || !privateKey) return null;
  const sandbox = (process.env.MYPOS_SANDBOX ?? "true").toLowerCase() !== "false";
  return {
    storeId,
    clientNumber,
    keyIndex,
    privateKey,
    certificate,
    sandbox,
    actionUrl: sandbox ? SANDBOX_URL : LIVE_URL,
  };
}

export function myposEnabled() {
  return myposConfig() !== null;
}

/** Signature RSA-SHA256 des valeurs, dans l'ordre exact du formulaire. */
export function signFields(fields: MyposFields, privateKey: string) {
  const payload = Buffer.from(Object.values(fields).join("-"), "utf8").toString("base64");
  return createSign("RSA-SHA256").update(payload).sign(privateKey, "base64");
}

/** Vérifie la signature d'un callback myPOS (URL_Notify) avec le certificat marchand. */
export function verifyNotification(fields: MyposFields, signature: string, certificate: string) {
  if (!signature || !certificate) return false;
  const payload = Buffer.from(Object.values(fields).join("-"), "utf8").toString("base64");
  try {
    return createVerify("RSA-SHA256").update(payload).verify(certificate, signature, "base64");
  } catch {
    return false;
  }
}

function amount(cents: number) {
  return (cents / 100).toFixed(2);
}

/** Nettoie une valeur envoyée à myPOS (pas de retour ligne, pas de "-" parasite dans la signature). */
function clean(value: string | null | undefined, max: number) {
  return (value ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .trim()
    .slice(0, max);
}

function splitName(fullName: string) {
  const parts = clean(fullName, 120).split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "Client", last: "LBG" };
  if (parts.length === 1) return { first: parts[0], last: parts[0] };
  return { first: parts.slice(0, -1).join(" "), last: parts[parts.length - 1] };
}

export interface PurchaseInput {
  orderId: string;
  amountCents: number;
  currency?: string;
  language?: "fr" | "en";
  customer: { name: string; email: string; phone?: string | null };
  label: string;
  urls: { ok: string; cancel: string; notify: string };
}

/**
 * Construit le formulaire POST auto-soumis vers la page de paiement myPOS.
 * Retourne l'URL d'action et les champs signés (Signature en dernier).
 */
export function buildPurchase(input: PurchaseInput, cfg: MyposConfig) {
  const currency = input.currency ?? "EUR";
  const { first, last } = splitName(input.customer.name);
  const total = amount(input.amountCents);

  const fields: MyposFields = {
    IPCmethod: "IPCPurchase",
    IPCVersion: "1.4",
    IPCLanguage: (input.language ?? "fr").toUpperCase(),
    SID: cfg.storeId,
    WalletNumber: cfg.clientNumber,
    Amount: total,
    Currency: currency,
    OrderID: clean(input.orderId, 80),
    URL_OK: input.urls.ok,
    URL_Cancel: input.urls.cancel,
    URL_Notify: input.urls.notify,
    CardTokenRequest: "0",
    KeyIndex: cfg.keyIndex,
    PaymentParametersRequired: "1",
    CustomerEmail: clean(input.customer.email, 120),
    CustomerFirstNames: first,
    CustomerFamilyName: last,
    Note: clean(input.label, 120),
    Source: "LBG Express Colis",
    CartItems: "1",
    Article_1: clean(input.label, 120),
    Quantity_1: "1",
    Price_1: total,
    Currency_1: currency,
    Amount_1: total,
  };

  fields.Signature = signFields(fields, cfg.privateKey);
  return { action: cfg.actionUrl, fields, sandbox: cfg.sandbox };
}

/** Base publique du site, sans slash final ni port (exigence myPOS sur les URLs). */
export function publicBaseUrl() {
  const raw = (process.env.WEBSITE_URL ?? "").trim().replace(/\/+$/, "");
  if (!raw.startsWith("https://")) return "";
  return raw;
}
