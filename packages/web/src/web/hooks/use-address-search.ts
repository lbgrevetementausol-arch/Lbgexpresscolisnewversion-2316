import { useEffect, useRef, useState } from "react";
import { client } from "../lib/api";

export interface AddressSuggestion {
  label: string;
  city: string | null;
  postcode: string | null;
  country: string | null;
  countryCode: string | null;
  lat: number;
  lng: number;
}

interface Options {
  /** Code pays ISO 2 lettres (ex. "fr"). Vide = monde entier. */
  country?: string;
  /** Ne proposer que des villes / localités. */
  cityOnly?: boolean;
  /** Désactive la recherche (ex. suggestion déjà choisie). */
  enabled?: boolean;
  /** Délai anti-rebond en ms. */
  debounceMs?: number;
}

/**
 * Autocomplétion d'adresses via notre API serveur (données OpenStreetMap,
 * Photon puis Nominatim en repli). Aucune clé, aucun service payant.
 * Renvoie systématiquement la latitude et la longitude de chaque suggestion.
 */
export function useAddressSearch(query: string, options: Options = {}) {
  const { country, cityOnly = false, enabled = true, debounceMs = 300 } = options;
  const [results, setResults] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (!enabled || q.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    const timer = setTimeout(() => {
      client.geo
        .search({ q, country, cityOnly })
        .then((res) => {
          if (id !== requestId.current) return;
          setResults(res.results as AddressSuggestion[]);
          setLoading(false);
        })
        .catch(() => {
          if (id !== requestId.current) return;
          setResults([]);
          setLoading(false);
        });
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, country, cityOnly, enabled, debounceMs]);

  return { results, loading };
}
