/**
 * Calculateur « tarif stratégique » — offres Covoiturage de colis / Fret international /
 * Déménagement. Moteur volontairement séparé de `api/lib/pricing.ts` (grille zones/services
 * historique, toujours utilisée par /devis général, /tarifs et l'espace pro).
 *
 * Deux règles structurantes :
 *  1. tout prix affiché se termine par X,99 € (`appliquerTarifStrategique`) ;
 *  2. le covoiturage ne descend jamais sous 8,99 € ; il n'y a plus de limite de kilos,
 *     le poids au-delà de 10 kg est facturé au kilo supplémentaire jusqu'à 100 kg
 *     (au-delà de 100 kg : devis sur mesure, traité en fret).
 *
 * Les montants sortent TTC : le prix affiché est le prix payé.
 */

export const TARIF = {
  covoiturage: {
    /** Frais fixes de prise en charge, en €. */
    fraisFixes: 3.0,
    /** Prix au kilomètre, en €. */
    prixKm: 0.035,
    /** Prix minimum affiché — sert aussi d'accroche « dès 8,99 € ». */
    prixMinimum: 8.99,
    /** Poids au-delà duquel chaque kilo est facturé en supplément. */
    seuilKg: 10,
    /** Supplément, en € par kilo au-delà du seuil. */
    supplementParKg: 0.45,
    /** Limite haute du formulaire : au-delà, devis sur mesure traité en fret. */
    maxKg: 100,
  },
  international: {
    /** Aérien cargo / GP : prix au kilo, dédouanement inclus à l'agence locale. */
    avionParKg: 9.5,
    /** Maritime groupage : forfait par carton standard (≈ 60 × 40 × 40 cm). */
    maritimeParCarton: 46.0,
  },
  demenagement: {
    /** Manutention, en € par m³. */
    manutentionParM3: 15,
    /** Transport, en € par km. */
    transportParKm: 1.2,
    /** Supplément par étage sans ascenseur, en € par étage et par m³. */
    etageSansAscenseurParM3: 1.5,
    /** Supplément portage long (> 30 m) ou stationnement contraint, en €. */
    accesDifficile: 45,
  },
} as const;

/** Poids au-delà duquel le covoiturage facture un supplément au kilo. */
export const COVOITURAGE_SEUIL_KG = TARIF.covoiturage.seuilKg;
/** Supplément covoiturage, en € par kilo au-delà du seuil. */
export const COVOITURAGE_SUPPLEMENT_PAR_KG = TARIF.covoiturage.supplementParKg;
/** Poids au-delà duquel on bascule sur un devis sur mesure (fret). */
export const COVOITURAGE_MAX_KG = TARIF.covoiturage.maxKg;

/**
 * Facteur poids du covoiturage : < 1 kg = 1.0, 1–5 kg = 1.3, 5 kg et plus = 1.6.
 * Au-delà du seuil de 10 kg, le facteur reste à 1.6 et chaque kilo en plus est
 * facturé séparément (voir `supplementPoids`).
 */
export function facteurPoids(poidsKg: number): number {
  const p = poidsKg || 0;
  if (p >= 1 && p < 5) return 1.3;
  if (p >= 5) return 1.6;
  return 1.0;
}

/** Supplément en € pour les kilos au-delà du seuil covoiturage. */
export function supplementPoids(poidsKg: number): number {
  const excedent = Math.max(0, (poidsKg || 0) - TARIF.covoiturage.seuilKg);
  return excedent * TARIF.covoiturage.supplementParKg;
}

const centimes = (n: number) => Math.round(n * 100) / 100;

/**
 * Arrondi psychologique : le prix affiché est le X,99 € immédiatement au-dessus du brut
 * (46,00 € → 45,99 € ; 45,20 € → 45,99 € ; 95,00 € → 94,99 €).
 */
export function appliquerTarifStrategique(prixBrut: number): number {
  return centimes(Math.ceil(centimes(prixBrut)) - 0.01);
}

export type TypeService = "covoiturage" | "international" | "demenagement";
export type ModeTransport = "avion" | "maritime";

export type DevisOptions = {
  /** Distance routière estimée, en km (covoiturage, déménagement). */
  distance?: number;
  /** Poids en kg (covoiturage, aérien). */
  poids?: number;
  modeTransport?: ModeTransport;
  /** Nombre de cartons standards (maritime). */
  nombreCartons?: number;
  /** Volume en m³ (déménagement). */
  volumeM3?: number;
  /** Étages sans ascenseur cumulés départ + arrivée (déménagement). */
  etagesSansAscenseur?: number;
  /** Portage long ou stationnement contraint d'un côté au moins (déménagement). */
  accesDifficile?: boolean;
};

