import { useEffect, useRef } from "react";
import { useGoogleMaps } from "../../hooks/use-google-maps";
import { inputClass } from "./field";
import { cn } from "@/lib/utils";

interface AddressInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  id?: string;
  required?: boolean;
  className?: string;
  /** Restreint l'autocomplétion à un pays (ex. "fr"). Vide = monde entier. */
  country?: string;
  /** Appelé quand l'utilisateur choisit une suggestion : adresse + coordonnées si connues. */
  onPlace?: (place: { address: string; lat?: number; lng?: number }) => void;
}

interface AutocompleteLike {
  addListener: (event: string, cb: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    name?: string;
    geometry?: { location?: { lat: () => number; lng: () => number } };
  };
}

/**
 * Champ d'adresse avec Google Places Autocomplete.
 * Dégradation propre : si la clé Maps est absente ou le script bloqué,
 * le champ reste un input texte libre parfaitement utilisable.
 */
export function AddressInput({
  value,
  onChange,
  placeholder,
  id,
  required,
  className,
  country,
  onPlace,
}: AddressInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { ready } = useGoogleMaps();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onPlaceRef = useRef(onPlace);
  onPlaceRef.current = onPlace;

  useEffect(() => {
    if (!ready || !inputRef.current) return;
    const g = (window as unknown as {
      google?: {
        maps?: {
          places?: {
            Autocomplete: new (
              el: HTMLInputElement,
              opts: Record<string, unknown>,
            ) => AutocompleteLike;
          };
        };
      };
    }).google;
    if (!g?.maps?.places) return;

    const autocomplete = new g.maps.places.Autocomplete(inputRef.current, {
      fields: ["formatted_address", "name", "geometry"],
      types: ["geocode"],
      ...(country ? { componentRestrictions: { country } } : {}),
    });
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const next = place.formatted_address ?? place.name ?? "";
      if (next) onChangeRef.current(next);
      const loc = place.geometry?.location;
      onPlaceRef.current?.({
        address: next,
        lat: loc ? loc.lat() : undefined,
        lng: loc ? loc.lng() : undefined,
      });
    });
  }, [ready, country]);

  return (
    <input
      ref={inputRef}
      id={id}
      required={required}
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
        onPlaceRef.current?.({ address: e.target.value });
      }}
      placeholder={placeholder}
      aria-label={placeholder ?? "Adresse"}
      autoComplete="off"
      className={cn(inputClass, className)}
    />
  );
}
