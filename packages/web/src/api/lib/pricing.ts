/**
 * Tarification LBG Express Colis — moteur réel (Matrice logistique V2.0, grilles marché 2026).
 * Source unique de vérité : calculateur public (quotes.estimate), devis (quotes.create)
 * et facturation (invoices.checkout).
 *
 * Formule appliquée :
 *   HT = [ base zone + poids taxable + volume/palette ] × coef typologie
 *        + surcharge carburant (%)
 *        + accès (étages sans ascenseur, monte-meuble)
 *        + options (assurance ad valorem, cartons, express)
 *   TTC = HT × 1,20
 *
 * Poids taxable = max(poids réel, L×l×h / 5000).
 * Les variables (carburant, assurance, pénalités, TVA) sont surchargeables depuis
 * le back-office via la table site_settings (voir lib/settings.ts).
 */

export type ZoneId = "idf" | "france" | "corse" | "europe" | "maghreb" | "afrique" | "monde";
export type ServiceId = "economique" | "standard" | "express" | "premium";
export type ShipmentKind = "colis" | "palette" | "demenagement" | "international";

export interface ZoneRate {
  label: { fr: string; en: string };
  /** Forfait de base HT jusqu'à 5 kg taxables */
  base: number;
  /** € HT par kg taxable de 5 à 30 kg */
  perKg: number;
  /** € HT par kg taxable au-delà de 30 kg */
  perKgHeavy: number;
  /** Palette Europe 80x120 : prix HT court rayon (<50 km) / longue distance (>300 km) */
  pallet: [number, number];
  /** Déménagement € HT/m³ : [Éco, Standard, Confort] court rayon */
  m3Short: [number, number, number];
  /** Déménagement € HT/m³ : [Éco, Standard, Confort] longue distance */
  m3Long: [number, number, number];
  /** Rayon court par défaut pour la zone (utilisé quand la distance n'est pas saisie) */
  shortHaul: boolean;
  days: [number, number];
  /** Compatibilité affichage : € HT/m³ indicatif (formule Standard) */
  perM3: number;
}

/** Grille A + Grille B de la matrice V2.0. Corse/DOM et Monde sont des extensions
 *  indexées sur France (×1,6) et Afrique (×1,15), faute de ligne dédiée au document. */
export const ZONES: Record<ZoneId, ZoneRate> = {
  idf: {
    label: { fr: "Paris / Île-de-France", en: "Paris / Greater Paris" },
    base: 14.5,
    perKg: 0.85,
    perKgHeavy: 1.2,
    pallet: [65, 65],
    m3Short: [40, 65, 90],
    m3Long: [40, 65, 90],
    shortHaul: true,
    days: [1, 1],
    perM3: 65,
  },
  france: {
    label: { fr: "France métropolitaine", en: "Mainland France" },
    base: 16.9,
    perKg: 1.1,
    perKgHeavy: 1.95,
    pallet: [65, 210],
    m3Short: [40, 65, 90],
    m3Long: [75, 125, 165],
    shortHaul: false,
    days: [1, 3],
    perM3: 125,
  },
  corse: {
    label: { fr: "Corse / DOM-TOM", en: "Corsica / French overseas" },
    base: 27.0,
    perKg: 1.75,
    perKgHeavy: 3.1,
    pallet: [120, 320],
    m3Short: [64, 104, 144],
    m3Long: [120, 200, 264],
    shortHaul: false,
    days: [3, 8],
    perM3: 200,
  },
  europe: {
    label: { fr: "Europe (routier)", en: "Europe (road)" },
    base: 24.0,
    perKg: 2.1,
    perKgHeavy: 3.4,
    pallet: [90, 240],
    m3Short: [75, 125, 165],
    m3Long: [95, 150, 195],
    shortHaul: false,
    days: [2, 5],
    perM3: 150,
  },
  maghreb: {
    label: { fr: "Maghreb (maritime / route)", en: "Maghreb (sea / road)" },
    base: 32.0,
    perKg: 3.5,
    perKgHeavy: 4.8,
    pallet: [140, 320],
    m3Short: [110, 165, 215],
    m3Long: [130, 190, 245],
    shortHaul: false,
    days: [4, 9],
    perM3: 190,
  },
  afrique: {
    label: { fr: "Afrique subsaharienne (aérien)", en: "Sub-Saharan Africa (air)" },
    base: 65.0,
    perKg: 7.5,
    perKgHeavy: 9.0,
    pallet: [260, 520],
    m3Short: [180, 250, 320],
    m3Long: [210, 290, 370],
    shortHaul: false,
    days: [5, 12],
    perM3: 290,
  },
  monde: {
    label: { fr: "Reste du monde", en: "Rest of the world" },
    base: 74.75,
    perKg: 8.65,
    perKgHeavy: 10.35,
    pallet: [300, 600],
    m3Short: [205, 290, 370],
    m3Long: [240, 335, 425],
    shortHaul: false,
    days: [5, 14],
    perM3: 335,
  },
};

