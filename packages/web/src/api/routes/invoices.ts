import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { base } from "../__core/app";
import { db } from "../database";
import { publishJobOffer } from "../services/job-offers";
import * as schema from "../database/schema";
import { createInvoice, ISSUER, myposUrl, VAT_RATE } from "../lib/invoicing";
import { buildPurchase, myposConfig, publicBaseUrl } from "../lib/mypos";
import { computePrice, generateRef, KIND_COEF, SERVICES, ZONES } from "../lib/pricing";
import type { ServiceId, ShipmentKind, ZoneId } from "../lib/pricing";
import { getPricingConfig } from "../lib/settings";
import { mailInvoice } from "../services/email";
import { adminOnly, authed, withUser } from "../middleware/auth";

const zoneEnum = z.enum(Object.keys(ZONES) as [ZoneId, ...ZoneId[]]);
const serviceEnum = z.enum(Object.keys(SERVICES) as [ServiceId, ...ServiceId[]]);
const kindEnum = z.enum(Object.keys(KIND_COEF) as [ShipmentKind, ...ShipmentKind[]]);

async function loadInvoice(number: string) {
  const [invoice] = await db.select().from(schema.invoices).where(eq(schema.invoices.number, number)).limit(1);
  if (!invoice) throw new ORPCError("NOT_FOUND", { message: "Facture introuvable" });
  const items = await db
    .select()
    .from(schema.invoiceItems)
    .where(eq(schema.invoiceItems.invoiceId, invoice.id))
    .orderBy(asc(schema.invoiceItems.position));
  return { invoice, items, issuer: ISSUER, paymentUrl: myposUrl() };
}

