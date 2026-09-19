import { ORPCError } from "@orpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import * as schema from "../database/schema";
import {
  computePrice,
  generateRef,
  generateTrackingNumber,
  SERVICES,
  ZONES,
  type ServiceId,
  type ShipmentKind,
  type ZoneId,
} from "../lib/pricing";
import { getPricingConfig } from "../lib/settings";
import { nextOrderNumber } from "../lib/order-number";
import {
  COVOITURAGE_MAX_KG,
  devisDetaille,
  PAYS_INTERNATIONAL,
  type TypeService,
} from "../../web/lib/pricing-strategique";
import { mailQuoteOps, mailQuoteReceipt } from "../services/email";

const zoneEnum = z.enum(Object.keys(ZONES) as [ZoneId, ...ZoneId[]]);
const serviceEnum = z.enum(Object.keys(SERVICES) as [ServiceId, ...ServiceId[]]);
const kindEnum = z.enum(["colis", "palette", "demenagement", "international"] as [ShipmentKind, ...ShipmentKind[]]);

const priceInput = z.object({
  kind: kindEnum.default("colis"),
  zone: zoneEnum.default("france"),
  service: serviceEnum.default("standard"),
  weightKg: z.number().min(0).max(30000).optional(),
  lengthCm: z.number().min(0).max(2000).optional(),
  widthCm: z.number().min(0).max(2000).optional(),
  heightCm: z.number().min(0).max(2000).optional(),
  volumeM3: z.number().min(0).max(500).optional(),
  declaredValue: z.number().min(0).max(1000000).optional(),
  insurance: z.boolean().optional(),
  homePickup: z.boolean().optional(),
  packing: z.boolean().optional(),
  fragile: z.boolean().optional(),
  floors: z.number().min(0).max(30).optional(),
  elevator: z.boolean().optional(),
  pieces: z.number().min(1).max(200).optional(),
  distanceKm: z.number().min(0).max(20000).optional(),
  cartons: z.number().min(0).max(500).optional(),
  hoist: z.boolean().optional(),
});

/**
 * Coordonnées exigées sur tous les formulaires : nom, prénom, e-mail et téléphone
 * joignable. Aucune commande n'est enregistrée sans ces quatre informations.
 */
const contactShape = {
  customerFirstName: z.string().trim().min(2, "Prénom requis").max(60),
  customerLastName: z.string().trim().min(2, "Nom requis").max(60),
  customerEmail: z.string().trim().email("E-mail invalide"),
  customerPhone: z
    .string()
    .trim()
    .min(8, "Téléphone joignable requis")
    .max(40)
    .regex(/^[+()0-9][0-9 ()./-]{6,}$/, "Numéro de téléphone invalide"),
};

const fullName = (input: { customerFirstName: string; customerLastName: string }) =>
  `${input.customerFirstName} ${input.customerLastName}`.replace(/\s+/g, " ").trim();

/** Notification back-office « nouvelle commande reçue ». */
async function notifyNewOrder(args: {
  orderNumber: string;
  ref: string;
  name: string;
  email: string;
  phone: string;
  priceCents: number;
  from: string;
  to: string;
  serviceLabel: string;
}) {
  await db.insert(schema.notifications).values({
    kind: "commande",
    title: `Nouvelle commande n° ${args.orderNumber}`,
    body: `${args.name} — ${args.serviceLabel} — ${(args.priceCents / 100).toFixed(2).replace(".", ",")} € HT — ${args.from} → ${args.to}`,
    quoteRef: args.ref,
    orderNumber: args.orderNumber,
    amountCents: args.priceCents,
    customerName: args.name,
    customerEmail: args.email,
    customerPhone: args.phone,
  });
}

const quoteInput = priceInput.extend({
  ...contactShape,
  company: z.string().max(120).optional(),
  fromAddress: z.string().min(3).max(400),
  toAddress: z.string().min(3).max(400),
  goodsDescription: z.string().max(1000).optional(),
  message: z.string().max(2000).optional(),
  locale: z.enum(["fr", "en"]).default("fr"),
});

/** Entrée des 3 formulaires spécialisés (moteur « tarif stratégique »). */
const strategiqueInput = z.object({
  typeService: z.enum(["covoiturage", "international", "demenagement"]),
  fromAddress: z.string().min(3).max(400),
  toAddress: z.string().min(3).max(400),
  distanceKm: z.number().min(0).max(20000).optional(),
  weightKg: z.number().min(0).max(1000).optional(),
  gabarit: z.enum(["petit", "moyen", "grand", "hors-norme"]).optional(),
  pays: z.string().max(80).optional(),
  modeTransport: z.enum(["avion", "maritime"]).optional(),
  cartons: z.number().min(0).max(500).optional(),
  volumeM3: z.number().min(0).max(500).optional(),
  etagesSansAscenseur: z.number().min(0).max(30).optional(),
  accesDifficile: z.boolean().optional(),
  goodsDescription: z.string().max(1000).optional(),
  ...contactShape,
  message: z.string().max(2000).optional(),
  locale: z.enum(["fr", "en"]).default("fr"),
});

