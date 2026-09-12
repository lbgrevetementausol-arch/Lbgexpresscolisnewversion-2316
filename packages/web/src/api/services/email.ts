/**
 * Envoi d'e-mails transactionnels réels (Resend).
 * Si RESEND_API_KEY n'est pas encore renseignée, l'envoi est simplement ignoré
 * et journalisé : aucune route ne casse, le site reste fonctionnel.
 */
import { Resend } from "resend";
import { ISSUER } from "../lib/invoicing";

const FROM = process.env.MAIL_FROM ?? `LBG Express Colis <contact@lbgexpresscolis.fr>`;
const OPS = process.env.MAIL_OPS ?? ISSUER.email;
const SITE = process.env.WEBSITE_URL ?? "https://lbgexpresscolis.fr";

let client: Resend | null = null;
function resend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

export function emailEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: { filename: string; content: string }[];
}

/** Envoi unitaire, sans jamais faire échouer la requête appelante. */
export async function sendEmail(options: SendEmailOptions): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const api = resend();
  if (!api) {
    console.warn(`[email] RESEND_API_KEY absente — e-mail non envoyé : ${options.subject}`);
    return { ok: false, skipped: true };
  }
  try {
    const { error } = await api.emails.send({
      from: FROM,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text ?? stripHtml(options.html),
      replyTo: options.replyTo,
      attachments: options.attachments,
    });
    if (error) {
      console.error(`[email] échec: ${error.message}`);
      return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur inconnue";
    console.error(`[email] exception: ${message}`);
    return { ok: false, error: message };
  }
}

const stripHtml = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const esc = (v: unknown) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const euro = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

