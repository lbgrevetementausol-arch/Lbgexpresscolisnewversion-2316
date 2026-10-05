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
  /**
   * Grille déménagement — SEUL endroit à modifier pour changer les tarifs.
   * Montants TTC (particuliers), pourcentages appliqués au prix de base.
   */
  demenagement: {
    /** Prix de base en € TTC par m³, selon la distance (borne haute incluse, en km). */
    baseParM3: [
      { maxKm: 30, prix: 34 },
      { maxKm: 100, prix: 38 },
      { maxKm: 300, prix: 48 },
      { maxKm: 600, prix: 58 },
      { maxKm: Number.POSITIVE_INFINITY, prix: 66 },
    ],
    /** +5 % par étage sans ascenseur et par adresse, plafonné à +25 % au total. */
    etageSansAscenseurPct: 5,
    etagesPlafondPct: 25,
    /** Étage desservi par ascenseur : +2 % par adresse (fourchette 0–3 %). */
    ascenseurPct: 2,
    /** Accès difficile (portage > 30 m, rue piétonne, stationnement impossible). */
    accesDifficilePct: 10,
    /** Emballage / fourniture des cartons, en € TTC par m³. */
    emballageParM3: 12,
    /** Objets lourds : forfait en € TTC par objet. */
    objetsLourds: [
      { id: "piano-droit", label: { fr: "Piano droit", en: "Upright piano" }, prix: 150 },
      { id: "piano-queue", label: { fr: "Piano à queue", en: "Grand piano" }, prix: 350 },
      { id: "coffre-fort", label: { fr: "Coffre-fort", en: "Safe" }, prix: 120 },
      { id: "frigo-americain", label: { fr: "Réfrigérateur américain", en: "American fridge" }, prix: 60 },
      { id: "meuble-massif", label: { fr: "Meuble massif (> 100 kg)", en: "Heavy furniture (> 100 kg)" }, prix: 60 },
    ],
    /** Haute saison (juin–sept., fin de mois ≥ 25, vendredi–samedi) : +10 à 15 %. */
    hauteSaisonPct: 12,
    /** Basse saison (oct.–mars, du mardi au jeudi, hors fin de mois) : −5 %. */
    basseSaisonPct: -5,
    /** Minimum de facturation, en € TTC. */
    minimumTtc: 390,
    /** Densité moyenne pour estimer le poids (choix du véhicule uniquement). */
    kgParM3: 200,
    /** Visite technique : gratuite au-delà de ce volume ; en dessous, sur demande (non tarifée ici). */
    visiteGratuiteDesM3: 30,
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
  /** Détail par adresse (déménagement). Prioritaire sur `etagesSansAscenseur`. */
  etageDepart?: number;
  etageArrivee?: number;
  ascenseurDepart?: boolean;
  ascenseurArrivee?: boolean;
  emballage?: boolean;
  objetsLourds?: string[];
  /** Date souhaitée AAAA-MM-JJ (saisonnalité). */
  date?: string;
};

export type Saison = "haute" | "basse" | "normale";

/** Saison tarifaire d'une date AAAA-MM-JJ (vide ou invalide = normale). */
export function saisonDe(date?: string): Saison {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return "normale";
  const d = new Date(`${date}T12:00:00`);
  if (Number.isNaN(d.getTime())) return "normale";
  const mois = d.getMonth() + 1;
  const jour = d.getDate();
  const js = d.getDay(); // 0 dimanche … 6 samedi
  if ((mois >= 6 && mois <= 9) || jour >= 25 || js === 5 || js === 6) return "haute";
  if ((mois >= 10 || mois <= 3) && js >= 2 && js <= 4) return "basse";
  return "normale";
}

/**
 * Garde-fous : un devis hors norme passe « À valider » (aucun mail client automatique).
 * > 2 500 € TTC, prix au m³ hors 25–100 € (déménagement), ou écart > 15 % entre le
 * prix affiché au navigateur et le calcul serveur.
 */
export const GARDE_FOUS = { maxTtc: 2500, minParM3: 25, maxParM3: 100, ecartMax: 0.15 } as const;
export function needsReview(args: { totalTtc: number; volumeM3?: number; clientTotal?: number; demenagement: boolean }): boolean {
  const g = GARDE_FOUS;
  const perM3 = args.demenagement && (args.volumeM3 ?? 0) > 0 ? args.totalTtc / (args.volumeM3 as number) : null;
  const ecart = args.clientTotal ? Math.abs(args.clientTotal - args.totalTtc) / args.totalTtc : 0;
  return args.totalTtc > g.maxTtc || ecart > g.ecartMax || (perM3 !== null && (perM3 < g.minParM3 || perM3 > g.maxParM3));
}

/** Prix de base au m³ pour une distance donnée. */
export function baseParM3(km: number): number {
  return TARIF.demenagement.baseParM3.find((t) => km <= t.maxKm)?.prix ?? 66;
}

