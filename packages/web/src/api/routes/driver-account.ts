import { ORPCError } from "@orpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  RESET_TTL_MS,
  VERIFY_TTL_MS,
  hashPassword,
  newAccessCode,
  newResetToken,
  newVerifyCode,
  normalizeEmail,
  verifyPassword,
} from "../lib/driver-auth";
import { signDriverToken, verifyDriverToken } from "../lib/driver-token";
import { mailCarrierOps, mailDriverReset, mailDriverVerify, mailJobAssigned } from "../services/email";

const SITE = process.env.WEBSITE_URL ?? "https://www.lbgexpresscolis.fr";

/** Vue publique d'un compte livreur — jamais de hash ni de code interne. */
function publicDriver(d: typeof schema.drivers.$inferSelect) {
  return {
    id: d.id,
    name: d.name,
    firstName: d.firstName,
    lastName: d.lastName,
    email: d.email,
    phone: d.phone,
    whatsapp: d.whatsapp,
    address: d.address,
    city: d.city,
    vehicle: d.vehicle,
    plate: d.plate,
    emailVerified: d.emailVerified,
    approvalStatus: d.approvalStatus,
    approvalNote: d.approvalNote,
    available: d.available,
    active: d.active,
  };
}

async function driverById(id: number) {
  const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.id, id)).limit(1);
  if (!driver) throw new ORPCError("UNAUTHORIZED", { message: "Compte livreur introuvable" });
  return driver;
}

/** Session livreur valide : compte actif, e-mail vérifié, dossier validé. */
async function requireActiveDriver(token: string) {
  const driver = await driverById(verifyDriverToken(token));
  if (!driver.active) throw new ORPCError("FORBIDDEN", { message: "Compte livreur désactivé" });
  if (!driver.emailVerified) throw new ORPCError("FORBIDDEN", { message: "Adresse e-mail non vérifiée" });
  if (driver.approvalStatus !== "valide") {
    throw new ORPCError("FORBIDDEN", { message: "Dossier en cours de validation par LBG Express" });
  }
  return driver;
}

