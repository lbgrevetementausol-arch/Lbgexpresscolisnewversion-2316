import { useState } from "react";
import { useLocation } from "wouter";
import { Info, Plane, Ship } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { trackLead } from "../../lib/pixels";
import {
  devisDetaille,
  PAYS_INTERNATIONAL,
  type DevisDetaille,
  type ModeTransport,
} from "../../lib/pricing-strategique";
import { useCreateStrategicQuote } from "../../queries/quotes";
import { AddressInput } from "./address-input";
import { Field, Input, Textarea } from "./field";
import { Card } from "./section";
import { CalcButton, ContactFields, PricePanel, toNumber } from "./strategic-quote";
import { cn } from "@/lib/utils";

const MODES: {
  id: ModeTransport;
  icon: typeof Plane;
  label: { fr: string; en: string };
  desc: { fr: string; en: string };
}[] = [
  {
    id: "avion",
    icon: Plane,
    label: { fr: "Avion cargo / GP", en: "Air cargo / GP" },
    desc: {
      fr: "5 à 10 jours, dédouanement inclus à l'agence locale (Cotonou, Bamako, Lomé). Facturé au kilo.",
      en: "5 to 10 days, clearance included at the local agency (Cotonou, Bamako, Lomé). Priced per kilo.",
    },
  },
  {
    id: "maritime",
    icon: Ship,
    label: { fr: "Maritime groupage", en: "Sea groupage" },
    desc: {
      fr: "30 à 45 jours, forfait par carton standard (≈ 60 × 40 × 40 cm). Formalités réglées au port d'arrivée.",
      en: "30 to 45 days, flat rate per standard box (≈ 60 × 40 × 40 cm). Formalities settled at the arrival port.",
    },
  },
];

/**
 * Formulaire 2 — Fret international vers le Bénin, le Mali et le Togo.
 * Champs propres à l'offre : pays de destination, mode aérien/maritime, nature de la marchandise.
 */