/** Véhicule conseillé d'après le volume (poids estimé, jamais demandé au client). */
export function vehiculeConseille(vol: number): { poidsKg: number; vehicule: string } {
  const poidsKg = Math.round(vol * TARIF.demenagement.kgParM3);
  const vehicule =
    vol <= 12 ? "Fourgon 12 m³" : vol <= 20 ? "Camion 20 m³" : vol <= 30 ? "Porteur 30 m³" : vol <= 50 ? "Porteur 50 m³" : "Semi-remorque / plusieurs véhicules";
  return { poidsKg, vehicule };
}

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
  /** Déménagement : saison appliquée, poids estimé, véhicule conseillé. */
  saison?: Saison;
  poidsEstimeKg?: number;
  vehicule?: string;
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

  let saison: Saison | undefined;
  let poidsEstimeKg: number | undefined;
  let vehicule: string | undefined;
  let minimumDem = 0;

  if (typeService === "demenagement") {
    const d = TARIF.demenagement;
    const vol = options.volumeM3 || 0;
    const km = options.distance || 0;
    const prixM3 = baseParM3(km);
    const base = vol * prixM3;
    lines.push({
      key: "base",
      label: {
        fr: `Base ${vol} m³ × ${prixM3} € (≈ ${Math.round(km)} km)`,
        en: `Base ${vol} m³ × €${prixM3} (≈ ${Math.round(km)} km)`,
      },
      amount: centimes(base),
    });

    const detail = options.etageDepart !== undefined || options.etageArrivee !== undefined;
    const adresses = detail
      ? [
          { etage: options.etageDepart ?? 0, asc: options.ascenseurDepart ?? false },
          { etage: options.etageArrivee ?? 0, asc: options.ascenseurArrivee ?? false },
        ]
      : [{ etage: Math.max(0, options.etagesSansAscenseur || 0), asc: false }];
    const etagesSans = adresses.reduce((n, a) => n + (a.asc ? 0 : Math.max(0, a.etage)), 0);
    const nbAsc = adresses.filter((a) => a.asc && a.etage > 0).length;
    const pctEtages = Math.min(d.etagesPlafondPct, etagesSans * d.etageSansAscenseurPct);
    if (pctEtages > 0) {
      lines.push({
        key: "etages",
        label: {
          fr: `Étages sans ascenseur (${etagesSans}) +${pctEtages} %`,
          en: `Floors without elevator (${etagesSans}) +${pctEtages}%`,
        },
        amount: centimes((base * pctEtages) / 100),
      });
    }
    if (nbAsc > 0) {
      const pct = nbAsc * d.ascenseurPct;
      lines.push({
        key: "ascenseur",
        label: { fr: `Étage avec ascenseur +${pct} %`, en: `Floor with elevator +${pct}%` },
        amount: centimes((base * pct) / 100),
      });
    }
    if (options.accesDifficile) {
      lines.push({
        key: "acces",
        label: { fr: `Accès difficile +${d.accesDifficilePct} %`, en: `Difficult access +${d.accesDifficilePct}%` },
        amount: centimes((base * d.accesDifficilePct) / 100),
      });
    }
    if (options.emballage) {
      lines.push({
        key: "emballage",
        label: { fr: `Emballage / cartons (${vol} m³ × ${d.emballageParM3} €)`, en: `Packing (${vol} m³ × €${d.emballageParM3})` },
        amount: centimes(vol * d.emballageParM3),
      });
    }
    for (const id of options.objetsLourds ?? []) {
      const o = d.objetsLourds.find((x) => x.id === id);
      if (o) lines.push({ key: `objet-${o.id}`, label: o.label, amount: o.prix });
    }
    const avantSaison = lines.reduce((sum, l) => sum + l.amount, 0);
    saison = saisonDe(options.date);
    const pctSaison = saison === "haute" ? d.hauteSaisonPct : saison === "basse" ? d.basseSaisonPct : 0;
    if (pctSaison !== 0) {
      lines.push({
        key: "saison",
        label:
          saison === "haute"
            ? { fr: `Haute saison +${pctSaison} %`, en: `Peak season +${pctSaison}%` }
            : { fr: `Basse saison ${pctSaison} %`, en: `Off-peak ${pctSaison}%` },
        amount: centimes((avantSaison * pctSaison) / 100),
      });
    }
    brut = lines.reduce((sum, l) => sum + l.amount, 0);
    ({ poidsKg: poidsEstimeKg, vehicule } = vehiculeConseille(vol));
    minimumDem = d.minimumTtc;
    etaDays = [1, 5];
    estimation = true;
  }

  let total = appliquerTarifStrategique(brut);
  if (minimumDem > 0 && total < minimumDem) {
    lines.push({
      key: "minimum",
      label: { fr: `Minimum de facturation (${minimumDem} €)`, en: `Minimum charge (€${minimumDem})` },
      amount: centimes(minimumDem - brut),
    });
    total = minimumDem;
    plancher = true;
  } else if (typeService === "covoiturage" && total < TARIF.covoiturage.prixMinimum) {
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

  return { total, brut: centimes(brut), lines, etaDays, plancher, estimation, saison, poidsEstimeKg, vehicule };
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