export const driverAccount = {
  /** Inscription livreur depuis le site — documents déjà téléversés (clés). */
  register: base
    .input(
      z.object({
        firstName: z.string().min(2).max(60),
        lastName: z.string().min(2).max(60),
        email: z.string().email(),
        phone: z.string().min(6).max(30),
        whatsapp: z.string().min(6).max(30),
        address: z.string().min(6).max(200),
        city: z.string().min(2).max(80),
        vehicle: z.string().min(2).max(60),
        plate: z.string().min(4).max(20),
        siret: z.string().max(20).optional(),
        password: z.string().min(8).max(72),
        licenseKey: z.string().min(8),
        idPhotoKey: z.string().min(8),
        vehicleDocKey: z.string().min(8).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const email = normalizeEmail(input.email);
      const [existing] = await db.select().from(schema.drivers).where(eq(schema.drivers.email, email)).limit(1);
      if (existing) {
        throw new ORPCError("CONFLICT", {
          message: "Un compte livreur existe déjà avec cette adresse. Connectez-vous ou utilisez « mot de passe oublié ».",
        });
      }

      const code = newVerifyCode();
      const name = `${input.firstName.trim()} ${input.lastName.trim()}`;
      const [driver] = await db
        .insert(schema.drivers)
        .values({
          name,
          firstName: input.firstName.trim(),
          lastName: input.lastName.trim(),
          email,
          phone: input.phone.trim(),
          whatsapp: input.whatsapp.trim(),
          address: input.address.trim(),
          city: input.city.trim(),
          vehicle: input.vehicle.trim(),
          plate: input.plate.trim().toUpperCase(),
          siret: input.siret?.trim() || null,
          code: newAccessCode(),
          passwordHash: await hashPassword(input.password),
          licenseKey: input.licenseKey,
          idPhotoKey: input.idPhotoKey,
          vehicleDocKey: input.vehicleDocKey ?? null,
          emailVerified: false,
          verifyCode: code,
          verifyExpiresAt: new Date(Date.now() + VERIFY_TTL_MS),
          approvalStatus: "en_attente",
          available: false,
          active: true,
        })
        .returning();
      if (!driver) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Inscription non enregistrée" });

      await mailDriverVerify({ to: email, name: input.firstName.trim(), code }).catch(() => null);
      await mailCarrierOps({
        name,
        email,
        phone: input.phone,
        city: input.city,
        vehicle: `${input.vehicle} — ${input.plate.toUpperCase()}`,
        siret: input.siret ?? null,
        message: `Inscription livreur avec documents. Adresse : ${input.address}. WhatsApp : ${input.whatsapp}.`,
      }).catch(() => null);

      return { ok: true, email, driverId: driver.id };
    }),

  /** Confirmation de l'adresse e-mail par code à 6 chiffres. */
  verifyEmail: base
    .input(z.object({ email: z.string().email(), code: z.string().length(6) }))
    .handler(async ({ input }) => {
      const email = normalizeEmail(input.email);
      const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.email, email)).limit(1);
      if (!driver) throw new ORPCError("NOT_FOUND", { message: "Aucun compte pour cette adresse" });
      if (driver.emailVerified) return { ok: true, alreadyVerified: true, approvalStatus: driver.approvalStatus };
      if (!driver.verifyCode || driver.verifyCode !== input.code.trim()) {
        throw new ORPCError("UNAUTHORIZED", { message: "Code invalide" });
      }
      if (!driver.verifyExpiresAt || driver.verifyExpiresAt.getTime() < Date.now()) {
        throw new ORPCError("UNAUTHORIZED", { message: "Code expiré, demandez-en un nouveau" });
      }
      await db
        .update(schema.drivers)
        .set({ emailVerified: true, verifyCode: null, verifyExpiresAt: null })
        .where(eq(schema.drivers.id, driver.id));
      return { ok: true, alreadyVerified: false, approvalStatus: driver.approvalStatus };
    }),

  /** Renvoi du code de vérification. */
  resendCode: base.input(z.object({ email: z.string().email() })).handler(async ({ input }) => {
    const email = normalizeEmail(input.email);
    const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.email, email)).limit(1);
    if (!driver || driver.emailVerified) return { ok: true };
    const code = newVerifyCode();
    await db
      .update(schema.drivers)
      .set({ verifyCode: code, verifyExpiresAt: new Date(Date.now() + VERIFY_TTL_MS) })
      .where(eq(schema.drivers.id, driver.id));
    await mailDriverVerify({ to: email, name: driver.firstName ?? driver.name, code }).catch(() => null);
    return { ok: true };
  }),

  /** Connexion par e-mail + mot de passe. */
  login: base
    .input(z.object({ email: z.string().email(), password: z.string().min(1).max(72) }))
    .handler(async ({ input }) => {
      const email = normalizeEmail(input.email);
      const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.email, email)).limit(1);
      if (!driver || !(await verifyPassword(input.password, driver.passwordHash))) {
        throw new ORPCError("UNAUTHORIZED", { message: "E-mail ou mot de passe incorrect" });
      }
      if (!driver.active) throw new ORPCError("FORBIDDEN", { message: "Compte livreur désactivé" });
      if (!driver.emailVerified) {
        throw new ORPCError("FORBIDDEN", { message: "Vérifiez d'abord votre adresse e-mail (code reçu par e-mail)" });
      }
      await db.update(schema.drivers).set({ lastLoginAt: new Date() }).where(eq(schema.drivers.id, driver.id));
      return {
        token: signDriverToken(driver.id),
        driver: publicDriver(driver),
      };
    }),

  /** Profil courant, rechargé à chaque ouverture de l'espace. */
  me: base.input(z.object({ token: z.string().min(10) })).handler(async ({ input }) => {
    const driver = await driverById(verifyDriverToken(input.token));
    return publicDriver(driver);
  }),

  /** Demande de réinitialisation — réponse toujours identique (anti-énumération). */
  forgotPassword: base.input(z.object({ email: z.string().email() })).handler(async ({ input }) => {
    const email = normalizeEmail(input.email);
    const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.email, email)).limit(1);
    if (driver) {
      const token = newResetToken();
      await db
        .update(schema.drivers)
        .set({ resetToken: token, resetExpiresAt: new Date(Date.now() + RESET_TTL_MS) })
        .where(eq(schema.drivers.id, driver.id));
      await mailDriverReset({
        to: driver.email,
        name: driver.firstName ?? driver.name,
        url: `${SITE}/livreur?reset=${token}`,
      }).catch(() => null);
    }
    return { ok: true };
  }),

  /** Nouveau mot de passe à partir du jeton reçu par e-mail. */
  resetPassword: base
    .input(z.object({ token: z.string().min(20), password: z.string().min(8).max(72) }))
    .handler(async ({ input }) => {
      const [driver] = await db.select().from(schema.drivers).where(eq(schema.drivers.resetToken, input.token)).limit(1);
      if (!driver || !driver.resetExpiresAt || driver.resetExpiresAt.getTime() < Date.now()) {
        throw new ORPCError("UNAUTHORIZED", { message: "Lien expiré ou invalide, refaites une demande" });
      }
      await db
        .update(schema.drivers)
        .set({
          passwordHash: await hashPassword(input.password),
          resetToken: null,
          resetExpiresAt: null,
          emailVerified: true,
        })
        .where(eq(schema.drivers.id, driver.id));
      return { ok: true };
    }),

  /** Bascule « je suis disponible » — conditionne la réception des offres. */
  setAvailability: base
    .input(z.object({ token: z.string().min(10), available: z.boolean() }))
    .handler(async ({ input }) => {
      const driver = await requireActiveDriver(input.token);
      await db
        .update(schema.drivers)
        .set({ available: input.available, availableSince: input.available ? new Date() : null })
        .where(eq(schema.drivers.id, driver.id));
      return { ok: true, available: input.available };
    }),

  /** Courses ouvertes, visibles par tout livreur validé. */
  offers: base.input(z.object({ token: z.string().min(10) })).handler(async ({ input }) => {
    await requireActiveDriver(input.token);
    return db
      .select()
      .from(schema.jobOffers)
      .where(eq(schema.jobOffers.status, "ouverte"))
      .orderBy(desc(schema.jobOffers.createdAt))
      .limit(30);
  }),

  /** Acceptation d'une course — premier arrivé, premier servi. */
  acceptOffer: base
    .input(z.object({ token: z.string().min(10), offerId: z.number() }))
    .handler(async ({ input }) => {
      const driver = await requireActiveDriver(input.token);
      const [offer] = await db.select().from(schema.jobOffers).where(eq(schema.jobOffers.id, input.offerId)).limit(1);
      if (!offer) throw new ORPCError("NOT_FOUND", { message: "Course introuvable" });
      if (offer.status !== "ouverte") {
        throw new ORPCError("CONFLICT", { message: "Course déjà prise par un autre livreur" });
      }

      // Verrou applicatif : la mise à jour ne passe que si la course est encore ouverte.
      const claimed = await db
        .update(schema.jobOffers)
        .set({ status: "attribuee", acceptedDriverId: driver.id, acceptedAt: new Date() })
        .where(and(eq(schema.jobOffers.id, offer.id), eq(schema.jobOffers.status, "ouverte")))
        .returning();
      if (claimed.length === 0) {
        throw new ORPCError("CONFLICT", { message: "Course déjà prise par un autre livreur" });
      }

      const [job] = await db
        .insert(schema.driverJobs)
        .values({
          driverId: driver.id,
          trackingNumber: offer.trackingNumber,
          pickupAddress: offer.pickupAddress,
          dropAddress: offer.dropAddress,
          recipientName: offer.recipientName,
          recipientPhone: offer.recipientPhone,
          scheduledAt: offer.scheduledAt,
          status: "a_recuperer",
          payoutCents: offer.payoutCents,
        })
        .returning();

      await db
        .update(schema.trackings)
        .set({ driverId: driver.id, updatedAt: new Date() })
        .where(eq(schema.trackings.trackingNumber, offer.trackingNumber));

      await mailJobAssigned({
        to: driver.email,
        name: driver.firstName ?? driver.name,
        trackingNumber: offer.trackingNumber,
        pickup: offer.pickupAddress,
        drop: offer.dropAddress,
        recipientName: offer.recipientName,
        recipientPhone: offer.recipientPhone,
        scheduledAt: offer.scheduledAt,
      }).catch(() => null);

      return { ok: true, jobId: job?.id ?? null };
    }),
};