const STRATEGIQUE_KIND: Record<TypeService, ShipmentKind> = {
  covoiturage: "colis",
  international: "international",
  demenagement: "demenagement",
};

const STRATEGIQUE_LABEL: Record<TypeService, string> = {
  covoiturage: "Covoiturage de colis",
  international: "Envoi international",
  demenagement: "Déménagement",
};

export const quotes = {
  /** Calculateur de prix instantané (public, sans enregistrement) */
  estimate: base.input(priceInput).handler(async ({ input }) => {
    const result = computePrice(input, await getPricingConfig());
    return {
      ...result,
      zoneLabel: ZONES[input.zone].label,
      serviceLabel: SERVICES[input.service].label,
    };
  }),

  /** Grille des zones et services pour les formulaires */
  options: base.handler(async () => {
    const cfg = await getPricingConfig();
    return {
      zones: Object.entries(ZONES).map(([id, z]) => ({
        id,
        label: z.label,
        days: z.days,
        base: z.base,
        perKg: z.perKg,
        perKgHeavy: z.perKgHeavy,
        pallet: z.pallet,
        m3Short: z.m3Short,
        m3Long: z.m3Long,
      })),
      services: Object.entries(SERVICES).map(([id, s]) => ({ id, label: s.label })),
      config: {
        fuelSurchargePercent: cfg.fuelSurchargePercent,
        vatRate: cfg.vatRate,
        insuranceRatePercent: cfg.insuranceRatePercent,
        insuranceMinHt: cfg.insuranceMinHt,
        cartonUnitHt: cfg.cartonUnitHt,
        floorPenaltyHt: cfg.floorPenaltyHt,
        furnitureHoistHt: cfg.furnitureHoistHt,
        expressFlatIdfHt: cfg.expressFlatIdfHt,
        expressPercent: cfg.expressPercent,
        volumetricDivisor: cfg.volumetricDivisor,
      },
    };
  }),

  /** Création d'un devis : enregistre + génère le numéro de suivi */
  create: base.input(quoteInput).handler(async ({ input }) => {
    const price = computePrice(input, await getPricingConfig());
    const ref = generateRef(input.kind === "demenagement" ? "DEM" : "DEV");
    const trackingNumber = generateTrackingNumber();
    const orderNumber = await nextOrderNumber();
    const customerName = fullName(input);

    const [quote] = await db
      .insert(schema.quotes)
      .values({
        ref,
        orderNumber,
        kind: input.kind,
        service: input.service,
        zone: input.zone,
        customerName,
        customerFirstName: input.customerFirstName,
        customerLastName: input.customerLastName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        company: input.company,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        weightKg: input.weightKg,
        lengthCm: input.lengthCm,
        widthCm: input.widthCm,
        heightCm: input.heightCm,
        volumeM3: price.volumeM3,
        pieces: input.pieces ?? 1,
        floors: input.floors ?? 0,
        elevator: input.elevator ?? false,
        insurance: input.insurance ?? false,
        homePickup: input.homePickup ?? false,
        packing: input.packing ?? false,
        fragile: input.fragile ?? false,
        declaredValue: input.declaredValue,
        goodsDescription: input.goodsDescription,
        message: input.message,
        priceCents: Math.round(price.total * 100),
        breakdown: JSON.stringify(price.breakdown),
        etaMin: price.etaDays[0],
        etaMax: price.etaDays[1],
        trackingNumber,
        locale: input.locale,
      })
      .returning();

    if (!quote) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Devis non enregistré" });

    const eta = new Date(Date.now() + price.etaDays[1] * 24 * 3600 * 1000);
    await db.insert(schema.trackings).values({
      trackingNumber,
      quoteId: quote.id,
      recipientName: customerName,
      origin: input.fromAddress,
      destination: input.toAddress,
      status: "cree",
      service: input.service,
      weightKg: input.weightKg,
      eta,
      source: "site",
    });
    await db.insert(schema.trackingEvents).values({
      trackingNumber,
      status: "cree",
      labelFr: `Commande n° ${orderNumber} enregistrée — expédition créée`,
      labelEn: `Order no. ${orderNumber} recorded — shipment created`,
      location: input.fromAddress,
    });

    const priceCents = Math.round(price.total * 100);
    const serviceLabel = `${SERVICES[input.service].label.fr} · ${ZONES[input.zone].label.fr}`;
    await notifyNewOrder({
      orderNumber,
      ref: quote.ref,
      name: customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
      priceCents,
      from: input.fromAddress,
      to: input.toAddress,
      serviceLabel,
    });
    await mailQuoteReceipt({
      to: input.customerEmail,
      name: customerName,
      firstName: input.customerFirstName,
      ref: quote.ref,
      orderNumber,
      trackingNumber,
      priceCents,
      from: input.fromAddress,
      to_: input.toAddress,
      etaMin: price.etaDays[0],
      etaMax: price.etaDays[1],
      serviceLabel,
    });
    await mailQuoteOps({
      ref: quote.ref,
      orderNumber,
      kind: input.kind,
      zone: input.zone,
      service: input.service,
      name: customerName,
      firstName: input.customerFirstName,
      lastName: input.customerLastName,
      email: input.customerEmail,
      phone: input.customerPhone,
      from: input.fromAddress,
      to_: input.toAddress,
      priceCents,
      trackingNumber,
      message: input.message,
    });

    return {
      ref: quote.ref,
      orderNumber,
      trackingNumber,
      total: price.total,
      breakdown: price.breakdown,
      etaDays: price.etaDays,
      chargeableWeight: price.chargeableWeight,
    };
  }),

  /**
   * Création d'un devis issu des 3 formulaires spécialisés (covoiturage / international /
   * déménagement). Le prix est recalculé ici avec le moteur « tarif stratégique » : le
   * navigateur ne fait qu'afficher, le serveur reste seul juge du montant facturé.
   */
  createStrategique: base.input(strategiqueInput).handler(async ({ input }) => {
    if (input.typeService === "covoiturage" && (input.weightKg ?? 0) > COVOITURAGE_MAX_KG) {
      throw new ORPCError("BAD_REQUEST", {
        message: `Le covoiturage de colis s'arrête à ${COVOITURAGE_MAX_KG} kg. Au-delà, demandez un devis sur mesure.`,
      });
    }

    const price = devisDetaille(input.typeService, {
      distance: input.distanceKm,
      poids: input.weightKg,
      modeTransport: input.modeTransport,
      nombreCartons: input.cartons,
      volumeM3: input.volumeM3,
      etagesSansAscenseur: input.etagesSansAscenseur,
      accesDifficile: input.accesDifficile,
    });

    const kind = STRATEGIQUE_KIND[input.typeService];
    const zone = input.typeService === "international" ? "afrique" : "france";
    const orderNumber = await nextOrderNumber();
    const customerName = fullName(input);
    const ref = generateRef(input.typeService === "demenagement" ? "DEM" : "DEV");
    const trackingNumber = generateTrackingNumber();
    const pays = input.pays
      ? (PAYS_INTERNATIONAL.find((p) => p.id === input.pays)?.label ?? input.pays)
      : undefined;
    const details = [
      input.goodsDescription,
      pays ? `Destination : ${pays}` : undefined,
      input.modeTransport ? `Mode : ${input.modeTransport === "avion" ? "aérien cargo / GP" : "maritime groupage"}` : undefined,
      input.gabarit ? `Gabarit : ${input.gabarit}` : undefined,
      input.distanceKm ? `Distance estimée : ${Math.round(input.distanceKm)} km` : undefined,
      input.accesDifficile ? "Accès difficile / portage long signalé" : undefined,
    ]
      .filter(Boolean)
      .join(" — ");

    const [quote] = await db
      .insert(schema.quotes)
      .values({
        ref,
        kind,
        service: "standard",
        zone,
        orderNumber,
        customerName,
        customerFirstName: input.customerFirstName,
        customerLastName: input.customerLastName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        fromAddress: input.fromAddress,
        toAddress: input.toAddress,
        weightKg: input.weightKg,
        volumeM3: input.volumeM3,
        pieces: Math.max(1, input.cartons ?? 1),
        floors: input.etagesSansAscenseur ?? 0,
        elevator: (input.etagesSansAscenseur ?? 0) === 0,
        goodsDescription: details || undefined,
        message: input.message,
        priceCents: Math.round(price.total * 100),
        breakdown: JSON.stringify(price.lines),
        etaMin: price.etaDays[0],
        etaMax: price.etaDays[1],
        trackingNumber,
        locale: input.locale,
      })
      .returning();

    if (!quote) throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Devis non enregistré" });

    const eta = new Date(Date.now() + price.etaDays[1] * 24 * 3600 * 1000);
    await db.insert(schema.trackings).values({
      trackingNumber,
      quoteId: quote.id,
      recipientName: customerName,
      origin: input.fromAddress,
      destination: input.toAddress,
      status: "cree",
      service: "standard",
      weightKg: input.weightKg,
      eta,
      source: "site",
    });
    await db.insert(schema.trackingEvents).values({
      trackingNumber,
      status: "cree",
      labelFr: `Commande n° ${orderNumber} enregistrée — expédition créée`,
      labelEn: `Order no. ${orderNumber} recorded — shipment created`,
      location: input.fromAddress,
    });

    const priceCents = Math.round(price.total * 100);
    const serviceLabel = STRATEGIQUE_LABEL[input.typeService];
    await notifyNewOrder({
      orderNumber,
      ref: quote.ref,
      name: customerName,
      email: input.customerEmail,
      phone: input.customerPhone,
      priceCents,
      from: input.fromAddress,
      to: input.toAddress,
      serviceLabel,
    });
    await mailQuoteReceipt({
      to: input.customerEmail,
      name: customerName,
      firstName: input.customerFirstName,
      ref: quote.ref,
      orderNumber,
      trackingNumber,
      priceCents,
      from: input.fromAddress,
      to_: input.toAddress,
      etaMin: price.etaDays[0],
      etaMax: price.etaDays[1],
      serviceLabel,
    });
    await mailQuoteOps({
      ref: quote.ref,
      orderNumber,
      kind,
      zone,
      service: "standard",
      name: customerName,
      firstName: input.customerFirstName,
      lastName: input.customerLastName,
      email: input.customerEmail,
      phone: input.customerPhone,
      from: input.fromAddress,
      to_: input.toAddress,
      priceCents,
      trackingNumber,
      message: [details, input.message].filter(Boolean).join(" | ") || undefined,
    });

    return {
      ref: quote.ref,
      orderNumber,
      trackingNumber,
      total: price.total,
      breakdown: price.lines,
      etaDays: price.etaDays,
    };
  }),

  /** Consultation d'un devis par référence (page paiement) */
  get: base.input(z.object({ ref: z.string().min(4) })).handler(async ({ input }) => {
    const [quote] = await db
      .select()
      .from(schema.quotes)
      .where(eq(schema.quotes.ref, input.ref.trim().toUpperCase()));
    if (!quote) throw new ORPCError("NOT_FOUND", { message: "Devis introuvable" });
    const [payment] = await db
      .select()
      .from(schema.payments)
      .where(eq(schema.payments.quoteRef, quote.ref))
      .orderBy(desc(schema.payments.createdAt))
      .limit(1);
    return {
      ...quote,
      breakdown: quote.breakdown ? (JSON.parse(quote.breakdown) as { key: string; label: { fr: string; en: string }; amount: number }[]) : [],
      payment: payment ?? null,
    };
  }),

  /** Enregistrement d'un paiement (virement / carte via prestataire à connecter) */
  pay: base
    .input(
      z.object({
        ref: z.string().min(4),
        provider: z.enum(["carte", "virement", "paypal", "especes"]),
        payerEmail: z.string().email().optional(),
      }),
    )
    .handler(async ({ input }) => {
      const ref = input.ref.trim().toUpperCase();
      const [quote] = await db.select().from(schema.quotes).where(eq(schema.quotes.ref, ref));
      if (!quote) throw new ORPCError("NOT_FOUND", { message: "Devis introuvable" });

      const reference = generateRef("PAY");
      const status = input.provider === "virement" ? "en_attente" : "confirme";
      await db.insert(schema.payments).values({
        quoteRef: ref,
        provider: input.provider,
        amountCents: quote.priceCents,
        status,
        reference,
        payerEmail: input.payerEmail ?? quote.customerEmail,
      });

      if (status === "confirme") {
        await db.update(schema.quotes).set({ status: "paye" }).where(eq(schema.quotes.ref, ref));
        if (quote.trackingNumber) {
          await db
            .update(schema.trackings)
            .set({ status: "pris_en_charge", updatedAt: new Date() })
            .where(eq(schema.trackings.trackingNumber, quote.trackingNumber));
          await db.insert(schema.trackingEvents).values({
            trackingNumber: quote.trackingNumber,
            status: "pris_en_charge",
            labelFr: "Paiement confirmé — expédition planifiée",
            labelEn: "Payment confirmed — shipment scheduled",
            location: quote.fromAddress,
          });
        }
      }

      return { reference, status, amount: quote.priceCents / 100, trackingNumber: quote.trackingNumber };
    }),
};
