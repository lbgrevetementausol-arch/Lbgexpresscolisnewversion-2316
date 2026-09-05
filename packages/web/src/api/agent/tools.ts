import { tool } from "ai";
import { eq } from "drizzle-orm";
import z from "zod";
import { db } from "../database";
import * as schema from "../database/schema";

/** Suivi de colis en direct dans la base — le seul chiffre que l'assistant a le droit d'affirmer. */
export const trackParcel = tool({
  description:
    "Recherche l'état réel d'un colis à partir de son numéro de suivi (format TRK-AAAAMMJJ-XXXXXX). À utiliser dès que le client donne un numéro de suivi ou demande où est son colis.",
  inputSchema: z.object({
    trackingNumber: z.string().min(4).max(40).describe("Numéro de suivi fourni par le client"),
  }),
  async execute({ trackingNumber }) {
    const number = trackingNumber.trim().toUpperCase();
    const [row] = await db
      .select()
      .from(schema.trackings)
      .where(eq(schema.trackings.trackingNumber, number))
      .limit(1);
    if (!row) return { found: false as const, trackingNumber: number };

    const events = await db
      .select()
      .from(schema.trackingEvents)
      .where(eq(schema.trackingEvents.trackingNumber, number));
    const last = events.at(-1);
    return {
      found: true as const,
      trackingNumber: number,
      status: row.status,
      lastEventFr: last?.labelFr ?? null,
      lastEventEn: last?.labelEn ?? null,
      location: last?.location ?? null,
      origin: row.origin,
      destination: row.destination,
      eta: row.eta ? new Date(row.eta).toISOString() : null,
    };
  },
});

/** Escalade humaine : enregistre la demande de rappel + la conversation pour le back-office. */
export const requestHuman = tool({
  description:
    "Transmet la conversation à l'équipe humaine et enregistre une demande de rappel. À utiliser dès que le client demande un humain, formule une réclamation, un litige, un retard, ou dès que tu n'es pas certain de la réponse. Renseigne name/phone/email seulement si le client les a donnés.",
  inputSchema: z.object({
    reason: z.string().max(300).describe("Raison de l'escalade, en une phrase"),
    name: z.string().max(120).optional(),
    phone: z.string().max(40).optional(),
    email: z.string().max(160).optional(),
    summary: z.string().max(3000).describe("Résumé de la demande du client pour l'équipe"),
    locale: z.enum(["fr", "en"]).default("fr"),
  }),
  async execute({ reason, name, phone, email, summary, locale }) {
    const [row] = await db
      .insert(schema.chatLeads)
      .values({
        name: name ?? null,
        phone: phone ?? null,
        email: email && email.includes("@") ? email : null,
        topic: `chat_ia: ${reason}`.slice(0, 60),
        transcript: summary,
        channel: "site_chat",
        locale,
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
      } catch {
        // Webhook optionnel : un échec ne doit jamais casser le chat.
      }
    }
    return { escalated: true as const, id: row.id };
  },
});