/** Gabarit HTML commun (identité LBG : fond sombre, accent cyan). */
export function layout(title: string, bodyHtml: string, cta?: { label: string; href: string }) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;color:#e6edf7">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 12px">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#111a2b;border:1px solid #1e2b45;border-radius:16px;overflow:hidden">
      <tr><td style="padding:24px 28px;border-bottom:1px solid #1e2b45">
        <span style="font-size:18px;font-weight:bold;letter-spacing:.5px">LBG<span style="color:#06b6d4">EXPRESS</span> COLIS</span>
      </td></tr>
      <tr><td style="padding:28px">
        <h1 style="margin:0 0 16px;font-size:20px;color:#ffffff">${esc(title)}</h1>
        <div style="font-size:14px;line-height:1.7;color:#c3cfe2">${bodyHtml}</div>
        ${
          cta
            ? `<p style="margin:26px 0 0"><a href="${cta.href}" style="display:inline-block;background:#06b6d4;color:#04151b;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:10px">${esc(cta.label)}</a></p>`
            : ""
        }
      </td></tr>
      <tr><td style="padding:20px 28px;border-top:1px solid #1e2b45;font-size:12px;color:#8296b5">
        ${esc(ISSUER.legal)}<br />
        ${esc(ISSUER.phone)} · <a href="mailto:${ISSUER.email}" style="color:#06b6d4">${ISSUER.email}</a> · <a href="${SITE}" style="color:#06b6d4">${esc(ISSUER.site)}</a>
      </td></tr>
    </table>
  </td></tr></table></body></html>`;
}

const row = (k: string, v: unknown) =>
  v === null || v === undefined || v === "" ? "" : `<tr><td style="padding:4px 12px 4px 0;color:#8296b5">${esc(k)}</td><td style="padding:4px 0"><strong>${esc(v)}</strong></td></tr>`;

const table = (rows: string) => `<table role="presentation" style="font-size:14px;margin:8px 0 0">${rows}</table>`;

/* ------------------------------------------------------------------ */
/*                          E-mails métier                             */
/* ------------------------------------------------------------------ */

/** 1. Accusé de réception d'une demande de devis, au client. */
export async function mailQuoteReceipt(args: {
  to: string;
  name: string;
  ref: string;
  trackingNumber: string;
  priceCents: number;
  from: string;
  to_: string;
  etaMin: number;
  etaMax: number;
}) {
  const html = layout(
    `Votre devis ${args.ref} est enregistré`,
    `<p>Bonjour ${esc(args.name)},</p>
     <p>Merci pour votre demande. Voici le récapitulatif de votre estimation :</p>
     ${table(
       row("Référence", args.ref) +
         row("Enlèvement", args.from) +
         row("Livraison", args.to_) +
         row("Délai estimé", `${args.etaMin} à ${args.etaMax} jours ouvrés`) +
         row("Montant HT", euro(args.priceCents)) +
         row("Montant TTC (TVA 20 %)", euro(Math.round(args.priceCents * 1.2))) +
         row("N° de suivi", args.trackingNumber),
     )}
     <p>Notre équipe valide la faisabilité et vous rappelle sous 2 heures ouvrées. Vous pouvez aussi nous joindre directement au ${esc(ISSUER.phone)} ou sur WhatsApp.</p>`,
    { label: "Suivre ma demande", href: `${SITE}/suivi?n=${encodeURIComponent(args.trackingNumber)}` },
  );
  return sendEmail({ to: args.to, subject: `Devis ${args.ref} — LBG Express Colis`, html });
}

/** 2. Notification interne : nouveau devis. */
export async function mailQuoteOps(args: {
  ref: string;
  kind: string;
  zone: string;
  service: string;
  name: string;
  email: string;
  phone?: string | null;
  from: string;
  to_: string;
  priceCents: number;
  trackingNumber: string;
  message?: string | null;
}) {
  const html = layout(
    `Nouveau devis ${args.ref}`,
    table(
      row("Client", args.name) +
        row("E-mail", args.email) +
        row("Téléphone", args.phone) +
        row("Type", `${args.kind} · ${args.zone} · ${args.service}`) +
        row("Enlèvement", args.from) +
        row("Livraison", args.to_) +
        row("Montant HT", euro(args.priceCents)) +
        row("Suivi", args.trackingNumber),
    ) + (args.message ? `<p style="margin-top:14px"><em>${esc(args.message)}</em></p>` : ""),
    { label: "Ouvrir le back-office", href: `${SITE}/admin` },
  );
  return sendEmail({ to: OPS, subject: `[Devis] ${args.ref} — ${args.name} — ${euro(args.priceCents)} HT`, html, replyTo: args.email });
}

/** 3. Notification interne : message de contact. */
export async function mailContactOps(args: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
}) {
  const html = layout(
    `Nouveau message — ${args.subject}`,
    table(row("Nom", args.name) + row("E-mail", args.email) + row("Téléphone", args.phone)) +
      `<p style="margin-top:14px;white-space:pre-line">${esc(args.message)}</p>`,
    { label: "Répondre depuis l'admin", href: `${SITE}/admin` },
  );
  return sendEmail({ to: OPS, subject: `[Contact] ${args.subject} — ${args.name}`, html, replyTo: args.email });
}

/** 4. Notification interne : candidature transporteur. */
export async function mailCarrierOps(args: {
  name: string;
  email: string;
  phone: string;
  city: string;
  vehicle: string;
  capacityM3?: number | null;
  siret?: string | null;
  message?: string | null;
}) {
  const html = layout(
    "Nouvelle candidature transporteur",
    table(
      row("Nom", args.name) +
        row("E-mail", args.email) +
        row("Téléphone", args.phone) +
        row("Ville", args.city) +
        row("Véhicule", args.vehicle) +
        row("Capacité", args.capacityM3 ? `${args.capacityM3} m³` : null) +
        row("SIRET", args.siret),
    ) + (args.message ? `<p style="margin-top:14px">${esc(args.message)}</p>` : ""),
    { label: "Voir les candidatures", href: `${SITE}/admin` },
  );
  return sendEmail({ to: OPS, subject: `[Transporteur] ${args.name} — ${args.city}`, html, replyTo: args.email });
}

/** 5. Facture envoyée au client. */
export async function mailInvoice(args: {
  to: string;
  name: string;
  number: string;
  subject: string;
  totalCents: number;
  dueAt?: Date | null;
  paymentUrl: string;
}) {
  const html = layout(
    `Facture ${args.number}`,
    `<p>Bonjour ${esc(args.name)},</p>
     <p>Voici votre facture pour la prestation « ${esc(args.subject)} ».</p>
     ${table(
       row("Numéro", args.number) +
         row("Montant TTC", euro(args.totalCents)) +
         row("Échéance", args.dueAt ? args.dueAt.toLocaleDateString("fr-FR") : null),
     )}
     <p>Vous pouvez régler par carte bancaire via notre terminal sécurisé MyPOS. Pensez à indiquer le montant <strong>${euro(args.totalCents)}</strong> et la référence <strong>${esc(args.number)}</strong> dans le champ commentaire.</p>
     <p>Pour un virement bancaire, répondez à cet e-mail ou écrivez-nous sur WhatsApp : nous vous transmettons nos coordonnées bancaires.</p>`,
    { label: "Payer par carte bancaire", href: args.paymentUrl },
  );
  return sendEmail({
    to: args.to,
    subject: `Facture ${args.number} — ${euro(args.totalCents)} — LBG Express Colis`,
    html,
    replyTo: OPS,
  });
}

/** 5 bis. Confirmation de paiement + facture PDF en pièce jointe. */
export async function mailInvoicePaid(args: {
  to: string;
  name: string;
  number: string;
  subject: string;
  totalCents: number;
  paidAt: Date;
  paymentReference: string;
  pdfBase64: string;
  unsubscribeUrl: string;
}) {
  const html = layout(
    `Paiement reçu — facture ${args.number}`,
    `<p>Bonjour ${esc(args.name)},</p>
     <p>Nous avons bien reçu votre paiement. Votre facture acquittée est jointe à cet e-mail au format PDF.</p>
     ${table(
       row("Facture", args.number) +
         row("Prestation", args.subject) +
         row("Montant réglé", euro(args.totalCents)) +
         row("Payé le", args.paidAt.toLocaleDateString("fr-FR")) +
         row("Moyen de paiement", "Carte bancaire (myPOS)") +
         row("Référence", args.paymentReference),
     )}
     <p>Merci de votre confiance. Pour toute question, répondez simplement à cet e-mail ou écrivez-nous sur WhatsApp au ${esc(ISSUER.phone)}.</p>
     <p style="margin-top:22px;font-size:12px;color:#8296b5">En tant que client, vous recevrez occasionnellement nos actualités et offres de transport. Vous pouvez vous <a href="${args.unsubscribeUrl}" style="color:#06b6d4">désinscrire en un clic</a> à tout moment.</p>`,
  );
  return sendEmail({
    to: args.to,
    subject: `Paiement confirmé — facture ${args.number} — LBG Express Colis`,
    html,
    replyTo: OPS,
    attachments: [{ filename: `Facture-${args.number}.pdf`, content: args.pdfBase64 }],
  });
}

/** 6. Changement de statut d'un colis, au client. */
/** Demande d'avis Trustpilot, envoyée quelques jours après une livraison. */
export async function mailReviewRequest(args: {
  to: string;
  name?: string | null;
  trackingNumber: string;
  reviewUrl: string;
}) {
  const first = String(args.name ?? "").trim().split(/\s+/)[0] ?? "";
  const html = layout(
    "Votre colis est arrivé — un avis en 30 secondes ?",
    `<p>Bonjour ${esc(first)},</p>
     <p>Votre envoi <strong>${esc(args.trackingNumber)}</strong> a bien été livré. Nous espérons que tout s'est passé comme prévu.</p>
     <p>Nous sommes une petite équipe : un avis public, même court, nous aide énormément à être trouvés par d'autres clients. Cela vous prend moins d'une minute.</p>
     <p style="color:#8296b5;font-size:13px">Si quelque chose n'a pas été à la hauteur, répondez simplement à cet e-mail : nous préférons régler le problème avant tout.</p>`,
    { label: "Laisser un avis sur Trustpilot", href: args.reviewUrl },
  );
  return sendEmail({
    to: args.to,
    subject: `${args.trackingNumber} — votre avis sur LBG Express Colis`,
    html,
    replyTo: OPS,
  });
}

