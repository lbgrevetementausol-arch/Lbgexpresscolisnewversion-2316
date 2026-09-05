import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import { base } from "../__core/app";
import { auth } from "../auth";
import { db } from "../database";
import * as schema from "../database/schema";

/** En-tête attendu pour les appels partenaires. */
export const API_KEY_HEADER = "x-lbg-api-key";

type Caller =
  | { kind: "admin"; id: string; email: string; label: string }
  | { kind: "api"; id: number; label: string };

/** Vérifie une clé API : existante, non révoquée. Met à jour la date de dernier usage. */
async function resolveApiKey(rawKey: string): Promise<Caller | null> {
  const key = rawKey.trim();
  if (key.length < 16) return null;
  const [row] = await db.select().from(schema.apiKeys).where(eq(schema.apiKeys.key, key));
  if (!row || row.revoked) return null;
  await db.update(schema.apiKeys).set({ lastUsedAt: new Date() }).where(eq(schema.apiKeys.id, row.id));
  return { kind: "api", id: row.id, label: row.label };
}

/**
 * Écriture sur le suivi : réservée à une session admin (back-office)
 * ou à une clé API partenaire valide envoyée dans l'en-tête x-lbg-api-key.
 * `context.caller` identifie l'appelant pour la traçabilité.
 */
export const partnerOrAdmin = base.use(async ({ context, next }) => {
  const headerKey = context.headers.get(API_KEY_HEADER);
  if (headerKey) {
    const caller = await resolveApiKey(headerKey);
    if (!caller) throw new ORPCError("UNAUTHORIZED", { message: "Clé API invalide ou révoquée" });
    return next({ context: { caller } });
  }

  const session = await auth.api.getSession({ headers: context.headers });
  const user = session?.user as { id: string; email: string; role?: string | null } | undefined;
  if (!user || user.role !== "admin") {
    throw new ORPCError("UNAUTHORIZED", {
      message: "Écriture réservée au back-office ou à une clé API partenaire (en-tête x-lbg-api-key).",
    });
  }

  return next({
    context: { caller: { kind: "admin", id: user.id, email: user.email, label: user.email } as Caller },
  });
});