/** Prix TTC final, arrondi en X,99 €. */
export function calculateurDevis(typeService: TypeService, options: DevisOptions): number {
  return devisDetaille(typeService, options).total;
}

export type DevisLigne = { key: string; label: { fr: string; en: string }; amount: number };

export type DevisDetaille = {
  /** Prix TTC affiché, terminé par ,99 €. */
  total: number;
  /** Total avant arrondi psychologique. */
  brut: number;
  lines: DevisLigne[];
  etaDays: [number, number];
  /** Vrai quand le prix minimum a écrasé le calcul (petits trajets). */
  plancher: boolean;
  /** Vrai quand le montant doit être présenté comme une estimation à confirmer. */
  estimation: boolean;
};

/** Calcul complet, avec le détail ligne par ligne affiché dans le récapitulatif. */
export function devisDetaille(typeService: TypeService, options: DevisOptions): DevisDetaille {
  const lines: DevisLigne[] = [];
  let brut = 0;
  let etaDays: [number, number] = [1, 3];
  let plancher = false;
  let estimation = false;

  if (typeService === "covoiturage") {
    const c = TARIF.covoiturage;
    const km = options.distance || 0;
    const kilometrique = km * c.prixKm;
    const poids = options.poids || 0;
    const facteur = facteurPoids(poids);
    const supplement = supplementPoids(poids);
    brut = (kilometrique + c.fraisFixes) * facteur + supplement;
    lines.push(
      {
        key: "prise-en-charge",
        label: { fr: "Prise en charge", en: "Handling fee" },
        amount: centimes(c.fraisFixes),
      },
      {
        key: "trajet",
        label: {
          fr: `Trajet mutualisé (${Math.round(km)} km)`,
          en: `Shared route (${Math.round(km)} km)`,
        },
        amount: centimes(kilometrique),
      },
    );
    if (facteur > 1) {
      lines.push({
        key: "poids",
        label: {
          fr: `Supplément poids (×${facteur.toFixed(2).replace(".", ",")})`,
          en: `Weight factor (×${facteur.toFixed(2)})`,
        },
        amount: centimes((kilometrique + c.fraisFixes) * (facteur - 1)),
      });
    }
    if (supplement > 0) {
      const excedent = centimes(poids - c.seuilKg);
      lines.push({
        key: "poids-excedent",
        label: {
          fr: `Poids au-delà de ${c.seuilKg} kg (${excedent.toString().replace(".", ",")} kg × ${c.supplementParKg.toFixed(2).replace(".", ",")} €)`,
          en: `Weight above ${c.seuilKg} kg (${excedent} kg × €${c.supplementParKg.toFixed(2)})`,
        },
        amount: centimes(supplement),
      });
    }
    etaDays = poids > c.seuilKg ? [1, 4] : [1, 3];
  }

  if (typeService === "international") {
    const i = TARIF.international;
    if (options.modeTransport === "maritime") {
      const cartons = Math.max(1, options.nombreCartons || 1);
      brut = cartons * i.maritimeParCarton;
      lines.push({
        key: "maritime",
        label: {
          fr: `Maritime groupage — ${cartons} carton${cartons > 1 ? "s" : ""} standard`,
          en: `Sea groupage — ${cartons} standard box${cartons > 1 ? "es" : ""}`,
        },
        amount: centimes(brut),
      });
      etaDays = [30, 45];
    } else {
      const poids = options.poids || 0;
      brut = poids * i.avionParKg;
      lines.push(
        {
          key: "avion",
          label: {
            fr: `Aérien cargo / GP — ${poids} kg × ${i.avionParKg.toFixed(2).replace(".", ",")} €`,
            en: `Air cargo / GP — ${poids} kg × €${i.avionParKg.toFixed(2)}`,
          },
          amount: centimes(brut),
        },
        {
          key: "douane",
          label: { fr: "Dédouanement à l'agence locale (inclus)", en: "Local clearance (included)" },
          amount: 0,
        },
      );
      etaDays = [5, 10];
    }
  }

  if (typeService === "demenagement") {
    const d = TARIF.demenagement;
    const vol = options.volumeM3 || 0;
    const km = options.distance || 0;
    const manutention = vol * d.manutentionParM3;
    const transport = km * d.transportParKm;
    const etages = Math.max(0, options.etagesSansAscenseur || 0);
    const portage = etages * vol * d.etageSansAscenseurParM3;
    const acces = options.accesDifficile ? d.accesDifficile : 0;
    brut = manutention + transport + portage + acces;
    lines.push(
      {
        key: "manutention",
        label: { fr: `Manutention (${vol} m³)`, en: `Handling (${vol} m³)` },
        amount: centimes(manutention),
      },
      {
        key: "transport",
        label: {
          fr: `Transport routier (${Math.round(km)} km)`,
          en: `Road transport (${Math.round(km)} km)`,
        },
        amount: centimes(transport),
      },
    );
    if (portage > 0) {
      lines.push({
        key: "portage",
        label: {
          fr: `Portage sans ascenseur (${etages} étage${etages > 1 ? "s" : ""})`,
          en: `Stair carry (${etages} floor${etages > 1 ? "s" : ""})`,
        },
        amount: centimes(portage),
      });
    }
    if (acces > 0) {
      lines.push({
        key: "acces",
        label: { fr: "Accès difficile / portage long", en: "Difficult access / long carry" },
        amount: centimes(acces),
      });
    }
    etaDays = [1, 5];
    estimation = true;
  }

  let total = appliquerTarifStrategique(brut);
  if (typeService === "covoiturage" && total < TARIF.covoiturage.prixMinimum) {
    total = TARIF.covoiturage.prixMinimum;
    plancher = true;
    lines.push({
      key: "plancher",
      label: { fr: "Tarif minimum petit trajet", en: "Short-run minimum fare" },
      amount: centimes(total - brut),
    });
  } else {
    const ajustement = centimes(total - brut);
    if (Math.abs(ajustement) >= 0.01) {
      lines.push({
        key: "arrondi",
        label: { fr: "Arrondi tarif LBG", en: "LBG price rounding" },
        amount: ajustement,
      });
    }
  }

  return { total, brut: centimes(brut), lines, etaDays, plancher, estimation };
}

