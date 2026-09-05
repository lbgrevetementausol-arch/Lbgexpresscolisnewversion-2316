/**
 * Seed de démonstration — données réalistes pour la démo du site.
 * Exécution : cd packages/web && bun --env-file=../../.env src/api/database/seed.ts
 * Idempotent : purge les tables de démo avant de réinsérer.
 */
import { db } from "./__client";
import * as schema from "./schema";
import { computePrice, generateRef } from "../lib/pricing";

const day = 24 * 3600 * 1000;
const ago = (d: number) => new Date(Date.now() - d * day);
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600 * 1000);

async function reset() {
  await db.delete(schema.trackingEvents);
  await db.delete(schema.trackingLocations);
  await db.delete(schema.driverJobs);
  await db.delete(schema.trackings);
  await db.delete(schema.payments);
  await db.delete(schema.quotes);
  await db.delete(schema.drivers);
  await db.delete(schema.contacts);
  await db.delete(schema.carrierApplications);
  await db.delete(schema.apiKeys);
  await db.delete(schema.webhooks);
}

async function main() {
  await reset();

  /* ---------------- Livreurs ---------------- */
  const driverRows = await db
    .insert(schema.drivers)
    .values([
      {
        name: "Moussa Diarra",
        email: "moussa@lbgexpresscolis.fr",
        phone: "+33 6 12 45 78 90",
        code: "LBG001",
        vehicle: "Fourgon 12 m³",
        city: "Paris",
        createdAt: ago(120),
      },
      {
        name: "Sophie Renard",
        email: "sophie@lbgexpresscolis.fr",
        phone: "+33 6 88 21 34 07",
        code: "LBG002",
        vehicle: "Utilitaire 6 m³",
        city: "Lyon",
        createdAt: ago(90),
      },
    ])
    .returning();

  const moussa = driverRows[0]!;
  const sophie = driverRows[1]!;

  /* ---------------- Devis + colis + timeline ---------------- */
  type Seed = {
    trackingNumber: string;
    kind: "colis" | "palette" | "demenagement" | "international";
    zone: "idf" | "france" | "corse" | "europe" | "maghreb" | "afrique" | "monde";
    service: "economique" | "standard" | "express" | "premium";
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    company?: string;
    from: string;
    to: string;
    weightKg: number;
    volumeM3?: number;
    status: string;
    quoteStatus: string;
    createdDaysAgo: number;
    events: { status: string; fr: string; en: string; location: string; hoursAgo: number }[];
    driverId?: number;
    jobStatus?: string;
    gps?: { lat: number; lng: number; hoursAgo: number }[];
    payment?: { provider: string; status: string };
  };

  const seeds: Seed[] = [
    {
      trackingNumber: "TRK-20260824-DEMO01",
      kind: "colis",
      zone: "france",
      service: "express",
      customerName: "Claire Fontaine",
      customerEmail: "claire.fontaine@example.com",
      customerPhone: "+33 6 45 12 88 03",
      from: "18 rue de la République, 69002 Lyon",
      to: "42 avenue Jean Jaurès, 75019 Paris",
      weightKg: 8.5,
      status: "en_livraison",
      quoteStatus: "paye",
      createdDaysAgo: 4,
      driverId: moussa.id,
      jobStatus: "en_livraison",
      payment: { provider: "carte", status: "confirme" },
      events: [
        { status: "cree", fr: "Devis enregistré — expédition créée", en: "Quote saved — shipment created", location: "Lyon", hoursAgo: 96 },
        { status: "pris_en_charge", fr: "Paiement confirmé — expédition planifiée", en: "Payment confirmed — shipment scheduled", location: "Lyon", hoursAgo: 92 },
        { status: "pris_en_charge", fr: "Colis pris en charge", en: "Parcel picked up", location: "Agence Lyon Gerland", hoursAgo: 70 },
        { status: "en_transit", fr: "En transit — départ hub Lyon", en: "In transit — departed Lyon hub", location: "Hub Lyon", hoursAgo: 52 },
        { status: "en_transit", fr: "En transit — arrivée hub Paris Nord", en: "In transit — arrived Paris Nord hub", location: "Hub Paris Nord", hoursAgo: 16 },
        { status: "en_livraison", fr: "En cours de livraison — livreur en tournée", en: "Out for delivery — driver on route", location: "Paris 19e", hoursAgo: 2 },
      ],
      gps: [
        { lat: 48.8566, lng: 2.3522, hoursAgo: 2 },
        { lat: 48.8721, lng: 2.3733, hoursAgo: 1.2 },
        { lat: 48.8829, lng: 2.3812, hoursAgo: 0.4 },
      ],
    },
    {
      trackingNumber: "TRK-20260820-DEMO02",
      kind: "international",
      zone: "afrique",
      service: "standard",
      customerName: "Ibrahim Toure",
      customerEmail: "ibrahim.toure@example.com",
      customerPhone: "+33 7 55 09 21 44",
      company: "Toure Import Export",
      from: "9 boulevard Voltaire, 93100 Montreuil",
      to: "Quartier Zongo, Cotonou, Bénin",
      weightKg: 46,
      volumeM3: 0.9,
      status: "en_transit",
      quoteStatus: "paye",
      createdDaysAgo: 8,
      payment: { provider: "virement", status: "en_attente" },
      events: [
        { status: "cree", fr: "Devis enregistré — expédition créée", en: "Quote saved — shipment created", location: "Montreuil", hoursAgo: 192 },
        { status: "pris_en_charge", fr: "Colis pris en charge — enlèvement à domicile", en: "Parcel picked up — home pickup", location: "Montreuil", hoursAgo: 170 },
        { status: "en_transit", fr: "En transit — dossier douane validé", en: "In transit — customs file cleared", location: "Roissy CDG", hoursAgo: 120 },
        { status: "en_transit", fr: "En transit — vol vers Cotonou", en: "In transit — flight to Cotonou", location: "Roissy CDG", hoursAgo: 40 },
      ],
    },
    {
      trackingNumber: "TRK-20260812-DEMO03",
      kind: "colis",
      zone: "idf",
      service: "standard",
      customerName: "Léa Marchand",
      customerEmail: "lea.marchand@example.com",
      customerPhone: "+33 6 74 33 90 12",
      from: "5 rue Oberkampf, 75011 Paris",
      to: "27 rue du Général Leclerc, 92130 Issy-les-Moulineaux",
      weightKg: 3.2,
      status: "livre",
      quoteStatus: "livre",
      createdDaysAgo: 16,
      driverId: sophie.id,
      jobStatus: "livre",
      payment: { provider: "carte", status: "confirme" },
      events: [
        { status: "cree", fr: "Devis enregistré — expédition créée", en: "Quote saved — shipment created", location: "Paris 11e", hoursAgo: 384 },
        { status: "pris_en_charge", fr: "Colis pris en charge", en: "Parcel picked up", location: "Paris 11e", hoursAgo: 370 },
        { status: "en_livraison", fr: "En cours de livraison", en: "Out for delivery", location: "Issy-les-Moulineaux", hoursAgo: 360 },
        { status: "livre", fr: "Livré — remis à Mme Marchand", en: "Delivered — handed to Mrs Marchand", location: "Issy-les-Moulineaux", hoursAgo: 356 },
      ],
    },
    {
      trackingNumber: "TRK-20260826-DEMO04",
      kind: "demenagement",
      zone: "france",
      service: "premium",
      customerName: "Famille Bernard",
      customerEmail: "bernard.famille@example.com",
      customerPhone: "+33 6 21 87 45 66",
      from: "14 rue des Lilas, 33000 Bordeaux",
      to: "8 chemin des Vignes, 31000 Toulouse",
      weightKg: 1800,
      volumeM3: 32,
      status: "pris_en_charge",
      quoteStatus: "accepte",
      createdDaysAgo: 2,
      driverId: moussa.id,
      jobStatus: "a_recuperer",
      events: [
        { status: "cree", fr: "Devis déménagement enregistré", en: "Moving quote saved", location: "Bordeaux", hoursAgo: 48 },
        { status: "pris_en_charge", fr: "Devis accepté — équipe et camion réservés", en: "Quote accepted — crew and truck booked", location: "Bordeaux", hoursAgo: 20 },
      ],
    },
  ];

  for (const s of seeds) {
    const price = computePrice({
      kind: s.kind,
      zone: s.zone,
      service: s.service,
      weightKg: s.weightKg,
      volumeM3: s.volumeM3,
      homePickup: s.kind !== "colis",
      insurance: s.kind === "international",
      declaredValue: s.kind === "international" ? 1200 : undefined,
    });
    const ref = generateRef(s.kind === "demenagement" ? "DEM" : "DEV");

    const [quote] = await db
      .insert(schema.quotes)
      .values({
        ref,
        kind: s.kind,
        service: s.service,
        zone: s.zone,
        customerName: s.customerName,
        customerEmail: s.customerEmail,
        customerPhone: s.customerPhone,
        company: s.company,
        fromAddress: s.from,
        toAddress: s.to,
        weightKg: s.weightKg,
        volumeM3: price.volumeM3,
        priceCents: Math.round(price.total * 100),
        breakdown: JSON.stringify(price.breakdown),
        etaMin: price.etaDays[0],
        etaMax: price.etaDays[1],
        status: s.quoteStatus,
        trackingNumber: s.trackingNumber,
        createdAt: ago(s.createdDaysAgo),
      })
      .returning();

    await db.insert(schema.trackings).values({
      trackingNumber: s.trackingNumber,
      quoteId: quote!.id,
      recipientName: s.customerName,
      origin: s.from,
      destination: s.to,
      status: s.status,
      service: s.service,
      weightKg: s.weightKg,
      eta: new Date(ago(s.createdDaysAgo).getTime() + price.etaDays[1] * day),
      driverId: s.driverId,
      source: "site",
      createdAt: ago(s.createdDaysAgo),
      updatedAt: hoursAgo(s.events[s.events.length - 1]!.hoursAgo),
    });

    await db.insert(schema.trackingEvents).values(
      s.events.map((e) => ({
        trackingNumber: s.trackingNumber,
        status: e.status,
        labelFr: e.fr,
        labelEn: e.en,
        location: e.location,
        occurredAt: hoursAgo(e.hoursAgo),
      })),
    );

    if (s.gps) {
      await db.insert(schema.trackingLocations).values(
        s.gps.map((g) => ({
          trackingNumber: s.trackingNumber,
          driverId: s.driverId,
          lat: g.lat,
          lng: g.lng,
          accuracy: 12,
          createdAt: hoursAgo(g.hoursAgo),
        })),
      );
    }

    if (s.driverId && s.jobStatus) {
      await db.insert(schema.driverJobs).values({
        driverId: s.driverId,
        trackingNumber: s.trackingNumber,
        pickupAddress: s.from,
        dropAddress: s.to,
        recipientName: s.customerName,
        recipientPhone: s.customerPhone,
        scheduledAt: hoursAgo(6),
        status: s.jobStatus,
        payoutCents: Math.round(price.total * 100 * 0.55),
        createdAt: ago(s.createdDaysAgo),
      });
    }

    if (s.payment) {
      await db.insert(schema.payments).values({
        quoteRef: ref,
        provider: s.payment.provider,
        amountCents: Math.round(price.total * 100),
        status: s.payment.status,
        reference: generateRef("PAY"),
        payerEmail: s.customerEmail,
        createdAt: ago(Math.max(0, s.createdDaysAgo - 1)),
      });
    }
  }

  /* ---------------- Devis récents sans suivi (pipeline) ---------------- */
  for (let i = 0; i < 6; i++) {
    const price = computePrice({ kind: "colis", zone: "europe", service: "standard", weightKg: 5 + i * 3 });
    await db.insert(schema.quotes).values({
      ref: generateRef("DEV"),
      kind: "colis",
      service: "standard",
      zone: "europe",
      customerName: ["Nicolas Petit", "Amina Cherif", "Marc Olivier", "Julie Nguyen", "Karim Belkacem", "Elena Rossi"][i]!,
      customerEmail: `client${i + 1}@example.com`,
      customerPhone: "+33 6 00 00 00 0" + i,
      fromAddress: "12 rue de Paris, 75001 Paris",
      toAddress: ["Bruxelles, Belgique", "Madrid, Espagne", "Milan, Italie", "Berlin, Allemagne", "Lisbonne, Portugal", "Amsterdam, Pays-Bas"][i]!,
      weightKg: 5 + i * 3,
      priceCents: Math.round(price.total * 100),
      breakdown: JSON.stringify(price.breakdown),
      etaMin: price.etaDays[0],
      etaMax: price.etaDays[1],
      status: "nouveau",
      createdAt: ago(i),
    });
  }

  /* ---------------- Messages & candidatures ---------------- */
  await db.insert(schema.contacts).values([
    {
      name: "Paul Girard",
      email: "paul.girard@example.com",
      phone: "+33 6 33 21 09 87",
      subject: "Envoi de 3 palettes vers l'Espagne",
      message: "Bonjour, je dois expédier 3 palettes de 250 kg vers Valence chaque mois. Avez-vous un tarif contractuel ?",
      createdAt: ago(1),
    },
    {
      name: "Aïcha Diallo",
      email: "aicha.diallo@example.com",
      subject: "Délai pour Dakar",
      message: "Quel est le délai actuel en aérien pour un colis de 20 kg vers Dakar ?",
      createdAt: ago(3),
    },
  ]);

  await db.insert(schema.carrierApplications).values([
    {
      name: "Transports Vidal",
      email: "contact@transports-vidal.example",
      phone: "+33 6 71 44 02 19",
      city: "Marseille",
      vehicle: "Porteur 20 m³",
      capacityM3: 20,
      siret: "84512300100025",
      message: "Disponible sur l'axe Marseille-Lyon-Paris, 4 tournées par semaine.",
      createdAt: ago(2),
    },
  ]);

  /* ---------------- Clé API et webhook de démo ---------------- */
  await db.insert(schema.apiKeys).values({
    label: "Boutique Shopify (démo)",
    key: "lbg_live_demo0000000000000000000000",
    lastUsedAt: hoursAgo(5),
    createdAt: ago(20),
  });
  await db.insert(schema.webhooks).values({
    url: "https://boutique.example.com/webhooks/lbg",
    secret: "whsec_demo_0000000000",
    events: "tracking.updated,tracking.created",
    lastStatus: "200",
    createdAt: ago(20),
  });

  console.log("Seed terminé.");
  console.log("Suivis de démo :", seeds.map((s) => s.trackingNumber).join(", "));
  console.log("Livreurs : moussa@lbgexpresscolis.fr / LBG001 — sophie@lbgexpresscolis.fr / LBG002");
  console.log("Code pro :", process.env.PRO_ACCESS_CODE ?? "LBG-PRO-2026");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
