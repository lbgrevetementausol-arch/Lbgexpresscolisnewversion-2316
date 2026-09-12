/**
 * Lecture des réglages pilotables depuis le back-office (table site_settings).
 * Utilisé par le moteur tarifaire : la surcharge carburant, l'assurance, la TVA
 * et les pénalités d'accès sont modifiables sans redéploiement.
 */
import { eq } from "drizzle-orm";
import { db } from "../database";
import * as schema from "../database/schema";
import { DEFAULT_PRICING, type PricingConfig } from "./pricing";

/** Clés attendues dans site_settings (groupe "tarifs") */
export const PRICING_KEYS: Record<keyof PricingConfig, { key: string; label: string }> = {
  fuelSurchargePercent: { key: "fuel_surcharge_percent", label: "Surcharge carburant (%)" },
  vatRate: { key: "vat_rate", label: "TVA (%)" },
  volumetricDivisor: { key: "volumetric_divisor", label: "Diviseur poids volumétrique" },
  insuranceRatePercent: { key: "insurance_rate_percent", label: "Assurance ad valorem (% valeur déclarée)" },
  insuranceMinHt: { key: "insurance_min_ht", label: "Assurance — minimum de perception (€ HT)" },
  cartonUnitHt: { key: "carton_unit_ht", label: "Carton standard (€ HT / unité)" },
  freeFloorsNoLift: { key: "free_floors_no_lift", label: "Étages gratuits sans ascenseur" },
  floorPenaltyHt: { key: "floor_penalty_ht", label: "Pénalité par étage / 10 m³ (€ HT)" },
  furnitureHoistHt: { key: "furniture_hoist_ht", label: "Monte-meuble extérieur (€ HT)" },
  expressFlatIdfHt: { key: "express_flat_idf_ht", label: "Express Île-de-France (€ HT)" },
  expressPercent: { key: "express_percent", label: "Express national (% du transport)" },
  minimumHt: { key: "minimum_ht", label: "Minimum de facturation (€ HT)" },
};

const CACHE_MS = 30_000;
let cache: { at: number; config: PricingConfig } | null = null;

/**
 * Part de la rémunération reversée au livreur, en % du prix payé par le client.
 * Modifiable depuis le back-office (Contenu & tarifs) sans redéploiement.
 */
export const DRIVER_SHARE_KEY = "driver_share_percent";
export const DEFAULT_DRIVER_SHARE_PERCENT = 70;

/** Part livreur courante, en fraction (0.7 = 70 %). */
export async function getDriverShare(): Promise<number> {
  try {
    const [row] = await db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.key, DRIVER_SHARE_KEY))
      .limit(1);
    const parsed = Number(String(row?.value ?? "").replace(",", "."));
    if (Number.isFinite(parsed) && parsed > 0 && parsed <= 100) return parsed / 100;
  } catch {
    // base indisponible : on retombe sur la valeur par défaut
  }
  return DEFAULT_DRIVER_SHARE_PERCENT / 100;
}

/** Vide le cache après une sauvegarde de réglages. */
export function invalidatePricingConfig() {
  cache = null;
}

/** Configuration tarifaire courante : valeurs du back-office, défauts de la matrice sinon. */
export async function getPricingConfig(): Promise<PricingConfig> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.config;

  const config: PricingConfig = { ...DEFAULT_PRICING };
  try {
    const rows = await db.select().from(schema.siteSettings);
    const byKey = new Map(rows.map((r) => [r.key, r.value]));
    for (const [field, meta] of Object.entries(PRICING_KEYS) as [keyof PricingConfig, { key: string }][]) {
      const raw = byKey.get(meta.key);
      if (raw === undefined) continue;
      const parsed = Number(String(raw).replace(",", "."));
      if (Number.isFinite(parsed) && parsed >= 0) config[field] = parsed;
    }
  } catch {
    // base indisponible : on retombe sur la grille par défaut
  }

  cache = { at: Date.now(), config };
  return config;
}

/** Valeurs par défaut à insérer dans site_settings (seed / première ouverture de l'admin). */
export function defaultPricingSettings() {
  const rows = (Object.entries(PRICING_KEYS) as [keyof PricingConfig, { key: string; label: string }][]).map(
    ([field, meta]) => ({
      key: meta.key,
      value: String(DEFAULT_PRICING[field]),
      group: "tarifs",
      label: meta.label,
    }),
  );
  rows.push({
    key: DRIVER_SHARE_KEY,
    value: String(DEFAULT_DRIVER_SHARE_PERCENT),
    group: "tarifs",
    label: "Part livreur (% du prix payé par le client)",
  });
  return rows;
}