/** Formules de service. Déménagement : Éco = transport seul, Standard = + manutention,
 *  Confort = emballage complet (Express/Premium ⇒ Confort). */
export const SERVICES: Record<ServiceId, { label: { fr: string; en: string }; coef: number; m3Tier: 0 | 1 | 2; daysFactor: number }> = {
  economique: { label: { fr: "Économique", en: "Economy" }, coef: 0.9, m3Tier: 0, daysFactor: 1.6 },
  standard: { label: { fr: "Standard", en: "Standard" }, coef: 1, m3Tier: 1, daysFactor: 1 },
  express: { label: { fr: "Express 24-48h", en: "Express 24-48h" }, coef: 1, m3Tier: 2, daysFactor: 0.6 },
  premium: { label: { fr: "Premium sur-mesure", en: "Premium bespoke" }, coef: 1.2, m3Tier: 2, daysFactor: 0.45 },
};

/** Coefficient de typologie de charge (manutention et matériel embarqué). */
export const KIND_COEF: Record<ShipmentKind, number> = {
  colis: 1,
  palette: 1,
  demenagement: 1,
  international: 1,
};

/** Variables d'ajustement pilotables depuis /admin → Contenu & réglages. */
export interface PricingConfig {
  /** Surcharge carburant en % appliquée au transport brut HT */
  fuelSurchargePercent: number;
  /** TVA en % (SAS : 20) */
  vatRate: number;
  /** Diviseur du poids volumétrique (standard marché : 5000) */
  volumetricDivisor: number;
  /** Assurance ad valorem : % de la valeur déclarée */
  insuranceRatePercent: number;
  /** Minimum de perception HT de l'assurance */
  insuranceMinHt: number;
  /** Carton standard fourni : € HT / unité */
  cartonUnitHt: number;
  /** Étages gratuits sans ascenseur */
  freeFloorsNoLift: number;
  /** Pénalité HT par étage supplémentaire et par tranche de 10 m³ */
  floorPenaltyHt: number;
  /** Monte-meuble extérieur : forfait fixe HT */
  furnitureHoistHt: number;
  /** Express : forfait HT en Île-de-France */
  expressFlatIdfHt: number;
  /** Express : majoration en % du transport pour le national/international */
  expressPercent: number;
  /** Minimum de facturation HT */
  minimumHt: number;
}

export const DEFAULT_PRICING: PricingConfig = {
  fuelSurchargePercent: 14.2,
  vatRate: 20,
  volumetricDivisor: 5000,
  insuranceRatePercent: 0.7,
  insuranceMinHt: 8,
  cartonUnitHt: 4.5,
  freeFloorsNoLift: 2,
  floorPenaltyHt: 15,
  furnitureHoistHt: 180,
  expressFlatIdfHt: 35,
  expressPercent: 30,
  minimumHt: 14.5,
};