/** Détail des lignes facturées à partir d'une commande/devis. */
async function itemsFromQuote(quote: typeof schema.quotes.$inferSelect) {
  const kind = (quote.kind ?? "colis") as ShipmentKind;
  const zone = (quote.zone ?? "france") as ZoneId;
  const service = (quote.service ?? "standard") as ServiceId;
  const cfg = await getPricingConfig();
  const price = computePrice({
    kind,
    zone,
    service,
    weightKg: quote.weightKg ?? undefined,
    lengthCm: quote.lengthCm ?? undefined,
    widthCm: quote.widthCm ?? undefined,
    heightCm: quote.heightCm ?? undefined,
    volumeM3: quote.volumeM3 ?? undefined,
    declaredValue: quote.declaredValue ?? undefined,
    insurance: quote.insurance ?? false,
    homePickup: quote.homePickup ?? false,
    packing: quote.packing ?? false,
    fragile: quote.fragile ?? false,
    floors: quote.floors ?? 0,
    elevator: quote.elevator ?? false,
    pieces: quote.pieces ?? 1,
  }, cfg);

  const detail = [
    `Enlèvement : ${quote.fromAddress}`,
    `Livraison : ${quote.toAddress}`,
    quote.weightKg ? `Poids : ${quote.weightKg} kg` : null,
    quote.volumeM3 ? `Volume : ${quote.volumeM3} m³` : null,
    quote.pieces && quote.pieces > 1 ? `${quote.pieces} colis` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const lines = [
    {
      label: `Transport ${ZONES[zone].label.fr} — service ${SERVICES[service].label.fr}`,
      detail,
      quantity: 1,
      unit: "forfait",
      unitPriceCents: Math.round(price.total * 100),
    },
  ];
  return { lines, price };
}

export const invoices = {
  /** Facture publique consultable par son numéro (lien envoyé au client). */
  get: base.input(z.object({ number: z.string().min(4).max(40) })).handler(({ input }) => loadInvoice(input.number)),

  /**
   * Point d'entrée unique des boutons de paiement : crée la commande si besoin,
   * génère la facture pro numérotée puis renvoie le numéro + le lien MyPOS.
   */
  checkout: withUser
    .input(
      z.object({
        quoteRef: z.string().max(40).optional(),
        subject: z.string().max(160).optional(),
        locale: z.enum(["fr", "en"]).default("fr"),
        customer: z
          .object({
            name: z.string().min(2).max(120),
            email: z.string().email(),
            phone: z.string().max(40).optional(),
            company: z.string().max(120).optional(),
            address: z.string().max(400).optional(),
          })
          .optional(),
        service: z
          .object({
            kind: kindEnum.default("colis"),
            zone: zoneEnum.default("france"),
            service: serviceEnum.default("standard"),
            weightKg: z.number().min(0).max(30000).optional(),
            volumeM3: z.number().min(0).max(500).optional(),
            pieces: z.number().min(1).max(200).optional(),
            fromAddress: z.string().max(400).optional(),
            toAddress: z.string().max(400).optional(),
            amountCents: z.number().min(100).max(50000000).optional(),
            label: z.string().max(160).optional(),
          })
          .optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      // 1) Commande existante → on facture son détail.
      if (input.quoteRef) {
        const [quote] = await db
          .select()
          .from(schema.quotes)
          .where(eq(schema.quotes.ref, input.quoteRef))
          .limit(1);
        if (!quote) throw new ORPCError("NOT_FOUND", { message: "Commande introuvable" });

        const [existing] = await db
          .select()
          .from(schema.invoices)
          .where(eq(schema.invoices.quoteRef, quote.ref))
          .limit(1);
        if (existing) {
          return { number: existing.number, quoteRef: quote.ref, paymentUrl: myposUrl(), reused: true };
        }

        const { lines } = await itemsFromQuote(quote);
        const { invoice } = await createInvoice({
          quoteRef: quote.ref,
          userId: context.user?.id ?? quote.userId ?? null,
          customerName: quote.customerName,
          customerEmail: quote.customerEmail,
          customerPhone: quote.customerPhone,
          customerCompany: quote.company,
          customerAddress: quote.fromAddress,
          subject: input.subject ?? `Commande ${quote.ref}`,
          items: lines,
          locale: (quote.locale as "fr" | "en") ?? input.locale,
        });
        await db
          .update(schema.quotes)
          .set({ invoiceId: invoice.id, status: quote.status === "nouveau" ? "a_valider" : quote.status })
          .where(eq(schema.quotes.id, quote.id));
        await mailInvoice({
          to: invoice.customerEmail,
          name: invoice.customerName,
          number: invoice.number,
          subject: invoice.subject ?? `Commande ${quote.ref}`,
          totalCents: invoice.totalCents,
          dueAt: invoice.dueAt,
          paymentUrl: myposUrl(),
        });
        return { number: invoice.number, quoteRef: quote.ref, paymentUrl: myposUrl(), reused: false };
      }

      // 2) Paiement direct (bouton hors devis) → commande créée à la volée.
      const customer = input.customer;
      if (!customer) throw new ORPCError("BAD_REQUEST", { message: "Coordonnées client requises" });
      const svc = input.service ?? { kind: "colis" as ShipmentKind, zone: "france" as ZoneId, service: "standard" as ServiceId };
      const price = svc.amountCents
        ? { total: svc.amountCents / 100, etaMin: null, etaMax: null, breakdown: [] as unknown[] }
        : computePrice(
            {
              kind: svc.kind,
              zone: svc.zone,
              service: svc.service,
              weightKg: svc.weightKg,
              volumeM3: svc.volumeM3,
              pieces: svc.pieces,
            },
            await getPricingConfig(),
          );

      const ref = generateRef("CMD");
      await db.insert(schema.quotes).values({
        ref,
        kind: svc.kind,
        service: svc.service,
        zone: svc.zone,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone ?? null,
        company: customer.company ?? null,
        fromAddress: svc.fromAddress ?? customer.address ?? "À préciser",
        toAddress: svc.toAddress ?? "À préciser",
        weightKg: svc.weightKg ?? null,
        volumeM3: svc.volumeM3 ?? null,
        pieces: svc.pieces ?? 1,
        priceCents: Math.round(price.total * 100),
        status: "a_valider",
        userId: context.user?.id ?? null,
        locale: input.locale,
      });

      const { invoice } = await createInvoice({
        quoteRef: ref,
        userId: context.user?.id ?? null,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerCompany: customer.company,
        customerAddress: customer.address,
        subject: input.subject ?? svc.label ?? "Prestation de transport",
        items: [
          {
            label: svc.label ?? `Transport ${ZONES[svc.zone].label.fr} — ${SERVICES[svc.service].label.fr}`,
            detail: [svc.fromAddress, svc.toAddress].filter(Boolean).join(" → ") || null,
            quantity: 1,
            unitPriceCents: Math.round(price.total * 100),
          },
        ],
        locale: input.locale,
      });

      await mailInvoice({
        to: invoice.customerEmail,
        name: invoice.customerName,
        number: invoice.number,
        subject: invoice.subject ?? "Prestation de transport",
        totalCents: invoice.totalCents,
        dueAt: invoice.dueAt,
        paymentUrl: myposUrl(),
      });

      return { number: invoice.number, quoteRef: ref, paymentUrl: myposUrl(), reused: false };
    }),

  /**
   * Session de paiement myPOS Checkout : renvoie l'URL d'action et les champs signés
   * que le front auto-soumet en POST. Repli sur le lien myPOS générique si non configuré.
   */
  myposSession: base
    .input(z.object({ number: z.string().min(4).max(40), locale: z.enum(["fr", "en"]).default("fr") }))
    .handler(async ({ input }) => {
      const [invoice] = await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.number, input.number))
        .limit(1);
      if (!invoice) throw new ORPCError("NOT_FOUND", { message: "Facture introuvable" });
      if (invoice.status === "payee") {
        throw new ORPCError("BAD_REQUEST", { message: "Facture déjà réglée" });
      }
      // Checkout signé désactivable : tant que la boutique myPOS n'est pas
      // débloquée côté myPOS, on renvoie le lien de paiement myPOS simple.
      const checkoutEnabled = process.env.MYPOS_CHECKOUT_ENABLED === "true";
      const cfg = checkoutEnabled ? myposConfig() : null;
      const base_url = publicBaseUrl();
      if (!cfg || !base_url) {
        return { mode: "link" as const, action: myposUrl(), fields: {} as Record<string, string> };
      }
      const purchase = buildPurchase(
        {
          orderId: invoice.number,
          amountCents: invoice.totalCents,
          currency: invoice.currency ?? "EUR",
          language: input.locale,
          customer: {
            name: invoice.customerName,
            email: invoice.customerEmail,
            phone: invoice.customerPhone,
          },
          label: invoice.subject ?? `Facture ${invoice.number}`,
          urls: {
            // myPOS n'approuve que des Request URLs sans query string : on utilise
            // deux chemins distincts, le numéro de facture est retrouvé côté client.
            ok: `${base_url}/paiement/retour`,
            cancel: `${base_url}/paiement/annule`,
            notify: `${base_url}/api/webhooks/mypos`,
          },
        },
        cfg,
      );
      return { mode: "form" as const, action: purchase.action, fields: purchase.fields };
    }),

  /** Mes factures (espace client). */
  mine: authed.handler(async ({ context }) => {
    const rows = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.customerEmail, context.user.email))
      .orderBy(desc(schema.invoices.createdAt));
    return rows;
  }),

  /** Liste back-office avec filtre de statut. */
  list: adminOnly
    .input(
      z.object({
        status: z.enum(["tous", "en_attente_paiement", "payee", "annulee", "remboursee"]).default("tous"),
      }),
    )
    .handler(async ({ input }) => {
      const rows =
        input.status === "tous"
          ? await db.select().from(schema.invoices).orderBy(desc(schema.invoices.createdAt))
          : await db
              .select()
              .from(schema.invoices)
              .where(eq(schema.invoices.status, input.status))
              .orderBy(desc(schema.invoices.createdAt));
      const totals = {
        count: rows.length,
        pendingCents: rows.filter((r) => r.status === "en_attente_paiement").reduce((s, r) => s + r.totalCents, 0),
        paidCents: rows.filter((r) => r.status === "payee").reduce((s, r) => s + r.totalCents, 0),
      };
      return { rows, totals };
    }),

  /** Création manuelle d'une facture depuis le back-office. */
  create: adminOnly
    .input(
      z.object({
        customerName: z.string().min(2).max(120),
        customerEmail: z.string().email(),
        customerPhone: z.string().max(40).optional(),
        customerCompany: z.string().max(120).optional(),
        customerAddress: z.string().max(400).optional(),
        subject: z.string().max(160).default("Prestation de transport"),
        quoteRef: z.string().max(40).optional(),
        notes: z.string().max(2000).optional(),
        vatRate: z.number().min(0).max(30).default(VAT_RATE),
        items: z
          .array(
            z.object({
              label: z.string().min(2).max(200),
              detail: z.string().max(400).optional(),
              quantity: z.number().min(0.01).max(9999).default(1),
              unit: z.string().max(30).default("forfait"),
              unitPriceCents: z.number().min(0).max(50000000),
            }),
          )
          .min(1),
      }),
    )
    .handler(async ({ input, context }) => {
      const { invoice } = await createInvoice({ ...input, items: input.items });
      await db.insert(schema.auditLog).values({
        userId: context.user.id,
        userEmail: context.user.email,
        action: "invoice.create",
        target: invoice.number,
        detail: `${(invoice.totalCents / 100).toFixed(2)} € TTC`,
      });
      return invoice;
    }),

  /** Suivi du règlement (l'admin confirme le paiement carte ou virement). */
  setStatus: adminOnly
    .input(
      z.object({
        number: z.string().min(4).max(40),
        status: z.enum(["en_attente_paiement", "payee", "annulee", "remboursee"]),
        paymentMethod: z.enum(["carte_mypos", "virement", "especes", "autre"]).optional(),
        paymentReference: z.string().max(120).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const [invoice] = await db
        .select()
        .from(schema.invoices)
        .where(eq(schema.invoices.number, input.number))
        .limit(1);
      if (!invoice) throw new ORPCError("NOT_FOUND", { message: "Facture introuvable" });

      await db
        .update(schema.invoices)
        .set({
          status: input.status,
          paymentMethod: input.paymentMethod ?? invoice.paymentMethod,
          paymentReference: input.paymentReference ?? invoice.paymentReference,
          paidAt: input.status === "payee" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(schema.invoices.id, invoice.id));

      if (input.status === "payee" && invoice.quoteRef) {
        await db.insert(schema.payments).values({
          quoteRef: invoice.quoteRef,
          provider: input.paymentMethod ?? "carte_mypos",
          amountCents: invoice.totalCents,
          status: "confirme",
          reference: input.paymentReference ?? invoice.number,
          payerEmail: invoice.customerEmail,
        });
        await db
          .update(schema.quotes)
          .set({ status: "paye" })
          .where(and(eq(schema.quotes.ref, invoice.quoteRef)));
        // Commande payée → la course part aux livreurs disponibles.
        await publishJobOffer(invoice.quoteRef).catch(() => null);
      }

      await db.insert(schema.auditLog).values({
        userId: context.user.id,
        userEmail: context.user.email,
        action: `invoice.${input.status}`,
        target: invoice.number,
      });
      return { ok: true };
    }),
};
