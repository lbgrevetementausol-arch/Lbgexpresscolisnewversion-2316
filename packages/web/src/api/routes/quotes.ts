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

const quoteInput = priceInput.extend({
  customerName: z.string().min(2).max(120),
  customerEmail: z.string().email(),
  customerPhone: z.string().max(40).optional(),
  company: z.string().max(120).optional(),
  fromAddress: z.string().min(3).max(400),
  toAddress: z.string().min(3).max(400),
  goodsDescription: z.string().max(1000).optional(),
  message: z.string().max(2000).optional(),
  locale: z.enum(["fr", "en"]).default("fr"),
});

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

    const [quote] = await db
      .insert(schema.quotes)
      .values({
        ref,
        kind: input.kind,
        service: input.service,
        zone: input.zone,
        customerName: input.customerName,
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
      recipientName: input.customerName,
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
      labelFr: "Devis enregistré — expédition créée",
      labelEn: "Quote saved — shipment created",
      location: input.fromAddress,
    });

    const priceCents = Math.round(price.total * 100);
    await mailQuoteReceipt({
      to: input.customerEmail,
      name: input.customerName,
      ref: quote.ref,
      trackingNumber,
      priceCents,
      from: input.fromAddress,
      to_: input.toAddress,
      etaMin: price.etaDays[0],
      etaMax: price.etaDays[1],
    });
    await mailQuoteOps({
      ref: quote.ref,
      kind: input.kind,
      zone: input.zone,
      service: input.service,
      name: input.customerName,
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
      trackingNumber,
      total: price.total,
      breakdown: price.breakdown,
      etaDays: price.etaDays,
      chargeableWeight: price.chargeableWeight,
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
