import { z } from "zod";
import { base } from "../__core/app";

/**
 * Autocomplétion d'adresses 100 % open source (données OpenStreetMap).
 * Source principale : Photon (Komoot) — conçu pour la frappe au clavier.
 * Repli : Nominatim (OSM officiel), appelé au maximum 1 fois par seconde
 * comme l'exige sa politique d'usage, avec un User-Agent identifiable.
 *
 * L'appel passe par le serveur (et non le navigateur) pour mutualiser le
 * cache, respecter les limites de débit et ne dépendre d'aucune clé payante.
 */

const USER_AGENT =
  "LBGExpressColis/1.0 (+https://www.lbgexpresscolis.fr; contact@lbgexpresscolis.fr)";
const PHOTON_URL = "https://photon.komoot.io/api/";
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
/** Biais géographique : centre de la France métropolitaine. */
const FR_BIAS = { lat: 46.6, lon: 2.4 };
const TIMEOUT_MS = 4500;
const CACHE_TTL_MS = 15 * 60 * 1000;
const CACHE_MAX = 800;

export interface GeoSuggestion {
  /** Libellé affiché dans la liste de suggestions. */
  label: string;
  city: string | null;
  postcode: string | null;
  country: string | null;
  countryCode: string | null;
  lat: number;
  lng: number;
}

const cache = new Map<string, { at: number; value: GeoSuggestion[] }>();

function cacheGet(key: string): GeoSuggestion[] | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function cacheSet(key: string, value: GeoSuggestion[]) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), value });
}

function join(parts: (string | null | undefined)[]): string {
  return parts.filter((p) => p && p.trim().length > 0).join(", ");
}

interface PhotonProps {
  name?: string;
  housenumber?: string;
  street?: string;
  city?: string;
  district?: string;
  locality?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  countrycode?: string;
  type?: string;
}

function fromPhoton(
  feature: { properties?: PhotonProps; geometry?: { coordinates?: number[] } },
  withCountry: boolean,
): GeoSuggestion | null {
  const p = feature.properties ?? {};
  const coords = feature.geometry?.coordinates;
  // GeoJSON : [longitude, latitude]
  if (!coords || coords.length < 2) return null;
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const city = p.city ?? p.locality ?? (p.type === "city" ? (p.name ?? null) : null);
  const street = join([p.housenumber, p.street]);
  const head = p.name && p.name !== city ? p.name : street || p.name || city || "";
  const tail = join([
    street && street !== head ? street : null,
    p.postcode ?? null,
    city && city !== head ? city : null,
    !city && p.county ? p.county : null,
    withCountry ? (p.country ?? null) : null,
  ]);

  const label = join([head, tail]) || (p.country ?? "");
  if (!label) return null;
  return {
    label,
    city: city ?? null,
    postcode: p.postcode ?? null,
    country: p.country ?? null,
    countryCode: p.countrycode ? p.countrycode.toUpperCase() : null,
    lat,
    lng,
  };
}

async function searchPhoton(
  q: string,
  country: string | undefined,
  cityOnly: boolean,
  limit: number,
): Promise<GeoSuggestion[]> {
  const params = new URLSearchParams({
    q,
    lang: "fr",
    limit: String(country ? limit * 3 : limit),
  });
  if (country === "fr") {
    params.set("lat", String(FR_BIAS.lat));
    params.set("lon", String(FR_BIAS.lon));
  }
  // layer=city : villes et communes uniquement (champs "Ville de départ").
  if (cityOnly) params.append("layer", "city");
  const res = await fetch(`${PHOTON_URL}?${params.toString()}`, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`photon ${res.status}`);
  const data = (await res.json()) as { features?: unknown[] };
  const wanted = country ? country.toUpperCase() : null;
  const out: GeoSuggestion[] = [];
  const seen = new Set<string>();
  for (const feature of data.features ?? []) {
    const item = fromPhoton(
      feature as { properties?: PhotonProps; geometry?: { coordinates?: number[] } },
      !wanted,
    );
    if (!item) continue;
    if (wanted && item.countryCode !== wanted) continue;
    const key = item.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

// Nominatim : 1 requête par seconde maximum (politique d'usage OSM).
let nominatimQueue: Promise<unknown> = Promise.resolve();
let lastNominatimAt = 0;

function throttleNominatim<T>(task: () => Promise<T>): Promise<T> {
  const run = nominatimQueue.then(async () => {
    const wait = 1100 - (Date.now() - lastNominatimAt);
    if (wait > 0) await new Promise((r) => setTimeout(r, wait));
    lastNominatimAt = Date.now();
    return task();
  });
  nominatimQueue = run.catch(() => undefined);
  return run;
}

interface NominatimRow {
  display_name?: string;
  lat?: string;
  lon?: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
    country?: string;
    country_code?: string;
  };
}

async function searchNominatim(
  q: string,
  country: string | undefined,
  limit: number,
): Promise<GeoSuggestion[]> {
  return throttleNominatim(async () => {
    const params = new URLSearchParams({
      format: "jsonv2",
      addressdetails: "1",
      "accept-language": "fr",
      limit: String(limit),
      q,
    });
    if (country) params.set("countrycodes", country.toLowerCase());
    const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`nominatim ${res.status}`);
    const rows = (await res.json()) as NominatimRow[];
    const out: GeoSuggestion[] = [];
    for (const row of rows) {
      const lat = Number(row.lat);
      const lng = Number(row.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      const a = row.address ?? {};
      const city = a.city ?? a.town ?? a.village ?? a.municipality ?? null;
      out.push({
        label: row.display_name ?? join([city, a.postcode, a.country]),
        city,
        postcode: a.postcode ?? null,
        country: a.country ?? null,
        countryCode: a.country_code ? a.country_code.toUpperCase() : null,
        lat,
        lng,
      });
    }
    return out;
  });
}

export const geo = {
  /**
   * Suggestions d'adresses / villes avec latitude et longitude.
   * Les coordonnées alimentent directement le calcul de distance géodésique
   * (haversine) du moteur tarifaire.
   */
  search: base
    .input(
      z.object({
        q: z.string().min(2).max(160),
        /** Code pays ISO 2 lettres pour restreindre les résultats (ex. "fr"). */
        country: z.string().length(2).optional(),
        /** Ne proposer que des villes / localités (champs "Ville de départ"). */
        cityOnly: z.boolean().optional(),
        limit: z.number().int().min(1).max(10).optional(),
      }),
    )
    .handler(async ({ input }) => {
      const q = input.q.trim().replace(/\s+/g, " ");
      const limit = input.limit ?? 6;
      const country = input.country?.toLowerCase();
      const cityOnly = input.cityOnly ?? false;
      if (q.length < 2) return { source: "none" as const, results: [] as GeoSuggestion[] };

      const key = `${q.toLowerCase()}|${country ?? "*"}|${cityOnly ? "city" : "all"}|${limit}`;
      const cached = cacheGet(key);
      if (cached) return { source: "cache" as const, results: cached };

      let results: GeoSuggestion[] = [];
      let source: "photon" | "nominatim" | "none" = "none";
      try {
        results = await searchPhoton(q, country, cityOnly, limit);
        source = "photon";
      } catch {
        results = [];
      }
      if (results.length === 0) {
        try {
          results = await searchNominatim(q, country, limit);
          source = results.length > 0 ? "nominatim" : source;
        } catch {
          // les deux sources sont indisponibles : champ texte libre côté client
        }
      }
      if (results.length > 0) cacheSet(key, results);
      return { source, results };
    }),
};