export async function mailTrackingUpdate(args: {
  to: string;
  name?: string | null;
  trackingNumber: string;
  status: string;
  label: string;
  location?: string | null;
}) {
  const STATUS: Record<string, string> = {
    cree: "Expédition créée",
    pris_en_charge: "Colis pris en charge",
    en_transit: "En transit",
    en_livraison: "En cours de livraison",
    livre: "Livré",
    incident: "Incident sur l'acheminement",
    retourne: "Colis retourné",
  };
  const html = layout(
    `${STATUS[args.status] ?? "Mise à jour"} — ${args.trackingNumber}`,
    `<p>Bonjour ${esc(args.name ?? "")},</p>
     <p>Votre colis <strong>${esc(args.trackingNumber)}</strong> a changé de statut :</p>
     ${table(row("Statut", STATUS[args.status] ?? args.status) + row("Détail", args.label) + row("Lieu", args.location))}`,
    { label: "Voir le suivi complet", href: `${SITE}/suivi?n=${encodeURIComponent(args.trackingNumber)}` },
  );
  return sendEmail({ to: args.to, subject: `${args.trackingNumber} — ${STATUS[args.status] ?? args.status}`, html });
}

/* ------------------------------------------------------------------ */
/*                        E-mails espace livreur                       */
/* ------------------------------------------------------------------ */

