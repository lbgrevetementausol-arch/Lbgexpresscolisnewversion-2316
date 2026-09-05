import { useMemo } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer, Tooltip } from "react-leaflet";
import { Loader2, MapPin, Navigation, RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useI18n } from "../../lib/i18n";
import { dateTime } from "../../lib/format";
import { Card } from "../site/section";
import { useAdminDriverPositions } from "../../queries/admin";

const STATUS_COLORS: Record<string, string> = {
  cree: "#94a3b8",
  pris_en_charge: "#38bdf8",
  en_transit: "#f59e0b",
  en_livraison: "#f97316",
  livre: "#22c55e",
  incident: "#ef4444",
  retourne: "#a78bfa",
};

const STATUS_LABELS: Record<string, { fr: string; en: string }> = {
  cree: { fr: "Créé", en: "Created" },
  pris_en_charge: { fr: "Pris en charge", en: "Picked up" },
  en_transit: { fr: "En transit", en: "In transit" },
  en_livraison: { fr: "En livraison", en: "Out for delivery" },
  livre: { fr: "Livré", en: "Delivered" },
  incident: { fr: "Incident", en: "Incident" },
  retourne: { fr: "Retourné", en: "Returned" },
};

/** Fraîcheur de la position : vert < 15 min, orange < 2 h, gris au-delà. */
function freshness(date: Date | string) {
  const ms = Date.now() - new Date(date).getTime();
  if (ms < 15 * 60_000) return { color: "text-success", fr: "il y a moins de 15 min", en: "less than 15 min ago" };
  if (ms < 2 * 3_600_000) return { color: "text-warning", fr: "il y a moins de 2 h", en: "less than 2 h ago" };
  return { color: "text-muted", fr: "position ancienne", en: "stale position" };
}

export function MapPanel() {
  const { t } = useI18n();
  const positions = useAdminDriverPositions(true);
  const rows = useMemo(() => positions.data ?? [], [positions.data]);

  const center = useMemo<[number, number]>(() => {
    if (!rows.length) return [46.8, 2.4];
    const lat = rows.reduce((sum, r) => sum + r.lat, 0) / rows.length;
    const lng = rows.reduce((sum, r) => sum + r.lng, 0) / rows.length;
    return [lat, lng];
  }, [rows]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Navigation className="size-4 text-primary" />
            {t({ fr: "Position des livreurs", en: "Driver positions" })}
          </h3>
          <button
            type="button"
            onClick={() => positions.refetch()}
            disabled={positions.isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/50 disabled:opacity-50"
          >
            {positions.isFetching ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />}
            {t({ fr: "Actualiser", en: "Refresh" })}
          </button>
        </div>
        <div className="h-[520px] w-full">
          <MapContainer
            key={rows.length ? `${center[0].toFixed(3)}-${center[1].toFixed(3)}` : "empty"}
            center={center}
            zoom={rows.length ? 6 : 5}
            scrollWheelZoom
            className="size-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {rows.map((row) => (
              <CircleMarker
                key={row.id}
                center={[row.lat, row.lng]}
                radius={9}
                pathOptions={{
                  color: STATUS_COLORS[row.status ?? "cree"] ?? "#38bdf8",
                  fillColor: STATUS_COLORS[row.status ?? "cree"] ?? "#38bdf8",
                  fillOpacity: 0.75,
                  weight: 2,
                }}
              >
                <Tooltip direction="top">{row.driverName ?? row.trackingNumber}</Tooltip>
                <Popup>
                  <div className="space-y-1 text-xs">
                    <p className="font-semibold">{row.trackingNumber}</p>
                    <p>{row.driverName ?? t({ fr: "Livreur inconnu", en: "Unknown driver" })}</p>
                    {row.driverPhone ? <p>{row.driverPhone}</p> : null}
                    {row.destination ? <p>→ {row.destination}</p> : null}
                    <p>{dateTime(row.createdAt)}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </Card>

      <Card className="grid content-start gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <MapPin className="size-4 text-primary" />
          {t({ fr: "Courses géolocalisées", en: "Geolocated jobs" })}
          <span className="text-muted">({rows.length})</span>
        </h3>

        {positions.isLoading ? (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" />
            {t({ fr: "Chargement…", en: "Loading…" })}
          </p>
        ) : null}

        {!positions.isLoading && !rows.length ? (
          <p className="text-sm text-muted">
            {t({
              fr: "Aucune position reçue pour l'instant. Les points apparaissent dès qu'un livreur ouvre sa course sur /livreur et autorise la géolocalisation.",
              en: "No position received yet. Points appear as soon as a driver opens a job on /livreur and allows geolocation.",
            })}
          </p>
        ) : null}

        <div className="grid gap-2">
          {rows.map((row) => {
            const fresh = freshness(row.createdAt);
            const status = STATUS_LABELS[row.status ?? "cree"] ?? { fr: row.status ?? "—", en: row.status ?? "—" };
            return (
              <div key={row.id} className="rounded-xl border border-border bg-surface-2/50 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{row.driverName ?? t({ fr: "Livreur", en: "Driver" })}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{
                      backgroundColor: `${STATUS_COLORS[row.status ?? "cree"] ?? "#38bdf8"}22`,
                      color: STATUS_COLORS[row.status ?? "cree"] ?? "#38bdf8",
                    }}
                  >
                    {t(status)}
                  </span>
                </div>
                <p className="mt-1 font-mono text-xs text-muted">{row.trackingNumber}</p>
                {row.destination ? <p className="text-xs text-muted">→ {row.destination}</p> : null}
                <p className={`mt-1 text-xs ${fresh.color}`}>
                  {dateTime(row.createdAt)} · {t(fresh)}
                </p>
                <a
                  className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                  href={`https://www.openstreetmap.org/?mlat=${row.lat}&mlon=${row.lng}#map=15/${row.lat}/${row.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t({ fr: "Ouvrir dans OpenStreetMap", en: "Open in OpenStreetMap" })}
                </a>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
