import { useState } from "react";
import { Loader2, MapPin, PackagePlus, PackageSearch, Plus } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { dateTime } from "../../lib/format";
import { Card } from "../site/section";
import { Field, Input, Label, Select } from "../site/field";
import { useAddTrackingEvent, useAdminTrackings } from "../../queries/admin";
import { useCreateTracking } from "../../queries/tracking";

const STATUSES = ["cree", "pris_en_charge", "en_transit", "en_livraison", "livre", "incident"] as const;
type TrackingStatus = (typeof STATUSES)[number];

const PRESETS: Record<TrackingStatus, { fr: string; en: string }> = {
  cree: { fr: "Commande enregistrée", en: "Order registered" },
  pris_en_charge: { fr: "Colis pris en charge", en: "Parcel picked up" },
  en_transit: { fr: "En transit vers le centre de tri", en: "In transit to sorting hub" },
  en_livraison: { fr: "En cours de livraison", en: "Out for delivery" },
  livre: { fr: "Colis livré", en: "Parcel delivered" },
  incident: { fr: "Incident de livraison", en: "Delivery incident" },
};

const SERVICES = ["economique", "standard", "express", "premium"] as const;
type ServiceId = (typeof SERVICES)[number];

const SERVICE_LABELS: Record<ServiceId, { fr: string; en: string }> = {
  economique: { fr: "Économique", en: "Economy" },
  standard: { fr: "Standard", en: "Standard" },
  express: { fr: "Express", en: "Express" },
  premium: { fr: "Premium", en: "Premium" },
};

