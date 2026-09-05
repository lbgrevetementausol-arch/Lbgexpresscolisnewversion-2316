import { CheckCircle2, Circle, MapPin, PackageCheck, Share2, Truck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime, relative, whatsappLink } from "../../lib/format";
import { cn } from "@/lib/utils";

export const STATUS_STEPS = ["cree", "pris_en_charge", "en_transit", "en_livraison", "livre"] as const;

export const STATUS_UI: Record<string, { fr: string; en: string; tone: string }> = {
  cree: { fr: "Expédition créée", en: "Shipment created", tone: "text-muted border-border bg-surface-2" },
  pris_en_charge: { fr: "Pris en charge", en: "Picked up", tone: "text-primary border-primary/40 bg-primary/10" },
  en_transit: { fr: "En transit", en: "In transit", tone: "text-warning border-warning/40 bg-warning/10" },
  en_livraison: { fr: "En cours de livraison", en: "Out for delivery", tone: "text-warning border-warning/40 bg-warning/10" },
  livre: { fr: "Livré", en: "Delivered", tone: "text-success border-success/40 bg-success/10" },
  incident: { fr: "Incident", en: "Incident", tone: "text-danger border-danger/40 bg-danger/10" },
  retourne: { fr: "Retourné", en: "Returned", tone: "text-danger border-danger/40 bg-danger/10" },
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const { t } = useI18n();
  const ui = STATUS_UI[status] ?? { fr: status, en: status, tone: "text-muted border-border bg-surface-2" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        ui.tone,
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {t({ fr: ui.fr, en: ui.en })}
    </span>
  );
}

interface TrackingEvent {
  id: number;
  status: string;
  labelFr: string;
  labelEn: string;
  location: string | null;
  occurredAt: Date | string;
}

interface Parcel {
  trackingNumber: string;
  status: string;
  origin: string;
  destination: string;
  recipientName: string | null;
  service: string;
  carrier: string;
  externalCarrier: string | null;
  weightKg: number | null;
  eta: Date | string | null;
  updatedAt: Date | string;
}

interface Position {
  lat: number;
  lng: number;
  createdAt: Date | string;
}

export function TrackingTimeline({
  parcel,
  events,
  position,
}: {
  parcel: Parcel;
  events: TrackingEvent[];
  position: Position | null;
}) {
  const { t, lang } = useI18n();
  const currentIndex = STATUS_STEPS.indexOf(parcel.status as (typeof STATUS_STEPS)[number]);
  const isProblem = parcel.status === "incident" || parcel.status === "retourne";

  return (
    <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr] lg:items-start">
      <div className="space-y-6">
        <div className="glass rounded-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {t({ fr: "Numéro de suivi", en: "Tracking number" })}
              </p>
              <p className="font-display text-2xl font-bold">{parcel.trackingNumber}</p>
              <p className="mt-1 text-xs text-muted">
                {t({ fr: "Mis à jour", en: "Updated" })} {relative(parcel.updatedAt, lang)}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={parcel.status} />
              <a
                href={whatsappLink(
                  t({
                    fr: `Suivi de mon colis LBG Express : ${parcel.trackingNumber}`,
                    en: `My LBG Express parcel tracking: ${parcel.trackingNumber}`,
                  }),
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-primary"
              >
                <Share2 className="size-3.5" />
                {t({ fr: "Partager", en: "Share" })}
              </a>
            </div>
          </div>

          {/* Progression */}
          <div className="mt-8">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => {
                const done = !isProblem && i <= currentIndex;
                return (
                  <div key={step} className="flex flex-1 items-center last:flex-none">
                    <div className="flex flex-col items-center gap-2">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full border-2 transition",
                          done
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-surface-2 text-muted",
                          i === currentIndex && !isProblem && "animate-ping-dot",
                        )}
                      >
                        {done ? <CheckCircle2 className="size-4" /> : <Circle className="size-3" />}
                      </span>
                      <span
                        className={cn(
                          "hidden text-center text-[0.68rem] font-medium leading-tight sm:block",
                          done ? "text-foreground" : "text-muted",
                        )}
                      >
                        {t({ fr: STATUS_UI[step]!.fr, en: STATUS_UI[step]!.en })}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 ? (
                      <span
                        className={cn(
                          "mx-1 mb-6 h-0.5 flex-1 rounded-full sm:mx-2",
                          i < currentIndex && !isProblem ? "bg-primary" : "bg-border",
                        )}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <dl className="mt-8 grid gap-4 border-t border-border pt-6 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">{t({ fr: "Origine", en: "Origin" })}</dt>
              <dd className="mt-1 font-medium">{parcel.origin}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">
                {t({ fr: "Destination", en: "Destination" })}
              </dt>
              <dd className="mt-1 font-medium">{parcel.destination}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">
                {t({ fr: "Livraison estimée", en: "Estimated delivery" })}
              </dt>
              <dd className="mt-1 font-medium">
                {parcel.eta ? dateTime(parcel.eta, lang) : t({ fr: "À confirmer", en: "To be confirmed" })}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted">
                {t({ fr: "Transporteur", en: "Carrier" })}
              </dt>
              <dd className="mt-1 font-medium">
                {parcel.carrier}
                {parcel.externalCarrier ? ` · ${parcel.externalCarrier}` : ""}
                {parcel.weightKg ? ` · ${parcel.weightKg} kg` : ""}
              </dd>
            </div>
          </dl>
        </div>

        {/* Timeline */}
        <div className="glass rounded-card p-6">
          <h3 className="font-display text-lg font-bold">{t({ fr: "Historique", en: "History" })}</h3>
          <ol className="mt-6 space-y-0">
            {events.map((event, i) => (
              <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                {i < events.length - 1 ? (
                  <span className="absolute left-[15px] top-8 h-full w-0.5 bg-border" aria-hidden />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 grid size-8 shrink-0 place-items-center rounded-full border",
                    i === 0 ? "border-primary bg-primary/15 text-primary" : "border-border bg-surface-2 text-muted",
                  )}
                >
                  {event.status === "livre" ? (
                    <PackageCheck className="size-4" />
                  ) : (
                    <Truck className="size-4" />
                  )}
                </span>
                <div className="pt-1">
                  <p className="text-sm font-semibold">{lang === "fr" ? event.labelFr : event.labelEn}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {dateTime(event.occurredAt, lang)}
                    {event.location ? ` · ${event.location}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Position GPS */}
      <div className="glass rounded-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border p-5">
          <MapPin className="size-4 text-primary" />
          <h3 className="font-display text-base font-bold">
            {t({ fr: "Dernière position", en: "Latest position" })}
          </h3>
        </div>
        {position ? (
          <>
            <iframe
              title="map"
              className="h-72 w-full border-0"
              loading="lazy"
              src={`https://maps.google.com/maps?q=${position.lat},${position.lng}&z=12&output=embed`}
            />
            <div className="p-5 text-sm">
              <p className="font-medium tabular-nums">
                {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {t({ fr: "Relevé", en: "Recorded" })} {relative(position.createdAt, lang)}
              </p>
            </div>
          </>
        ) : (
          <p className="p-5 text-sm text-muted">
            {t({
              fr: "La position GPS s'affichera dès que le livreur aura pris le colis en charge.",
              en: "The GPS position appears as soon as a driver picks up the parcel.",
            })}
          </p>
        )}
      </div>
    </div>
  );
}
