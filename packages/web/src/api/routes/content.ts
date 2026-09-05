import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import { POSTS } from "../lib/posts";
import { mailCarrierOps, mailContactOps } from "../services/email";

export const content = {
  /** Formulaire de contact / aide */
  contact: base
    .input(
      z.object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().max(40).optional(),
        subject: z.string().min(2).max(160),
        message: z.string().min(5).max(4000),
      }),
    )
    .handler(async ({ input }) => {
      const [row] = await db.insert(schema.contacts).values(input).returning();
      await mailContactOps({
        name: input.name,
        email: input.email,
        phone: input.phone ?? null,
        subject: input.subject,
        message: input.message,
      });
      return { id: row?.id, ok: true };
    }),

  /** Candidature transporteur partenaire */
  applyCarrier: base
    .input(
      z.object({
        name: z.string().min(2).max(120),
        email: z.string().email(),
        phone: z.string().min(6).max(40),
        city: z.string().min(2).max(120),
        vehicle: z.string().min(2).max(120),
        capacityM3: z.number().min(0).max(200).optional(),
        siret: z.string().max(40).optional(),
        message: z.string().max(2000).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const [row] = await db.insert(schema.carrierApplications).values(input).returning();
      await mailCarrierOps({
        name: input.name,
        email: input.email,
        phone: input.phone,
        city: input.city,
        vehicle: input.vehicle,
        capacityM3: input.capacityM3 ?? null,
        siret: input.siret ?? null,
        message: input.message ?? null,
      });
      return { id: row?.id, ok: true };
    }),

  /** Blog — articles servis depuis le contenu éditorial versionné */
  posts: base.handler(() =>
    POSTS.map(({ body, ...rest }) => ({ ...rest, readingMinutes: Math.max(2, Math.round(body.fr.length / 900)) })),
  ),

  post: base.input(z.object({ slug: z.string().min(2) })).handler(({ input }) => {
    const post = POSTS.find((p) => p.slug === input.slug);
    if (!post) throw new ORPCError("NOT_FOUND", { message: "Article introuvable" });
    return post;
  }),
};
