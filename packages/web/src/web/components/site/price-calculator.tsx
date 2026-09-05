import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Calculator, Clock, Loader2 } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { money } from "../../lib/format";
import { useEstimate, useQuoteOptions, type EstimateInput } from "../../queries/quotes";
import { Field, Input, Select } from "./field";
import { cn } from "@/lib/utils";

type Kind = NonNullable<EstimateInput["kind"]>;

const KINDS: { id: Kind; fr: string; en: string }[] = [
  { id: "colis", fr: "Colis", en: "Parcel" },
  { id: "palette", fr: "Palette / fret", en: "Pallet / freight" },
  { id: "demenagement", fr: "Déménagement", en: "Moving" },
  { id: "international", fr: "International", en: "International" },
];

/** Calculateur de prix instantané — même moteur de tarification que les devis. */
export function PriceCalculator({ className }: { className?: string }) {
  const { t, lang } = useI18n();
  const options = useQuoteOptions();

  const [kind, setKind] = useState<Kind>("colis");
  const [zone, setZone] = useState<NonNullable<EstimateInput["zone"]>>("france");
  const [service, setService] = useState<NonNullable<EstimateInput["service"]>>("standard");
  const [weight, setWeight] = useState("5");
  const [volume, setVolume] = useState("12");

  const input = useMemo<EstimateInput>(() => {
    const w = Number(weight.replace(",", ".")) || 0;
    const v = Number(volume.replace(",", ".")) || 0;
    return {
      kind,
      zone,
      service,
      ...(kind === "demenagement" ? { volumeM3: v, weightKg: v * 60 } : { weightKg: w }),
    };
  }, [kind, zone, service, weight, volume]);

  const estimate = useEstimate(input);
  const total = estimate.data?.total;

  const query = new URLSearchParams({
    kind,
    zone,
    service,
    ...(kind === "demenagement" ? { volume } : { weight }),
  }).toString();
  const target = kind === "demenagement" ? `/demenagement?${query}` : kind === "international" ? `/commande-internationale?${query}` : `/devis?${query}`;

  return (
    <div className={cn("glass rounded-card p-6 shadow-[0_30px_80px_-40px_rgba(2,6,23,0.9)] md:p-7", className)}>
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
          <Calculator className="size-5" />
        </span>
        <div>
          <h3 className="font-display text-base font-bold leading-none">
            {t({ fr: "Estimation immédiate", en: "Instant estimate" })}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {t({ fr: "Prix indicatif, sans engagement", en: "Indicative price, no commitment" })}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label={t({ fr: "Type d'envoi", en: "Shipment type" })}>
          <Select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
            {KINDS.map((k) => (
              <option key={k.id} value={k.id}>
                {t(k)}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={t({ fr: "Destination", en: "Destination" })}>
          <Select
            value={zone}
            onChange={(e) => setZone(e.target.value as NonNullable<EstimateInput["zone"]>)}
            disabled={options.isLoading}
          >
            {(options.data?.zones ?? []).map((z) => (
              <option key={z.id} value={z.id}>
                {t(z.label)}
              </option>
            ))}
          </Select>
        </Field>

        {kind === "demenagement" ? (
          <Field label={t({ fr: "Volume estimé (m³)", en: "Estimated volume (m³)" })}>
            <Input
              type="number"
              min={1}
              max={200}
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              inputMode="decimal"
            />
          </Field>
        ) : (
          <Field label={t({ fr: "Poids (kg)", en: "Weight (kg)" })}>
            <Input
              type="number"
              min={0.5}
              step={0.5}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              inputMode="decimal"
            />
          </Field>
        )}

        <Field label={t({ fr: "Formule", en: "Service level" })}>
          <Select
            value={service}
            onChange={(e) => setService(e.target.value as NonNullable<EstimateInput["service"]>)}
            disabled={options.isLoading}
          >
            {(options.data?.services ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {t(s.label)}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-primary/25 bg-primary/[0.07] p-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t({ fr: "À partir de", en: "From" })}
          </p>
          <p className="font-display text-4xl font-extrabold text-primary">
            {estimate.isLoading && total === undefined ? (
              <Loader2 className="size-8 animate-spin" />
            ) : (
              money(total ?? 0, lang)
            )}
          </p>
          {estimate.data ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
              <Clock className="size-3.5" />
              {t({ fr: "Délai estimé", en: "Estimated transit" })} : {estimate.data.etaDays[0]}–
              {estimate.data.etaDays[1]} {t({ fr: "jours", en: "days" })}
            </p>
          ) : null}
        </div>
        <Link
          to={target}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
        >
          {t({ fr: "Devis détaillé", en: "Detailed quote" })}
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {estimate.data && estimate.data.breakdown.length > 0 ? (
        <ul className="mt-4 space-y-1.5 text-xs text-muted">
          {estimate.data.breakdown.slice(0, 4).map((line) => (
            <li key={line.key} className="flex justify-between gap-4">
              <span>{t(line.label)}</span>
              <span className="tabular-nums text-foreground">{money(line.amount, lang)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
