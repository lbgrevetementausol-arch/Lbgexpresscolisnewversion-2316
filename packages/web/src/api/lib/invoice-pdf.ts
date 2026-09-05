import type { PDFFont } from "pdf-lib";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ISSUER } from "./invoicing";

/**
 * Génération du PDF de facture, sans dépendance système (pas de Chrome sur le VPS).
 * pdf-lib est du JavaScript pur : le rendu est identique en local et en production.
 */

const A4 = { width: 595.28, height: 841.89 };
const INK = rgb(0.043, 0.071, 0.125);
const ACCENT = rgb(0.023, 0.714, 0.831);
const MUTED = rgb(0.45, 0.5, 0.58);
const LINE = rgb(0.85, 0.88, 0.92);
const WHITE = rgb(1, 1, 1);

/**
 * Les polices standard PDF utilisent l'encodage WinAnsi : tout caractère hors
 * Latin-1 ferait échouer le rendu. On normalise la typographie française.
 */
function safe(value: unknown): string {
  return String(value ?? "")
    .replace(/[‘’‛]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/ /g, " ")
    .replace(/[^\x20-\xFF€]/g, "");
}

function euro(cents: number): string {
  const value = (cents / 100).toFixed(2).replace(".", ",");
  return `${value.replace(/\B(?=(\d{3})+(?!\d))/g, " ")} EUR`;
}

function frDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export interface InvoicePdfInvoice {
  number: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string | null;
  customerAddress?: string | null;
  subject?: string | null;
  subtotalCents: number;
  vatRate: number;
  vatCents: number;
  totalCents: number;
  status: string;
  paymentMethod?: string | null;
  paymentReference?: string | null;
  paidAt?: Date | null;
  createdAt?: Date | null;
}

export interface InvoicePdfItem {
  label: string;
  detail?: string | null;
  quantity: number;
  unit: string;
  unitPriceCents: number;
  totalCents: number;
}