export interface PriceInput {
  kind: ShipmentKind;
  zone: ZoneId;
  service: ServiceId;
  weightKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  volumeM3?: number;
  /** Distance réelle en km : <50 = court rayon, >300 = longue distance */
  distanceKm?: number;
  declaredValue?: number;
  insurance?: boolean;
  homePickup?: boolean;
  packing?: boolean;
  /** Nombre de cartons fournis (sinon estimé depuis le volume quand packing = true) */
  cartons?: number;
  fragile?: boolean;
  floors?: number;
  elevator?: boolean;
  /** Passage par fenêtre / balcon : monte-meuble extérieur obligatoire */
  hoist?: boolean;
  pieces?: number;
}

export interface PriceResult {
  /** Total HT (la TVA est ajoutée à la facturation) */
  total: number;
  totalHt: number;
  vatAmount: number;
  totalTtc: number;
  vatRate: number;
  currency: "EUR";
  breakdown: { key: string; label: { fr: string; en: string }; amount: number }[];
  chargeableWeight: number;
  realWeight: number;
  volumetricWeight: number;
  volumeM3: number;
  etaDays: [number, number];
  /** Vrai quand un monte-meuble est requis : le tarif standard ne s'applique plus seul */
  hoistRequired: boolean;
  fuelSurchargePercent: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function computePrice(input: PriceInput, cfg: PricingConfig = DEFAULT_PRICING): PriceResult {
  const zone = ZONES[input.zone] ?? ZONES.france;
  const service = SERVICES[input.service] ?? SERVICES.standard;

  const dims = {
    l: Math.max(0, input.lengthCm ?? 0),
    w: Math.max(0, input.widthCm ?? 0),
    h: Math.max(0, input.heightCm ?? 0),
  };
  const volumeFromDims = (dims.l * dims.w * dims.h) / 1_000_000;
  const volumeM3 = round2(Math.max(input.volumeM3 ?? 0, volumeFromDims));
  const realWeight = round2(Math.max(0, input.weightKg ?? 0));
  const divisor = cfg.volumetricDivisor > 0 ? cfg.volumetricDivisor : 5000;
  const volumetricWeight = round2((dims.l * dims.w * dims.h) / divisor);
  const pieces = Math.max(1, Math.round(input.pieces ?? 1));
  const chargeableWeight = round2(Math.max(realWeight, volumetricWeight, 0.5));

  // Rayon : court (<50 km) ou longue distance (>300 km, valeur par défaut hors IDF)
  const shortHaul =
    input.distanceKm !== undefined && input.distanceKm > 0 ? input.distanceKm < 50 : zone.shortHaul;

  const breakdown: PriceResult["breakdown"] = [];
  const push = (key: string, fr: string, en: string, amount: number) => {
    if (Math.abs(amount) > 0.001) breakdown.push({ key, label: { fr, en }, amount: round2(amount) });
  };

  /* ---------- 1. Transport brut HT ---------- */
  let transport = 0;

  if (input.kind === "demenagement") {
    const tier = service.m3Tier;
    const perM3 = (shortHaul ? zone.m3Short : zone.m3Long)[tier];
    const billedVolume = Math.max(volumeM3, 1);
    transport = billedVolume * perM3;
    const formula = ["Éco (transport seul)", "Standard (+ manutention)", "Confort (emballage complet)"][tier];
    const formulaEn = ["Eco (transport only)", "Standard (+ handling)", "Comfort (full packing)"][tier];
    push(
      "volume",
      `Déménagement ${formula} — ${billedVolume} m³ × ${perM3} € HT/m³ (${shortHaul ? "court rayon" : "longue distance"})`,
      `Moving ${formulaEn} — ${billedVolume} m³ × €${perM3} excl. VAT/m³ (${shortHaul ? "short haul" : "long distance"})`,
      transport,
    );
  } else if (input.kind === "palette") {
    const unit = shortHaul ? zone.pallet[0] : zone.pallet[1];
    transport = unit * pieces;
    push(
      "pallet",
      `${pieces} palette(s) Europe × ${unit} € HT (${shortHaul ? "court rayon" : "longue distance"})`,
      `${pieces} Euro pallet(s) × €${unit} excl. VAT (${shortHaul ? "short haul" : "long distance"})`,
      transport,
    );
  } else {
    // Colis / international : forfait ≤ 5 kg puis tranches 5-30 kg et > 30 kg
    const basePerParcel = zone.base;
    transport = basePerParcel * pieces;
    push(
      "base",
      pieces > 1
        ? `Forfait de base ${zone.label.fr} — ${pieces} envois × ${basePerParcel} € HT (≤ 5 kg)`
        : `Forfait de base ${zone.label.fr} (≤ 5 kg taxables)`,
      pieces > 1
        ? `Base rate ${zone.label.en} — ${pieces} shipments × €${basePerParcel} excl. VAT (≤ 5 kg)`
        : `Base rate ${zone.label.en} (≤ 5 chargeable kg)`,
      transport,
    );

    const midKg = Math.max(0, Math.min(chargeableWeight, 30) - 5);
    if (midKg > 0) {
      const c = midKg * zone.perKg;
      transport += c;
      push(
        "weight_mid",
        `Poids taxable 5 → ${Math.min(chargeableWeight, 30)} kg (${round2(midKg)} kg × ${zone.perKg} €)`,
        `Chargeable weight 5 → ${Math.min(chargeableWeight, 30)} kg (${round2(midKg)} kg × €${zone.perKg})`,
        c,
      );
    }
    const heavyKg = Math.max(0, chargeableWeight - 30);
    if (heavyKg > 0) {
      const c = heavyKg * zone.perKgHeavy;
      transport += c;
      push(
        "weight_heavy",
        `Poids taxable > 30 kg (${round2(heavyKg)} kg × ${zone.perKgHeavy} €)`,
        `Chargeable weight > 30 kg (${round2(heavyKg)} kg × €${zone.perKgHeavy})`,
        c,
      );
    }
  }

  const kindCoef = KIND_COEF[input.kind] ?? 1;
  if (kindCoef !== 1) {
    const c = transport * (kindCoef - 1);
    transport += c;
    push("kind", "Typologie de charge", "Load type", c);
  }

  if (service.coef !== 1) {
    const c = transport * (service.coef - 1);
    transport += c;
    push(
      "service",
      `Formule ${service.label.fr}`,
      `${service.label.en} service`,
      c,
    );
  }

  /* ---------- 2. Surcharge carburant sur le transport brut ---------- */
  const fuel = transport * (cfg.fuelSurchargePercent / 100);
  push(
    "fuel",
    `Surcharge carburant (${cfg.fuelSurchargePercent} %)`,
    `Fuel surcharge (${cfg.fuelSurchargePercent}%)`,
    fuel,
  );

  /* ---------- 3. Urgence ---------- */
  let express = 0;
  if (input.service === "express" || input.service === "premium") {
    express =
      input.zone === "idf" ? cfg.expressFlatIdfHt : transport * (cfg.expressPercent / 100);
    push(
      "express",
      input.zone === "idf"
        ? `Surcharge express (créneau garanti) — forfait ${cfg.expressFlatIdfHt} € HT`
        : `Surcharge express (+${cfg.expressPercent} % du transport)`,
      input.zone === "idf"
        ? `Express surcharge — €${cfg.expressFlatIdfHt} excl. VAT`
        : `Express surcharge (+${cfg.expressPercent}% of transport)`,
      express,
    );
  }

  /* ---------- 4. Accès & manutention ---------- */
  let access = 0;
  const floors = Math.max(0, Math.round(input.floors ?? 0));
  if (!input.elevator && floors > cfg.freeFloorsNoLift) {
    const extraFloors = floors - cfg.freeFloorsNoLift;
    const blocks = Math.max(1, Math.ceil(Math.max(volumeM3, 0) / 10));
    const c = extraFloors * cfg.floorPenaltyHt * blocks;
    access += c;
    push(
      "floors",
      `Portage sans ascenseur — ${extraFloors} étage(s) au-delà du ${cfg.freeFloorsNoLift}e × ${blocks} tranche(s) de 10 m³`,
      `Carry without lift — ${extraFloors} floor(s) above floor ${cfg.freeFloorsNoLift} × ${blocks} block(s) of 10 m³`,
      c,
    );
  }
  const hoistRequired = Boolean(input.hoist);
  if (hoistRequired) {
    access += cfg.furnitureHoistHt;
    push(
      "hoist",
      `Monte-meuble extérieur (passage fenêtre / balcon) — forfait ${cfg.furnitureHoistHt} € HT`,
      `External furniture hoist (window / balcony access) — €${cfg.furnitureHoistHt} excl. VAT`,
      cfg.furnitureHoistHt,
    );
  }

  /* ---------- 5. Options ---------- */
  let options = 0;
  if (input.homePickup) {
    const c = input.kind === "demenagement" ? 0 : input.zone === "idf" ? 12.5 : 19.5;
    if (c > 0) {
      options += c;
      push("pickup", "Enlèvement à domicile sur rendez-vous", "Home pickup by appointment", c);
    }
  }
  if (input.packing) {
    const cartons =
      input.cartons && input.cartons > 0
        ? Math.round(input.cartons)
        : Math.max(5, Math.ceil(Math.max(volumeM3, 0.5) * 6));
    const c = cartons * cfg.cartonUnitHt;
    options += c;
    push(
      "packing",
      `Fourniture emballage — ${cartons} carton(s) × ${cfg.cartonUnitHt} € HT`,
      `Packing supplies — ${cartons} box(es) × €${cfg.cartonUnitHt} excl. VAT`,
      c,
    );
  }
  if (input.fragile) {
    const c = Math.max(9.5, transport * 0.05);
    options += c;
    push("fragile", "Calage et protection renforcée (fragile)", "Reinforced fragile protection", c);
  }
  if (input.insurance) {
    const value = Math.max(0, input.declaredValue ?? 0);
    const c = Math.max(cfg.insuranceMinHt, value * (cfg.insuranceRatePercent / 100));
    options += c;
    push(
      "insurance",
      `Assurance ad valorem (${cfg.insuranceRatePercent} % de ${round2(value)} €, min. ${cfg.insuranceMinHt} €)`,
      `Ad valorem insurance (${cfg.insuranceRatePercent}% of €${round2(value)}, min €${cfg.insuranceMinHt})`,
      c,
    );
  }

  /* ---------- 6. Totaux ---------- */
  let totalHt = transport + fuel + express + access + options;
  if (totalHt < cfg.minimumHt) {
    const c = cfg.minimumHt - totalHt;
    push("minimum", `Minimum de facturation (${cfg.minimumHt} € HT)`, `Minimum charge (€${cfg.minimumHt} excl. VAT)`, c);
    totalHt = cfg.minimumHt;
  }
  totalHt = round2(totalHt);
  const vatAmount = round2(totalHt * (cfg.vatRate / 100));
  const totalTtc = round2(totalHt + vatAmount);

  const etaDays: [number, number] = [
    Math.max(1, Math.round(zone.days[0] * service.daysFactor)),
    Math.max(1, Math.round(zone.days[1] * service.daysFactor)),
  ];

  return {
    total: totalHt,
    totalHt,
    vatAmount,
    totalTtc,
    vatRate: cfg.vatRate,
    currency: "EUR",
    breakdown,
    chargeableWeight,
    realWeight,
    volumetricWeight,
    volumeM3,
    etaDays,
    hoistRequired,
    fuelSurchargePercent: cfg.fuelSurchargePercent,
  };
}

/** TRK-YYYYMMDD-XXXXXX */
export function generateTrackingNumber(date = new Date()): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `TRK-${y}${m}${d}-${suffix}`;
}

export function generateRef(prefix = "DEV"): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${prefix}-${s}`;
}
