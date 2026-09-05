import type { Lang } from "./i18n";

export const CONTACT = {
  phone: "+33 6 95 09 86 88",
  phoneHref: "tel:+33695098688",
  whatsapp: "33695098688",
  email: "contact@lbgexpresscolis.fr",
  facebook: "https://www.facebook.com/profile.php?id=61581465541963&locale=fr_FR",
  tiktok: "https://www.tiktok.com/@lbgexpresscolis?_r=1&_t=ZS-99QXSXcTqYm",
  instagram: "https://www.instagram.com/lbgexpresscolis/",
  company: "LBG Express Colis",
} as const;

export function whatsappLink(message: string) {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function money(amount: number, lang: Lang = "fr") {
  return new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function moneyCents(cents: number, lang: Lang = "fr") {
  return money(cents / 100, lang);
}

export function dateTime(value: Date | string | number, lang: Lang = "fr") {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function dateOnly(value: Date | string | number, lang: Lang = "fr") {
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { dateStyle: "long" }).format(new Date(value));
}

export function relative(value: Date | string | number, lang: Lang = "fr") {
  const diff = Date.now() - new Date(value).getTime();
  const rtf = new Intl.RelativeTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", { numeric: "auto" });
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  return rtf.format(-Math.round(hours / 24), "day");
}

/** Export CSV côté navigateur (dashboard pro) */
export function downloadCsv(filename: string, rows: Record<string, unknown>[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => {
    const s = v === null || v === undefined ? "" : String(v);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(";"), ...rows.map((r) => headers.map((h) => escape(r[h])).join(";"))].join("\n");
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