/** Formulaire de création d'un suivi depuis le back-office (colis pris hors site). */
function CreateTrackingCard({ onCreated }: { onCreated: (trackingNumber: string) => void }) {
  const { t } = useI18n();
  const createTracking = useCreateTracking();

  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [service, setService] = useState<ServiceId>("standard");
  const [weightKg, setWeightKg] = useState("");
  const [externalCarrier, setExternalCarrier] = useState("");
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = origin.trim().length >= 2 && destination.trim().length >= 2;

  const submit = async () => {
    setError(null);
    setCreated(null);
    try {
      const weight = Number.parseFloat(weightKg.replace(",", "."));
      const parcel = await createTracking.mutateAsync({
        origin: origin.trim(),
        destination: destination.trim(),
        recipientName: recipientName.trim() || undefined,
        service,
        weightKg: Number.isFinite(weight) && weight > 0 ? weight : undefined,
        externalCarrier: externalCarrier.trim() || undefined,
        source: "pro",
      });
      setCreated(parcel.trackingNumber);
      onCreated(parcel.trackingNumber);
      setOrigin("");
      setDestination("");
      setRecipientName("");
      setWeightKg("");
      setExternalCarrier("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t({ fr: "Création impossible.", en: "Could not create." }));
    }
  };

  return (
    <Card hover={false}>
      <p className="flex items-center gap-2 font-semibold">
        <PackagePlus className="size-4 text-primary" />
        {t({ fr: "Créer un suivi", en: "Create a tracking" })}
      </p>
      <p className="mt-1 text-xs text-muted">
        {t({
          fr: "Pour un colis pris par téléphone, WhatsApp ou en agence : le numéro de suivi est généré automatiquement.",
          en: "For a parcel taken by phone, WhatsApp or in branch: the tracking number is generated automatically.",
        })}
      </p>
      <div className="mt-4 grid gap-3">
        <Field>
          <Label>{t({ fr: "Départ", en: "Origin" })}</Label>
          <Input
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Paris, France"
            aria-label={t({ fr: "Départ", en: "Origin" })}
          />
        </Field>
        <Field>
          <Label>{t({ fr: "Destination", en: "Destination" })}</Label>
          <Input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Cotonou, Bénin"
            aria-label={t({ fr: "Destination", en: "Destination" })}
          />
        </Field>
        <Field>
          <Label>{t({ fr: "Destinataire (optionnel)", en: "Recipient (optional)" })}</Label>
          <Input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            aria-label={t({ fr: "Destinataire", en: "Recipient" })}
          />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field>
            <Label>{t({ fr: "Service", en: "Service" })}</Label>
            <Select
              value={service}
              onChange={(e) => setService(e.target.value as ServiceId)}
              aria-label={t({ fr: "Service", en: "Service" })}
            >
              {SERVICES.map((value) => (
                <option key={value} value={value}>
                  {t(SERVICE_LABELS[value])}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>{t({ fr: "Poids (kg)", en: "Weight (kg)" })}</Label>
            <Input
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              inputMode="decimal"
              placeholder="12"
              aria-label={t({ fr: "Poids en kilogrammes", en: "Weight in kilograms" })}
            />
          </Field>
        </div>
        <Field>
          <Label>{t({ fr: "Transporteur externe (optionnel)", en: "External carrier (optional)" })}</Label>
          <Input
            value={externalCarrier}
            onChange={(e) => setExternalCarrier(e.target.value)}
            placeholder="Air France Cargo"
            aria-label={t({ fr: "Transporteur externe", en: "External carrier" })}
          />
        </Field>
        <button
          type="button"
          onClick={submit}
          disabled={!canSubmit || createTracking.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
        >
          {createTracking.isPending ? <Loader2 className="size-4 animate-spin" /> : <PackagePlus className="size-4" />}
          {t({ fr: "Créer le suivi", en: "Create tracking" })}
        </button>
        {error ? <p className="text-xs text-danger">{error}</p> : null}
        {created ? (
          <p className="text-xs text-success">
            {t({ fr: "Suivi créé :", en: "Tracking created:" })} <span className="font-mono font-semibold">{created}</span>
          </p>
        ) : null}
      </div>
    </Card>
  );
}

/** Suivi des colis : liste temps réel + ajout d'un événement de tracking. */
export function TrackingsPanel() {
  const { t, lang } = useI18n();
  const trackings = useAdminTrackings(true);
  const addEvent = useAddTrackingEvent();

  const [number, setNumber] = useState("");
  const [status, setStatus] = useState<TrackingStatus>("en_transit");
  const [labelFr, setLabelFr] = useState(PRESETS.en_transit.fr);
  const [labelEn, setLabelEn] = useState(PRESETS.en_transit.en);
  const [location, setLocation] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickStatus = (value: TrackingStatus) => {
    setStatus(value);
    setLabelFr(PRESETS[value].fr);
    setLabelEn(PRESETS[value].en);
  };

  const submit = async () => {
    setError(null);
    setDone(null);
    try {
      await addEvent.mutateAsync({
        trackingNumber: number.trim(),
        status,
        labelFr: labelFr.trim(),
        labelEn: labelEn.trim(),
        location: location.trim() || undefined,
      });
      setDone(number.trim().toUpperCase());
      setLocation("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t({ fr: "Ajout impossible.", en: "Could not add event." }));
    }
  };

  const canSubmit = number.trim().length >= 4 && labelFr.trim().length >= 2 && labelEn.trim().length >= 2;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card hover={false}>
        <p className="flex items-center gap-2 font-semibold">
          <PackageSearch className="size-4 text-primary" />
          {t({ fr: "Colis suivis", en: "Tracked parcels" })} · {(trackings.data ?? []).length}
        </p>
        {trackings.isLoading ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <Loader2 className="size-4 animate-spin" />
            {t({ fr: "Chargement…", en: "Loading…" })}
          </p>
        ) : null}
        <div className="mt-4 grid gap-2">
          {(trackings.data ?? []).map((row) => (
            <div key={row.id} className="rounded-card border border-border bg-surface-2/50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-sm font-semibold">{row.trackingNumber}</p>
                  <p className="text-xs text-muted">
                    {row.fromCity ?? "—"} → {row.toCity ?? "—"} · {dateTime(row.updatedAt, lang)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold">{row.status}</span>
                  <button
                    type="button"
                    onClick={() => setNumber(row.trackingNumber)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/50"
                  >
                    {t({ fr: "Mettre à jour", en: "Update" })}
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!trackings.isLoading && (trackings.data ?? []).length === 0 ? (
            <p className="text-sm text-muted">{t({ fr: "Aucun colis suivi.", en: "No tracked parcel." })}</p>
          ) : null}
        </div>
      </Card>

      <div className="grid content-start gap-4">
      <CreateTrackingCard onCreated={setNumber} />

      <Card hover={false}>
        <p className="flex items-center gap-2 font-semibold">
          <Plus className="size-4 text-primary" />
          {t({ fr: "Nouvel événement de suivi", en: "New tracking event" })}
        </p>
        <div className="mt-4 grid gap-3">
          <Field>
            <Label>{t({ fr: "Numéro de suivi", en: "Tracking number" })}</Label>
            <Input
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="TRK-20260824-DEMO01"
              aria-label={t({ fr: "Numéro de suivi", en: "Tracking number" })}
            />
          </Field>
          <Field>
            <Label>{t({ fr: "Statut", en: "Status" })}</Label>
            <Select
              value={status}
              onChange={(e) => pickStatus(e.target.value as TrackingStatus)}
              aria-label={t({ fr: "Statut", en: "Status" })}
            >
              {STATUSES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
          <Field>
            <Label>{t({ fr: "Libellé (FR)", en: "Label (FR)" })}</Label>
            <Input value={labelFr} onChange={(e) => setLabelFr(e.target.value)} aria-label="Label FR" />
          </Field>
          <Field>
            <Label>{t({ fr: "Libellé (EN)", en: "Label (EN)" })}</Label>
            <Input value={labelEn} onChange={(e) => setLabelEn(e.target.value)} aria-label="Label EN" />
          </Field>
          <Field>
            <Label>{t({ fr: "Lieu (optionnel)", en: "Location (optional)" })}</Label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Roissy CDG"
              aria-label={t({ fr: "Lieu", en: "Location" })}
            />
          </Field>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || addEvent.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-60"
          >
            {addEvent.isPending ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
            {t({ fr: "Ajouter l'événement", en: "Add event" })}
          </button>
          {error ? <p className="text-xs text-danger">{error}</p> : null}
          {done ? (
            <p className="text-xs text-success">
              {t({ fr: "Suivi mis à jour :", en: "Tracking updated:" })} {done}
            </p>
          ) : null}
        </div>
      </Card>
      </div>
    </div>
  );
}