const R = 6371; // rayon terrestre moyen, en km
/** Coefficient route / vol d'oiseau : la distance routière réelle est ~18 % plus longue. */
export const ROAD_FACTOR = 1.18;

/** Distance routière estimée entre deux points, en km (haversine × ROAD_FACTOR). */
export function distanceRoutiereKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(to.lat - from.lat);
  const dLng = rad(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(from.lat)) * Math.cos(rad(to.lat)) * Math.sin(dLng / 2) ** 2;
  const vol = 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
  return Math.round(vol * ROAD_FACTOR);
}

/** Gabarits du formulaire covoiturage — calés sur les paliers de poids. */
export const GABARITS = [
  {
    id: "petit",
    maxKg: 2,
    poidsDefaut: 1,
    label: { fr: "Petit", en: "Small" },
    exemple: { fr: "Enveloppe, chaussures, livres — jusqu'à 2 kg", en: "Envelope, shoes, books — up to 2 kg" },
  },
  {
    id: "moyen",
    maxKg: 5,
    poidsDefaut: 4,
    label: { fr: "Moyen", en: "Medium" },
    exemple: { fr: "Carton standard, petit électro — 2 à 5 kg", en: "Standard box, small appliance — 2 to 5 kg" },
  },
  {
    id: "grand",
    maxKg: 10,
    poidsDefaut: 8,
    label: { fr: "Grand", en: "Large" },
    exemple: { fr: "Valise, gros carton — 5 à 10 kg", en: "Suitcase, large box — 5 to 10 kg" },
  },
  {
    id: "hors-norme",
    maxKg: TARIF.covoiturage.maxKg,
    poidsDefaut: 25,
    label: { fr: "Hors norme", en: "Oversized" },
    exemple: {
      fr: "Électroménager, mobilier, palette légère — au-delà de 10 kg",
      en: "Appliance, furniture, light pallet — over 10 kg",
    },
  },
] as const;

export type GabaritId = (typeof GABARITS)[number]["id"];

/** Pays desservis par l'offre internationale (menu rapide du formulaire). */
export const PAYS_INTERNATIONAL = [
  { id: "benin", label: "Bénin", agence: "Cotonou", drapeau: "🇧🇯" },
  { id: "mali", label: "Mali", agence: "Bamako", drapeau: "🇲🇱" },
  { id: "togo", label: "Togo", agence: "Lomé", drapeau: "🇹🇬" },
] as const;

export type PaysId = (typeof PAYS_INTERNATIONAL)[number]["id"];

/** Volume indicatif par pièce, pour l'estimateur « par pièces » du déménagement. */
export const PIECES_VOLUME = [
  { id: "studio", label: { fr: "Studio (≈ 20 m²)", en: "Studio (≈ 20 m²)" }, m3: 12 },
  { id: "t2", label: { fr: "T2 (≈ 45 m²)", en: "1-bedroom (≈ 45 m²)" }, m3: 22 },
  { id: "t3", label: { fr: "T3 (≈ 65 m²)", en: "2-bedroom (≈ 65 m²)" }, m3: 32 },
  { id: "t4", label: { fr: "T4 (≈ 85 m²)", en: "3-bedroom (≈ 85 m²)" }, m3: 42 },
  { id: "maison", label: { fr: "Maison (≈ 110 m² et +)", en: "House (≈ 110 m² and up)" }, m3: 60 },
] as const;
