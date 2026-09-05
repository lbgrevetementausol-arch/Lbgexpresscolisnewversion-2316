import { useEffect, useState } from "react";

/**
 * Charge l'API Google Maps Places une seule fois, à la demande.
 * Clé lue depuis VITE_GOOGLE_MAPS_API_KEY. Sans clé, les champs d'adresse
 * restent des inputs texte classiques (aucun blocage fonctionnel).
 */
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
const SCRIPT_ID = "google-maps-places";

type Status = "idle" | "loading" | "ready" | "error" | "no-key";

let promise: Promise<void> | null = null;

function load(): Promise<void> {
  if (promise) return promise;
  promise = new Promise<void>((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no window"));
    const w = window as unknown as { google?: { maps?: { places?: unknown } } };
    if (w.google?.maps?.places) return resolve();

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("google maps failed")));
      return;
    }
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&language=fr`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("google maps failed"));
    document.head.appendChild(script);
  });
  return promise;
}

export function useGoogleMaps() {
  const [status, setStatus] = useState<Status>(API_KEY ? "idle" : "no-key");

  useEffect(() => {
    if (!API_KEY) return;
    let cancelled = false;
    setStatus("loading");
    load()
      .then(() => !cancelled && setStatus("ready"))
      .catch(() => !cancelled && setStatus("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  return { status, ready: status === "ready" };
}
