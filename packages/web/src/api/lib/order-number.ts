/**
 * Numéro de commande à 4 chiffres (1000 → 9999).
 *
 * Il est séquentiel : la commande suivante prend le plus grand numéro attribué + 1.
 * C'est ce numéro que le client voit dans son e-mail de confirmation et qu'il donne
 * au téléphone ; la référence technique `DEV-XXXXXXXX` reste utilisée en interne.
 * Une fois 9999 atteint, on reprend le premier numéro libre à partir de 1000.
 */
import { desc, isNotNull } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";

export const ORDER_NUMBER_MIN = 1000;
export const ORDER_NUMBER_MAX = 9999;

/** Numéro de commande suivant, sous forme de chaîne de 4 chiffres. */
export async function nextOrderNumber(): Promise<string> {
  const rows = await db
    .select({ orderNumber: schema.quotes.orderNumber })
    .from(schema.quotes)
    .where(isNotNull(schema.quotes.orderNumber))
    .orderBy(desc(schema.quotes.orderNumber));

  const used = new Set<number>();
  for (const row of rows) {
    const n = Number(row.orderNumber);
    if (Number.isInteger(n) && n >= ORDER_NUMBER_MIN && n <= ORDER_NUMBER_MAX) used.add(n);
  }

  if (used.size === 0) return String(ORDER_NUMBER_MIN);

  const suivant = Math.max(...used) + 1;
  if (suivant <= ORDER_NUMBER_MAX) return String(suivant);

  // Série épuisée : on recycle le premier numéro libre.
  for (let n = ORDER_NUMBER_MIN; n <= ORDER_NUMBER_MAX; n++) {
    if (!used.has(n)) return String(n);
  }
  throw new Error("Plus aucun numéro de commande à 4 chiffres disponible");
}