export function FormInternational() {
  const { t, lang } = useI18n();
  const [, navigate] = useLocation();
  const create = useCreateStrategicQuote();

  const [depart, setDepart] = useState("");
  const [pays, setPays] = useState<string>("benin");
  const [autrePays, setAutrePays] = useState("");
  const [mode, setMode] = useState<ModeTransport>("avion");
  const [poids, setPoids] = useState("10");
  const [cartons, setCartons] = useState("1");
  const [nature, setNature] = useState("");
  const [result, setResult] = useState<DevisDetaille | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const paysConnu = PAYS_INTERNATIONAL.find((p) => p.id === pays);
  const destination = paysConnu ? `${paysConnu.label} (${paysConnu.agence})` : autrePays;
  const poidsNum = toNumber(poids);
  const cartonsNum = Math.max(1, Math.round(toNumber(cartons)));
  const reset = () => setResult(null);

  const pret =
    depart.length > 2 &&
    destination.length > 2 &&
    nature.trim().length > 2 &&
    (mode === "avion" ? poidsNum > 0 : cartonsNum > 0);

  const calculer = () => {
    if (!pret) return;
    setResult(
      devisDetaille("international", {
        modeTransport: mode,
        poids: poidsNum,
        nombreCartons: cartonsNum,
      }),
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    create.mutate(
      {
        typeService: "international",
        fromAddress: depart,
        toAddress: destination,
        modeTransport: mode,
        weightKg: mode === "avion" ? poidsNum : undefined,
        cartons: mode === "maritime" ? cartonsNum : undefined,
        pays: paysConnu ? paysConnu.id : autrePays,
        goodsDescription: nature,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        message: message || undefined,
        locale: lang,
      },
      {
        onSuccess: (data) => {
          trackLead({ value: data.total, content_name: `Fret international ${mode}`, ref: data.ref });
          navigate(`/paiement/${data.ref}`);
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
      <div className="space-y-6">
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">
            {t({ fr: "1. Départ et destination", en: "1. Origin and destination" })}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t({ fr: "Ville de départ (France)", en: "Departure city (France)" })}>
              <AddressInput
                required
                country="fr"
                cityOnly
                value={depart}
                onChange={(v) => {
                  setDepart(v);
                  reset();
                }}
                placeholder={t({ fr: "Paris", en: "Paris" })}
              />
            </Field>
            <Field label={t({ fr: "Pays de destination", en: "Destination country" })}>
              <div className="flex flex-wrap gap-2">
                {PAYS_INTERNATIONAL.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    aria-pressed={pays === p.id}
                    onClick={() => {
                      setPays(p.id);
                      reset();
                    }}
                    className={cn(
                      "rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
                      pays === p.id
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-surface-2/60 text-muted hover:border-primary/40",
                    )}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  aria-pressed={pays === "autre"}
                  onClick={() => {
                    setPays("autre");
                    reset();
                  }}
                  className={cn(
                    "rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
                    pays === "autre"
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-surface-2/60 text-muted hover:border-primary/40",
                  )}
                >
                  {t({ fr: "Autre pays", en: "Other country" })}
                </button>
              </div>
            </Field>
          </div>
          {pays === "autre" ? (
            <div className="mt-4 max-w-sm">
              <Field
                label={t({ fr: "Précisez le pays et la ville", en: "Specify country and city" })}
                hint={t({
                  fr: "Hors Bénin, Mali et Togo, le tarif affiché reste indicatif : nous confirmons sous 24 h ouvrées.",
                  en: "Outside Benin, Mali and Togo the price shown is indicative: we confirm within 1 business day.",
                })}
              >
                <Input
                  value={autrePays}
                  onChange={(e) => {
                    setAutrePays(e.target.value);
                    reset();
                  }}
                  placeholder={t({ fr: "Abidjan, Côte d'Ivoire", en: "Abidjan, Ivory Coast" })}
                />
              </Field>
            </div>
          ) : null}
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">
            {t({ fr: "2. Mode de transport", en: "2. Shipping mode" })}
          </h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={mode === m.id}
                onClick={() => {
                  setMode(m.id);
                  reset();
                }}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  mode === m.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2/60 hover:border-primary/40",
                )}
              >
                <span className="flex items-center gap-2">
                  <m.icon className={cn("size-5", mode === m.id ? "text-primary" : "text-muted")} />
                  <span className="font-display text-base font-bold">{t(m.label)}</span>
                </span>
                <span className="mt-2 block text-xs leading-relaxed text-muted">{t(m.desc)}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {mode === "avion" ? (
              <Field
                label={t({ fr: "Poids (kg)", en: "Weight (kg)" })}
                hint={t({ fr: "9,50 € / kg, dédouanement inclus.", en: "€9.50 / kg, clearance included." })}
              >
                <Input
                  type="number"
                  min={1}
                  step={0.5}
                  value={poids}
                  onChange={(e) => {
                    setPoids(e.target.value);
                    reset();
                  }}
                />
              </Field>
            ) : (
              <Field
                label={t({ fr: "Nombre de cartons", en: "Number of boxes" })}
                hint={t({
                  fr: "Carton standard ≈ 60 × 40 × 40 cm, 46 € l'unité.",
                  en: "Standard box ≈ 60 × 40 × 40 cm, €46 each.",
                })}
              >
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={cartons}
                  onChange={(e) => {
                    setCartons(e.target.value);
                    reset();
                  }}
                />
              </Field>
            )}
            <Field
              className="sm:col-span-2"
              label={t({ fr: "Nature de la marchandise", en: "Nature of goods" })}
              hint={t({
                fr: "Obligatoire pour les douanes. Aucun produit interdit ou dangereux.",
                en: "Required by customs. No prohibited or dangerous goods.",
              })}
            >
              <Textarea
                value={nature}
                onChange={(e) => {
                  setNature(e.target.value);
                  reset();
                }}
                placeholder={t({
                  fr: "Ex. 2 cartons de vêtements neufs, 1 machine à coudre…",
                  en: "e.g. 2 boxes of new clothes, 1 sewing machine…",
                })}
              />
            </Field>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            {t({
              fr: "Délais indicatifs : 5 à 10 jours en aérien, 30 à 45 jours en maritime. Ce sont des délais cibles, pas des garanties.",
              en: "Indicative lead times: 5–10 days by air, 30–45 days by sea. These are targets, not guarantees.",
            })}
          </p>

          <div className="mt-6">
            <CalcButton
              label={t({ fr: "Estimer le Fret International", en: "Estimate international freight" })}
              done={result !== null}
              disabled={!pret}
              onClick={calculer}
            />
          </div>
        </Card>

        {result ? (
          <Card hover={false}>
            <h3 className="font-display text-lg font-bold">
              {t({ fr: "3. Vos coordonnées", en: "3. Your details" })}
            </h3>
            <ContactFields
              name={name}
              email={email}
              phone={phone}
              message={message}
              onName={setName}
              onEmail={setEmail}
              onPhone={setPhone}
              onMessage={setMessage}
            />
          </Card>
        ) : null}
      </div>

      <PricePanel
        result={result}
        eyebrow={t({ fr: "Tarif international", en: "International price" })}
        submitLabel={t({ fr: "Valider mon expédition", en: "Confirm my shipment" })}
        pending={create.isPending}
        error={create.isError}
        note={t({
          fr: "10 kg en avion : 94,99 € dédouanement inclus. 1 carton en maritime : 45,99 €. Lancez le calcul pour votre envoi.",
          en: "10 kg by air: €94.99 clearance included. One box by sea: €45.99. Run the calculation for your shipment.",
        })}
      />
    </form>
  );
}