/** Tronque un texte pour qu'il tienne dans une largeur donnée, avec points de suite. */
function fit(text: string, font: PDFFont, size: number, maxWidth: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && font.widthOfTextAtSize(`${out}...`, size) > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out.trimEnd()}...`;
}

/** Logo optionnel : une facture doit partir même si le fichier est introuvable. */
async function embedLogo(doc: PDFDocument) {
  try {
    const path = `${import.meta.dir}/../../../public/images/logo.png`;
    const bytes = await Bun.file(path).arrayBuffer();
    return await doc.embedPng(bytes);
  } catch {
    return null;
  }
}

export async function buildInvoicePdf(
  invoice: InvoicePdfInvoice,
  items: InvoicePdfItem[],
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([A4.width, A4.height]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await embedLogo(doc);

  doc.setTitle(`Facture ${invoice.number} - ${ISSUER.company}`);
  doc.setProducer(ISSUER.company);
  doc.setCreator(ISSUER.company);

  const M = 48;
  const right = A4.width - M;

  /* ----------------------------- En-tête ----------------------------- */
  page.drawRectangle({ x: 0, y: A4.height - 118, width: A4.width, height: 118, color: INK });

  if (logo) {
    const scaled = logo.scaleToFit(120, 46);
    page.drawImage(logo, {
      x: M,
      y: A4.height - 60 - scaled.height / 2,
      width: scaled.width,
      height: scaled.height,
    });
  } else {
    page.drawText("LBG EXPRESS COLIS", { x: M, y: A4.height - 68, size: 17, font: bold, color: WHITE });
  }

  page.drawText("FACTURE", { x: right - 150, y: A4.height - 52, size: 22, font: bold, color: WHITE });
  page.drawText(safe(invoice.number), {
    x: right - 150,
    y: A4.height - 72,
    size: 12,
    font,
    color: ACCENT,
  });
  page.drawText(`Date : ${frDate(invoice.createdAt ?? new Date())}`, {
    x: right - 150,
    y: A4.height - 90,
    size: 9,
    font,
    color: rgb(0.72, 0.78, 0.86),
  });

  let y = A4.height - 156;

  /* ------------------------- Bandeau "payée" ------------------------- */
  if (invoice.status === "payee") {
    page.drawRectangle({
      x: M,
      y: y - 30,
      width: A4.width - M * 2,
      height: 38,
      color: rgb(0.9, 0.98, 0.99),
      borderColor: ACCENT,
      borderWidth: 1,
    });
    page.drawText("PAYÉE", { x: M + 14, y: y - 12, size: 13, font: bold, color: ACCENT });
    const ref = invoice.paymentReference ? ` - ref. ${safe(invoice.paymentReference)}` : "";
    const method = invoice.paymentMethod === "carte_mypos" ? "carte bancaire" : safe(invoice.paymentMethod ?? "");
    page.drawText(safe(`Réglée le ${frDate(invoice.paidAt)} par ${method}${ref}`), {
      x: M + 80,
      y: y - 12,
      size: 9,
      font,
      color: rgb(0.2, 0.35, 0.42),
    });
    y -= 60;
  }

  /* ----------------------- Émetteur / Client ------------------------- */
  const colRight = M + (A4.width - M * 2) / 2 + 10;

  page.drawText("ÉMETTEUR", { x: M, y, size: 8, font: bold, color: MUTED });
  page.drawText("FACTURÉ À", { x: colRight, y, size: 8, font: bold, color: MUTED });
  y -= 16;

  const issuerLines = [
    ISSUER.company,
    ISSUER.address,
    ISSUER.postalCity,
    `SIRET ${ISSUER.siret}`,
    `TVA ${ISSUER.vat}`,
    ISSUER.phone,
    ISSUER.email,
  ];
  const clientLines = [
    invoice.customerCompany || invoice.customerName,
    invoice.customerCompany ? invoice.customerName : "",
    invoice.customerAddress || "",
    invoice.customerEmail,
  ].filter(Boolean);

  const blockTop = y;
  issuerLines.forEach((line, i) => {
    page.drawText(safe(line), { x: M, y: blockTop - i * 13, size: 9, font, color: INK });
  });
  clientLines.forEach((line, i) => {
    page.drawText(safe(line), { x: colRight, y: blockTop - i * 13, size: 9, font, color: INK });
  });

  y = blockTop - Math.max(issuerLines.length, clientLines.length) * 13 - 24;

  if (invoice.subject) {
    page.drawText(safe(`Objet : ${invoice.subject}`), { x: M, y, size: 10, font: bold, color: INK });
    y -= 26;
  }

  /* --------------------------- Prestations --------------------------- */
  const cols = { label: M, qty: right - 250, unit: right - 175, total: right - 70 };

  page.drawRectangle({ x: M, y: y - 6, width: A4.width - M * 2, height: 22, color: rgb(0.96, 0.97, 0.99) });
  page.drawText("PRESTATION", { x: cols.label + 6, y, size: 8, font: bold, color: MUTED });
  page.drawText("QTÉ", { x: cols.qty, y, size: 8, font: bold, color: MUTED });
  page.drawText("PRIX UNIT. HT", { x: cols.unit, y, size: 8, font: bold, color: MUTED });
  page.drawText("TOTAL HT", { x: cols.total, y, size: 8, font: bold, color: MUTED });
  y -= 28;

  const lines = items.length
    ? items
    : [
        {
          label: invoice.subject || "Prestation de transport",
          detail: null,
          quantity: 1,
          unit: "forfait",
          unitPriceCents: invoice.subtotalCents,
          totalCents: invoice.subtotalCents,
        },
      ];

  for (const item of lines) {
    if (y < 190) break;
    page.drawText(fit(safe(item.label), bold, 10, cols.qty - cols.label - 18), { x: cols.label + 6, y, size: 10, font: bold, color: INK });
    const qty = Number.isInteger(item.quantity) ? String(item.quantity) : String(item.quantity).replace(".", ",");
    page.drawText(safe(`${qty} ${item.unit}`), { x: cols.qty, y, size: 9, font, color: INK });
    page.drawText(euro(item.unitPriceCents), { x: cols.unit, y, size: 9, font, color: INK });
    page.drawText(euro(item.totalCents), { x: cols.total, y, size: 9, font: bold, color: INK });
    y -= 14;
    if (item.detail) {
      page.drawText(safe(item.detail).slice(0, 78), { x: cols.label + 6, y, size: 8, font, color: MUTED });
      y -= 12;
    }
    y -= 6;
    page.drawLine({ start: { x: M, y: y + 4 }, end: { x: right, y: y + 4 }, thickness: 0.5, color: LINE });
    y -= 8;
  }

  /* ----------------------------- Totaux ------------------------------ */
  y -= 8;
  const totalsX = right - 250;
  const put = (label: string, value: string, strong = false) => {
    page.drawText(safe(label), { x: totalsX, y, size: strong ? 11 : 9, font: strong ? bold : font, color: strong ? INK : MUTED });
    page.drawText(value, { x: cols.total, y, size: strong ? 11 : 9, font: bold, color: strong ? ACCENT : INK });
    y -= strong ? 20 : 15;
  };

  put("Total HT", euro(invoice.subtotalCents));
  put(`TVA ${String(invoice.vatRate).replace(".", ",")} %`, euro(invoice.vatCents));
  page.drawLine({ start: { x: totalsX, y: y + 6 }, end: { x: right, y: y + 6 }, thickness: 0.5, color: LINE });
  y -= 6;
  put("TOTAL TTC", euro(invoice.totalCents), true);

  if (invoice.status === "payee") {
    page.drawText("Montant réglé - aucun paiement supplémentaire n'est dû.", {
      x: totalsX,
      y,
      size: 8,
      font,
      color: MUTED,
    });
  }

  /* ---------------------------- Pied de page -------------------------- */
  page.drawLine({ start: { x: M, y: 96 }, end: { x: right, y: 96 }, thickness: 0.5, color: LINE });
  const footer = [
    safe(ISSUER.legal),
    safe(`${ISSUER.address}, ${ISSUER.postalCity} - SIRET ${ISSUER.siret} - TVA ${ISSUER.vat} - APE ${ISSUER.ape}`),
    safe(`${ISSUER.phone} - ${ISSUER.email} - ${ISSUER.site}`),
    "En cas de retard de paiement : pénalités au taux légal et indemnité forfaitaire de recouvrement de 40 EUR (art. L441-10 du code de commerce).",
  ];
  footer.forEach((line, i) => {
    page.drawText(line.slice(0, 150), { x: M, y: 80 - i * 11, size: 7, font, color: MUTED });
  });

  return doc.save();
}
