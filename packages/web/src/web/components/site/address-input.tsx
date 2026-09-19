import { useEffect, useId, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { type AddressSuggestion, useAddressSearch } from "../../hooks/use-address-search";
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
  /** Ne proposer que des villes / localités (champs "Ville de départ"). */
  cityOnly?: boolean;
  /** Appelé quand l'utilisateur choisit une suggestion : adresse + coordonnées. */
  onPlace?: (place: { address: string; lat?: number; lng?: number }) => void;
}

/**
 * Champ d'adresse avec autocomplétion OpenStreetMap (Photon / Nominatim),
 * libre et sans clé API. Chaque suggestion choisie renvoie sa latitude et sa
 * longitude via onPlace, ce qui alimente le calcul de distance géodésique.
 * Dégradation propre : si le service est indisponible, le champ reste un
 * input texte libre parfaitement utilisable.
 */
export function AddressInput({
  value,
  onChange,
  placeholder,
  id,
  required,
  className,
  country,
  cityOnly,
  onPlace,
}: AddressInputProps) {
  const autoId = useId();
  const listId = `${id ?? autoId}-suggestions`;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const { results, loading } = useAddressSearch(value, {
    country,
    cityOnly,
    enabled: typed,
  });

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const pick = (item: AddressSuggestion) => {
    setTyped(false);
    setOpen(false);
    setHighlight(-1);
    onChange(item.label);
    onPlace?.({ address: item.label, lat: item.lat, lng: item.lng });
  };

  const visible = open && typed && results.length > 0;

  return (
    <div ref={wrapperRef} className="relative">
      <input
        id={id}
        required={required}
        value={value}
        aria-controls={listId}
        aria-autocomplete="list"
        onChange={(e) => {
          const next = e.target.value;
          setTyped(true);
          setOpen(true);
          setHighlight(-1);
          onChange(next);
          onPlace?.({ address: next });
        }}
        onFocus={() => {
          if (results.length > 0) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!visible) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h <= 0 ? results.length - 1 : h - 1));
          } else if (e.key === "Enter") {
            const item = results[highlight] ?? results[0];
            if (item) {
              e.preventDefault();
              pick(item);
            }
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        aria-label={placeholder ?? "Adresse"}
        autoComplete="off"
        className={cn(inputClass, className)}
      />

      {visible ? (
        <div
          id={listId}
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-border bg-surface shadow-[0_20px_40px_rgba(2,6,23,0.45)]"
        >
          {results.map((item, i) => (
            <button
              key={`${item.lat},${item.lng},${item.label}`}
              type="button"
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(item)}
              className={cn(
                "flex w-full items-start gap-2 border-border px-3 py-2 text-left text-sm text-muted transition",
                i > 0 && "border-t",
                i === highlight ? "bg-surface-2 text-foreground" : "hover:bg-surface-2",
              )}
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
              <span className="leading-snug">{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}

      {loading && typed && value.trim().length >= 2 && results.length === 0 ? (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
          …
        </span>
      ) : null}
    </div>
  );
}