/** 9. Code à 6 chiffres pour vérifier l'adresse e-mail d'un livreur. */
export async function mailDriverVerify(args: { to: string; name: string; code: string }) {
  const html = layout(
    "Vérifiez votre adresse e-mail",
    `<p>Bonjour ${esc(args.name)},</p>
     <p>Votre inscription comme livreur partenaire LBG Express Colis est enregistrée. Saisissez ce code sur la page de vérification pour confirmer votre adresse :</p>
     <p style="margin:22px 0;font-size:32px;font-weight:bold;letter-spacing:8px;color:#ffffff">${esc(args.code)}</p>
     <p>Ce code expire dans 30 minutes. Une fois votre adresse confirmée, notre équipe contrôle vos documents (permis, pièce d'identité, véhicule) et active votre compte.</p>`,
    { label: "Vérifier mon adresse", href: `${SITE}/livreur?verif=1` },
  );
  return sendEmail({ to: args.to, subject: `Votre code de vérification : ${args.code}`, html });
}

/** 10. Compte livreur validé (ou refusé) par l'administration. */
export async function mailDriverApproval(args: {
  to: string;
  name: string;
  approved: boolean;
  note?: string | null;
}) {
  const html = args.approved
    ? layout(
        "Votre compte livreur est activé",
        `<p>Bonjour ${esc(args.name)},</p>
         <p>Vos documents ont été validés. Vous pouvez dès maintenant vous connecter à votre espace livreur, vous déclarer <strong>disponible</strong> et recevoir les courses proposées par e-mail.</p>
         <p>Première course : dès qu'une commande est payée, vous recevez un e-mail. Le premier livreur qui accepte l'obtient.</p>`,
        { label: "Accéder à mon espace", href: `${SITE}/livreur` },
      )
    : layout(
        "Votre candidature livreur",
        `<p>Bonjour ${esc(args.name)},</p>
         <p>Après examen de votre dossier, nous ne pouvons pas activer votre compte livreur pour le moment.</p>
         ${args.note ? `<p><strong>Motif :</strong> ${esc(args.note)}</p>` : ""}
         <p>Vous pouvez nous répondre à cet e-mail si vous souhaitez compléter votre dossier.</p>`,
      );
  return sendEmail({
    to: args.to,
    subject: args.approved ? "Compte livreur activé — LBG Express Colis" : "Votre candidature livreur — LBG Express Colis",
    html,
  });
}

