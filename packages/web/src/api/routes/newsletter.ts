import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { adminOnly } from "../middleware/auth";

/** Collecte d'e-mails newsletter (popup du site) + lecture depuis le back-office. */
export const newsletter = {
  /** Inscription publique. Un e-mail déjà présent est réactivé sans erreur. */
  subscribe: base
    .input(
      z.object({
        email: z.string().email().max(160),
        name: z.string().max(120).optional(),
        source: z.string().max(40).default("popup"),
        locale: z.enum(["fr", "en"]).default("fr"),
      }),
    )
    .handler(async ({ input }) => {
      const email = input.email.trim().toLowerCase();
      const [existing] = await db
        .select()
        .from(schema.newsletterSubscribers)
        .where(eq(schema.newsletterSubscribers.email, email))
        .limit(1);

      if (existing) {
        if (!existing.active) {
          await db
            .update(schema.newsletterSubscribers)
            .set({ active: true })
            .where(eq(schema.newsletterSubscribers.id, existing.id));
        }
        return { ok: true as const, alreadySubscribed: true as const };
      }

      await db.insert(schema.newsletterSubscribers).values({
        email,
        name: input.name?.trim() || null,
        source: input.source,
        locale: input.locale,
      });
      return { ok: true as const, alreadySubscribed: false as const };
    }),

  /** Désinscription publique (lien de désabonnement). */
  unsubscribe: base
    .input(z.object({ email: z.string().email().max(160) }))
    .handler(async ({ input }) => {
      await db
        .update(schema.newsletterSubscribers)
        .set({ active: false })
        .where(eq(schema.newsletterSubscribers.email, input.email.trim().toLowerCase()));
      return { ok: true as const };
    }),

  /** Liste complète pour le back-office. */
  list: adminOnly.handler(async () => {
    const rows = await db
      .select()
      .from(schema.newsletterSubscribers)
      .orderBy(desc(schema.newsletterSubscribers.createdAt))
      .limit(1000);
    return rows;
  }),
};
