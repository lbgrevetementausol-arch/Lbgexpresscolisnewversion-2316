import { eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { SERVICES, ZONES } from "../lib/pricing";
import type { ZoneId } from "../lib/pricing";

/** Auto-répondeur : réponses prêtes servies au widget de chat du site. */
const ANSWERS = {
  delais: {
    fr: "Nos délais cibles : colis en Île-de-France 24-48 h, déménagement en Île-de-France sous 3 jours, aérien vers Cotonou, Lomé et Bamako 5 à 10 jours, maritime groupé 30 à 45 jours. Ce sont des délais cibles, jamais des garanties.",
    en: "Target transit times: parcels in the Paris region 24-48h, Paris-region removals within 3 days, air freight to Cotonou, Lomé and Bamako 5-10 days, grouped sea freight 30-45 days. These are targets, never guarantees.",
  },
  tarifs: {
    fr: "Le tarif dépend de la zone, du poids/volume et du service. Le calculateur du site donne le prix exact en 10 secondes, et un devis écrit est gratuit.",
    en: "Pricing depends on zone, weight/volume and service level. The on-site calculator gives the exact price in 10 seconds, and a written quote is free.",
  },
  emballage: {
    fr: "Carton double cannelure, calage sur les 6 faces, adhésif renforcé. Nous proposons aussi l'emballage professionnel en option, et l'assurance ad valorem pour les objets de valeur.",
    en: "Double-wall boxes, padding on all six sides, reinforced tape. Professional packing is available as an option, plus ad valorem insurance for valuables.",
  },
  demenagement: {
    fr: "Déménagement national et international : devis au volume (m³), démontage/remontage, emballage, monte-meubles sur demande. Une visite technique ou des photos suffisent pour chiffrer.",
    en: "Domestic and international moving: volume-based quote (m³), dismantling/reassembly, packing, furniture lift on request. Photos or a site visit are enough to quote.",
  },
  paiement: {
    fr: "Paiement par carte bancaire via notre lien sécurisé MyPOS, directement depuis votre facture. Pour un virement bancaire, contactez-nous : nous vous envoyons nos coordonnées bancaires.",
    en: "Card payment through our secure MyPOS link, straight from your invoice. For a bank transfer, contact us and we will send you our bank details.",
  },
  transporteur: {
    fr: "Vous avez un véhicule et un SIRET ? Envoyez votre candidature depuis la page « Devenir transporteur » : nous vous confions des courses dès validation du dossier.",
    en: "Got a vehicle and a registered company? Apply from the « Become a carrier » page — we assign jobs as soon as your file is approved.",
  },
  humain: {
    fr: "Un conseiller vous répond au +33 6 95 09 86 88 (téléphone et WhatsApp) ou sur contact@lbgexpresscolis.fr.",
    en: "Reach an advisor on +33 6 95 09 86 88 (phone and WhatsApp) or at contact@lbgexpresscolis.fr.",
  },
} as const;

export type SupportTopic = keyof typeof ANSWERS;

export const support = {
  /** Arbre de réponses de l'auto-répondeur (menu + textes bilingues). */
  faq: base.handler(() => ({
    topics: (Object.keys(ANSWERS) as SupportTopic[]).map((id) => ({ id, answer: ANSWERS[id] })),
    zones: (Object.keys(ZONES) as ZoneId[]).map((id) => ({
      id,
      label: ZONES[id].label,
      days: ZONES[id].days,
      base: ZONES[id].base,
      perKg: ZONES[id].perKg,
    })),
    services: Object.entries(SERVICES).map(([id, s]) => ({ id, label: s.label, coef: s.coef })),
  })),

  /** Réponse à une question du menu. */
  ask: base
    .input(
      z.object({
        topic: z.enum(Object.keys(ANSWERS) as [SupportTopic, ...SupportTopic[]]),
        locale: z.enum(["fr", "en"]).default("fr"),
      }),
    )
    .handler(({ input }) => ({ topic: input.topic, answer: ANSWERS[input.topic][input.locale] })),

  /** « Où est mon colis ? » — lookup direct dans le suivi. */
  lookup: base
    .input(z.object({ trackingNumber: z.string().min(4).max(40), locale: z.enum(["fr", "en"]).default("fr") }))
    .handler(async ({ input }) => {
      const number = input.trackingNumber.trim().toUpperCase();
      const [tracking] = await db
        .select()
        .from(schema.trackings)
        .where(eq(schema.trackings.trackingNumber, number))
        .limit(1);
      if (!tracking) {
        return {
          found: false as const,
          message:
            input.locale === "fr"
              ? `Aucun colis trouvé pour ${number}. Vérifiez le numéro (format TRK-AAAAMMJJ-XXXXXX) ou contactez-nous.`
              : `No shipment found for ${number}. Check the number (format TRK-YYYYMMDD-XXXXXX) or contact us.`,
        };
      }
      const events = await db
        .select()
        .from(schema.trackingEvents)
        .where(eq(schema.trackingEvents.trackingNumber, number));
      const last = events.at(-1);
      const label = last ? (input.locale === "fr" ? last.labelFr : last.labelEn) : tracking.status;
      return {
        found: true as const,
        trackingNumber: number,
        status: tracking.status,
        origin: tracking.origin,
        destination: tracking.destination,
        eta: tracking.eta,
        message:
          input.locale === "fr"
            ? `${number} : ${label}${last?.location ? ` (${last.location})` : ""}. Trajet ${tracking.origin} → ${tracking.destination}.`
            : `${number}: ${label}${last?.location ? ` (${last.location})` : ""}. Route ${tracking.origin} → ${tracking.destination}.`,
      };
    }),

  /** Escalade : on enregistre le lead et on notifie le webhook d'automatisation si configuré. */
  lead: base
    .input(
      z.object({
        name: z.string().max(120).optional(),
        phone: z.string().max(40).optional(),
        email: z.string().email().optional(),
        topic: z.string().max(60).default("general"),
        transcript: z.string().max(4000).optional(),
        channel: z.enum(["site_chat", "whatsapp"]).default("site_chat"),
        locale: z.enum(["fr", "en"]).default("fr"),
      }),
    )
    .handler(async ({ input }) => {
      const [row] = await db
        .insert(schema.chatLeads)
        .values({
          name: input.name ?? null,
          phone: input.phone ?? null,
          email: input.email ?? null,
          topic: input.topic,
          transcript: input.transcript ?? null,
          channel: input.channel,
          locale: input.locale,
        })
        .returning();

      const hook = process.env.WHATSAPP_AUTOMATION_WEBHOOK_URL;
      if (hook) {
        try {
          await fetch(hook, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ event: "support.lead", lead: row }),
          });
          await db
            .update(schema.chatLeads)
            .set({ forwardedAt: new Date() })
            .where(eq(schema.chatLeads.id, row.id));
        } catch {
          // Webhook optionnel : un échec ne doit jamais casser le chat.
        }
      }
      return { ok: true, id: row.id };
    }),
};