/** 11. Lien de réinitialisation du mot de passe livreur. */
export async function mailDriverReset(args: { to: string; name: string; url: string }) {
  const html = layout(
    "Réinitialiser votre mot de passe",
    `<p>Bonjour ${esc(args.name)},</p>
     <p>Vous avez demandé un nouveau mot de passe pour votre espace livreur. Ce lien est valable 1 heure :</p>
     <p style="font-size:12px;color:#8296b5;word-break:break-all">${esc(args.url)}</p>
     <p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé.</p>`,
    { label: "Choisir un nouveau mot de passe", href: args.url },
  );
  return sendEmail({ to: args.to, subject: "Réinitialisation de votre mot de passe livreur", html });
}

/** 12. Nouvelle course disponible, envoyée à tous les livreurs disponibles. */
export async function mailJobOffer(args: {
  to: string;
  name: string;
  trackingNumber: string;
  pickup: string;
  drop: string;
  service?: string | null;
  weightKg?: number | null;
  volumeM3?: number | null;
  payoutCents?: number | null;
  scheduledAt?: Date | null;
}) {
  const html = layout(
    "Nouvelle course disponible",
    `<p>Bonjour ${esc(args.name)},</p>
     <p>Une commande vient d'être payée et cherche un livreur. <strong>Premier arrivé, premier servi</strong> : la course est attribuée au premier qui l'accepte.</p>
     ${table(
       row("Référence", args.trackingNumber) +
         row("Enlèvement", args.pickup) +
         row("Livraison", args.drop) +
         row("Prestation", args.service) +
         row("Poids", args.weightKg ? `${args.weightKg} kg` : null) +
         row("Volume", args.volumeM3 ? `${args.volumeM3} m³` : null) +
         row("Rémunération", args.payoutCents ? euro(args.payoutCents) : null) +
         row("Créneau", args.scheduledAt ? args.scheduledAt.toLocaleString("fr-FR") : null),
     )}`,
    { label: "Voir et accepter la course", href: `${SITE}/livreur?course=${encodeURIComponent(args.trackingNumber)}` },
  );
  return sendEmail({ to: args.to, subject: `Course disponible ${args.trackingNumber} — ${args.drop}`, html });
}

/** 13. Confirmation au livreur qui a décroché la course. */
export async function mailJobAssigned(args: {
  to: string;
  name: string;
  trackingNumber: string;
  pickup: string;
  drop: string;
  recipientName?: string | null;
  recipientPhone?: string | null;
  scheduledAt?: Date | null;
}) {
  const html = layout(
    `Course ${args.trackingNumber} attribuée`,
    `<p>Bonjour ${esc(args.name)},</p>
     <p>La course est à vous. Les coordonnées du destinataire :</p>
     ${table(
       row("Enlèvement", args.pickup) +
         row("Livraison", args.drop) +
         row("Destinataire", args.recipientName) +
         row("Téléphone", args.recipientPhone) +
         row("Créneau", args.scheduledAt ? args.scheduledAt.toLocaleString("fr-FR") : null),
     )}
     <p>Pensez à mettre à jour le statut depuis votre espace à chaque étape : le client suit sa livraison en direct.</p>`,
    { label: "Ouvrir ma tournée", href: `${SITE}/livreur` },
  );
  return sendEmail({ to: args.to, subject: `Course ${args.trackingNumber} confirmée`, html });
}
