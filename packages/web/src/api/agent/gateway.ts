import { createOpenAI } from "@ai-sdk/openai";

/**
 * Fournisseur IA du chat du site — accès DIRECT à OpenAI, sans intermédiaire.
 *
 * Historique : ce fichier passait par la passerelle managée de Runable
 * (AI_GATEWAY_BASE_URL + AI_GATEWAY_API_KEY). Le site étant désormais autonome,
 * il appelle OpenAI avec la clé de l'entreprise (OPENAI_API_KEY).
 *
 * Changer de modèle sans toucher au code : AI_MODEL dans le .env racine.
 * Pour repasser sur un autre fournisseur, il suffit de remplacer ce fichier
 * (n'importe quel provider Vercel AI SDK expose la même interface).
 */
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/** Modèle du chat. gpt-5.4-mini : rapide et peu coûteux, suffisant pour du support. */
export const CHAT_MODEL = process.env.AI_MODEL ?? "gpt-5.4-mini";

/** Le chat ne peut fonctionner sans clé : l'API le signale proprement au visiteur. */
export const aiConfigured = Boolean(process.env.OPENAI_API_KEY);
