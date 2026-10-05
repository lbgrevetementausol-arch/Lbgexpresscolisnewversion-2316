import { useCallback, useState } from "react";
import { AlertTriangle, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { money } from "../../lib/format";
import { distanceRoutiereKm, type DevisDetaille } from "../../lib/pricing-strategique";
import { Field, Input, Textarea } from "./field";
import { Card } from "./section";

/** Coordonnées d'une adresse choisie dans l'autocomplétion OpenStreetMap. */
export type PlacePoint = { address: string; lat?: number; lng?: number };

/**
 * Deux adresses + la distance routière estimée entre elles.
 * Sans coordonnées (saisie libre, clé Maps absente), la distance reste modifiable à la main.
 */
export function useRoute() {
  const [from, setFrom] = useState<PlacePoint>({ address: "" });
  const [to, setTo] = useState<PlacePoint>({ address: "" });
  const [km, setKm] = useState("");
  const [kmAuto, setKmAuto] = useState(false);

  const recompute = useCallback((a: PlacePoint, b: PlacePoint) => {
    if (a.lat != null && a.lng != null && b.lat != null && b.lng != null) {
      const d = distanceRoutiereKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng });
      setKm(String(d));
      setKmAuto(true);
    }
  }, []);

  const onFrom = useCallback(
    (p: PlacePoint) => {
      setFrom(p);
      recompute(p, to);
    },
    [recompute, to],
  );
  const onTo = useCallback(
    (p: PlacePoint) => {
      setTo(p);
      recompute(from, p);
    },
    [recompute, from],
  );

  const setKmManual = useCallback((v: string) => {
    setKm(v);
    setKmAuto(false);
  }, []);

  // Saisie libre d'une adresse : la distance auto-calculée n'est plus fiable → on l'efface.
  const typeFrom = useCallback(
    (p: PlacePoint) => {
      setFrom(p);
      if (kmAuto) {
        setKm("");
        setKmAuto(false);
      }
    },
    [kmAuto],
  );
  const typeTo = useCallback(
    (p: PlacePoint) => {
      setTo(p);
      if (kmAuto) {
        setKm("");
        setKmAuto(false);
      }
    },
    [kmAuto],
  );

  return { from, to, km, kmAuto, onFrom, onTo, setKmManual, setFrom: typeFrom, setTo: typeTo };
}

export const toNumber = (v: string) => Number(v.replace(",", ".")) || 0;

/** Bouton déclencheur du calcul, propre à chaque formulaire. */
export function CalcButton({
  label,
  done,
  disabled,
  onClick,
}: {
  label: string;
  done: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-50 sm:w-auto"
    >
      {done ? t({ fr: "Recalculer", en: "Recalculate" }) : label}
    </button>
  );
}

/** Champ distance partagé : auto-rempli par Google, corrigeable à la main. */
export function DistanceField({
  km,
  kmAuto,
  onChange,
}: {
  km: string;
  kmAuto: boolean;
  onChange: (v: string) => void;
}) {
  const { t } = useI18n();
  return (
    <Field
      label={t({ fr: "Distance estimée (km)", en: "Estimated distance (km)" })}
      hint={
        kmAuto
          ? t({
              fr: `≈ ${km} km estimés depuis les deux villes. Corrigez si votre trajet réel diffère.`,
              en: `≈ ${km} km estimated from both cities. Adjust it if your actual route differs.`,
            })
          : t({
              fr: "Choisissez les villes dans les suggestions pour le remplissage automatique, ou saisissez la distance.",
              en: "Pick both cities from the suggestions to fill this automatically, or type the distance.",
            })
      }
    >
      <Input
        type="number"
        min={1}
        max={5000}
        inputMode="numeric"
        value={km}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t({ fr: "Calculée automatiquement", en: "Filled automatically" })}
      />
    </Field>
  );
}

/** Coordonnées client — affichées une fois le prix calculé. */
export function ContactFields({
  firstName,
  lastName,
  email,
  phone,
  message,
  onFirstName,
  onLastName,
  onEmail,
  onPhone,
  onMessage,
}: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  message: string;
  onFirstName: (v: string) => void;
  onLastName: (v: string) => void;
  onEmail: (v: string) => void;
  onPhone: (v: string) => void;
  onMessage: (v: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <Field label={t({ fr: "Prénom *", en: "First name *" })}>
        <Input required value={firstName} onChange={(e) => onFirstName(e.target.value)} />
      </Field>
      <Field label={t({ fr: "Nom *", en: "Last name *" })}>
        <Input required value={lastName} onChange={(e) => onLastName(e.target.value)} />
      </Field>
      <Field label={t({ fr: "Adresse e-mail *", en: "Email address *" })}>
        <Input required type="email" value={email} onChange={(e) => onEmail(e.target.value)} />
      </Field>
      <Field label={t({ fr: "Téléphone joignable *", en: "Reachable phone *" })}>
        <Input
          required
          type="tel"
          value={phone}
          onChange={(e) => onPhone(e.target.value)}
          placeholder="+33 6 …"
        />
      </Field>
      <Field
        className="sm:col-span-2"
        label={t({ fr: "Date souhaitée et précisions", en: "Preferred date and details" })}
      >
        <Textarea
          value={message}
          onChange={(e) => onMessage(e.target.value)}
          placeholder={t({
            fr: "Ex. enlèvement le 12 octobre en matinée, colis prêt, contact sur place…",
            en: "e.g. pickup on 12 October in the morning, parcel ready, on-site contact…",
          })}
        />
      </Field>
    </div>
  );
}

/** Panneau de prix commun aux trois formulaires. */
export function PricePanel({
  result,
  eyebrow,
  submitLabel,
  pending,
  error,
  note,
}: {
  result: DevisDetaille | null;
  eyebrow: string;
  submitLabel: string;
  pending: boolean;
  error: boolean;
  note?: string;
}) {
  const { t, lang } = useI18n();

  return (
    <Card hover={false} className="border-primary/30 lg:sticky lg:top-24">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">{eyebrow}</p>
      {result ? (
        <>
          <p className="mt-2 font-display text-[2.6rem] font-extrabold leading-none text-primary">
            {money(result.total, lang)}
            <span className="ml-2 align-middle text-base font-semibold text-muted">{t({ fr: "TTC", en: "incl. VAT" })}</span>
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
            <Clock className="size-4 text-primary" />
            {result.etaDays[0]}–{result.etaDays[1]} {t({ fr: "jours", en: "days" })}
          </p>
          <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
            {result.lines.map((line) => (
              <li key={line.key} className="flex justify-between gap-4 text-muted">
                <span>{t(line.label)}</span>
                <span className="tabular-nums text-foreground">{money(line.amount, lang)}</span>
              </li>
            ))}
          </ul>
          {result.plancher ? (
            <p className="mt-4 text-xs text-muted">
              {t({
                fr: `Tarif minimum appliqué : ${money(result.total, lang)} TTC.`,
                en: `Minimum fare applied: ${money(result.total, lang)} incl. VAT.`,
              })}
            </p>
          ) : null}
          {result.estimation ? (
            <p className="mt-4 text-xs text-muted">
              {t({
                fr: "Prix ferme sous réserve que le volume et les accès soient conformes à votre déclaration. Visite technique gratuite au-delà de 30 m³ ; en dessous, sur demande.",
                en: "Firm price provided the volume and access match your description. Free technical survey above 30 m³; below that, on request.",
              })}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
          >
            {pending ? <Loader2 className="size-5 animate-spin" /> : submitLabel}
          </button>
          {error ? (
            <p className="mt-3 flex items-start gap-2 text-sm text-danger">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              {t({
                fr: "Vérifiez les champs obligatoires (adresses, nom, email valide).",
                en: "Please check the required fields (addresses, name, valid email).",
              })}
            </p>
          ) : null}
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            {t({
              fr: "Aucun prélèvement à cette étape. Vous recevez votre devis par e-mail, à accepter avant tout paiement.",
              en: "No charge at this step. You receive your quote by email, to accept before any payment.",
            })}
          </p>
        </>
      ) : (
        <>
          <p className="mt-2 font-display text-[2.6rem] font-extrabold leading-none text-muted/40">—</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {note ??
              t({
                fr: "Remplissez le formulaire puis lancez le calcul : le prix ferme s'affiche ici, détaillé ligne par ligne.",
                en: "Fill in the form then run the calculation: the firm price appears here, itemised.",
              })}
          </p>
        </>
      )}
    </Card>
  );
}
