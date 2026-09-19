import { useState } from "react";
import { useLocation } from "wouter";
import { Truck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { trackLead } from "../../lib/pixels";
import { devisDetaille, PIECES_VOLUME, type DevisDetaille } from "../../lib/pricing-strategique";
import { useCreateStrategicQuote } from "../../queries/quotes";
import { AddressInput } from "./address-input";
import { Checkbox, Field, Input, Select } from "./field";
import { Card } from "./section";
import { CalcButton, ContactFields, DistanceField, PricePanel, toNumber, useRoute } from "./strategic-quote";
import { cn } from "@/lib/utils";

const ETAGES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/** Bloc adresse + étage + accessibilité, utilisé pour le départ et pour l'arrivée. */
function AdresseBloc({
  titre,
  value,
  onAddress,
  onPlace,
  etage,
  onEtage,
  ascenseur,
  onAscenseur,
  acces,
  onAcces,
  placeholder,
}: {
  titre: string;
  value: string;
  onAddress: (v: string) => void;
  onPlace: (p: { address: string; lat?: number; lng?: number }) => void;
  etage: string;
  onEtage: (v: string) => void;
  ascenseur: boolean;
  onAscenseur: (v: boolean) => void;
  acces: boolean;
  onAcces: (v: boolean) => void;
  placeholder: string;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-border bg-surface-2/40 p-5">
      <p className="font-display text-base font-bold">{titre}</p>
      <div className="mt-4 grid gap-4">
        <Field label={t({ fr: "Ville / adresse", en: "City / address" })}>
          <AddressInput
            required
            country="fr"
            value={value}
            onChange={onAddress}
            onPlace={onPlace}
            placeholder={placeholder}
          />
        </Field>
        <div className="grid gap-4">
          <Field label={t({ fr: "Étage", en: "Floor" })}>
            <Select value={etage} onChange={(e) => onEtage(e.target.value)}>
              {ETAGES.map((n) => (
                <option key={n} value={String(n)}>
                  {n === 0 ? t({ fr: "Rez-de-chaussée", en: "Ground floor" }) : `${n}${t({ fr: "ᵉ étage", en: "th floor" })}`}
                </option>
              ))}
            </Select>
          </Field>
          <div>
            <Checkbox
              checked={ascenseur}
              onChange={onAscenseur}
              label={t({ fr: "Ascenseur utilisable", en: "Usable elevator" })}
              hint={t({ fr: "Assez grand pour les cartons", en: "Large enough for boxes" })}
            />
          </div>
        </div>
        <Checkbox
          checked={acces}
          onChange={onAcces}
          label={t({ fr: "Accès difficile", en: "Difficult access" })}
          hint={t({
            fr: "Portage de plus de 30 m, rue piétonne, stationnement impossible devant l'entrée…",
            en: "Carry over 30 m, pedestrian street, no parking in front of the entrance…",
          })}
        />
      </div>
    </div>
  );
}

/**
 * Formulaire 3 — Déménagement, France métropolitaine, voie routière uniquement.
 * Champs propres à l'offre : deux adresses avec étage et accessibilité, volume en m³ ou par type de logement.
 */
export function FormDemenagement() {
  const { t, lang } = useI18n();
  const [, navigate] = useLocation();
  const route = useRoute();
  const create = useCreateStrategicQuote();

  const [etageDepart, setEtageDepart] = useState("0");
  const [ascenseurDepart, setAscenseurDepart] = useState(true);
  const [accesDepart, setAccesDepart] = useState(false);
  const [etageArrivee, setEtageArrivee] = useState("0");
  const [ascenseurArrivee, setAscenseurArrivee] = useState(true);
  const [accesArrivee, setAccesArrivee] = useState(false);

  const [modeVolume, setModeVolume] = useState<"logement" | "m3">("logement");
  const [logement, setLogement] = useState<string>("t2");
  const [volume, setVolume] = useState("22");
  const [result, setResult] = useState<DevisDetaille | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const reset = () => setResult(null);

  const volumeM3 =
    modeVolume === "m3"
      ? toNumber(volume)
      : (PIECES_VOLUME.find((p) => p.id === logement)?.m3 ?? 0);
  const km = toNumber(route.km);
  const etagesSansAscenseur =
    (ascenseurDepart ? 0 : toNumber(etageDepart)) + (ascenseurArrivee ? 0 : toNumber(etageArrivee));
  const accesDifficile = accesDepart || accesArrivee;
  const pret = route.from.address.length > 2 && route.to.address.length > 2 && km > 0 && volumeM3 > 0;

  const calculer = () => {
    if (!pret) return;
    setResult(
      devisDetaille("demenagement", {
        distance: km,
        volumeM3,
        etagesSansAscenseur,
        accesDifficile,
      }),
    );
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    create.mutate(
      {
        typeService: "demenagement",
        fromAddress: `${route.from.address} — ${t({ fr: "étage", en: "floor" })} ${etageDepart}${ascenseurDepart ? "" : t({ fr: " sans ascenseur", en: " no elevator" })}`,
        toAddress: `${route.to.address} — ${t({ fr: "étage", en: "floor" })} ${etageArrivee}${ascenseurArrivee ? "" : t({ fr: " sans ascenseur", en: " no elevator" })}`,
        distanceKm: km,
        volumeM3,
        etagesSansAscenseur,
        accesDifficile,
        customerName: name,
        customerEmail: email,
        customerPhone: phone || undefined,
        message: message || undefined,
        locale: lang,
      },
      {
        onSuccess: (data) => {
          trackLead({ value: data.total, content_name: "Déménagement", ref: data.ref });
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
            {t({ fr: "1. Départ et arrivée", en: "1. Origin and destination" })}
          </h3>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <AdresseBloc
              titre={t({ fr: "Logement de départ", en: "Current home" })}
              value={route.from.address}
              onAddress={(v) => {
                route.setFrom({ address: v });
                reset();
              }}
              onPlace={(p) => {
                route.onFrom(p);
                reset();
              }}
              etage={etageDepart}
              onEtage={(v) => {
                setEtageDepart(v);
                reset();
              }}
              ascenseur={ascenseurDepart}
              onAscenseur={(v) => {
                setAscenseurDepart(v);
                reset();
              }}
              acces={accesDepart}
              onAcces={(v) => {
                setAccesDepart(v);
                reset();
              }}
              placeholder={t({ fr: "12 rue de Paris, 75001 Paris", en: "12 rue de Paris, 75001 Paris" })}
            />
            <AdresseBloc
              titre={t({ fr: "Nouveau logement", en: "New home" })}
              value={route.to.address}
              onAddress={(v) => {
                route.setTo({ address: v });
                reset();
              }}
              onPlace={(p) => {
                route.onTo(p);
                reset();
              }}
              etage={etageArrivee}
              onEtage={(v) => {
                setEtageArrivee(v);
                reset();
              }}
              ascenseur={ascenseurArrivee}
              onAscenseur={(v) => {
                setAscenseurArrivee(v);
                reset();
              }}
              acces={accesArrivee}
              onAcces={(v) => {
                setAccesArrivee(v);
                reset();
              }}
              placeholder={t({ fr: "5 avenue Jean Jaurès, 69007 Lyon", en: "5 avenue Jean Jaurès, 69007 Lyon" })}
            />
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <DistanceField
              km={route.km}
              kmAuto={route.kmAuto}
              onChange={(v) => {
                route.setKmManual(v);
                reset();
              }}
            />
            <Field
              label={t({ fr: "Mode de transport", en: "Transport mode" })}
              hint={t({
                fr: "Déménagement assuré par la route, France métropolitaine.",
                en: "Moves are carried out by road, mainland France.",
              })}
            >
              <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2/40 px-4 py-3 text-sm text-muted">
                <Truck className="size-4 text-primary" />
                {t({ fr: "Voie routière (France métropolitaine)", en: "Road (mainland France)" })}
              </div>
            </Field>
          </div>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">{t({ fr: "2. Volume à déménager", en: "2. Volume to move" })}</h3>
          <div className="mt-5 flex flex-wrap gap-2">
            {(
              [
                { id: "logement" as const, label: { fr: "Par type de logement", en: "By home type" } },
                { id: "m3" as const, label: { fr: "Je connais mon volume", en: "I know my volume" } },
              ]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                aria-pressed={modeVolume === opt.id}
                onClick={() => {
                  setModeVolume(opt.id);
                  reset();
                }}
                className={cn(
                  "rounded-xl border px-3.5 py-2.5 text-sm font-medium transition",
                  modeVolume === opt.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-surface-2/60 text-muted hover:border-primary/40",
                )}
              >
                {t(opt.label)}
              </button>
            ))}
          </div>

          {modeVolume === "logement" ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {PIECES_VOLUME.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={logement === p.id}
                  onClick={() => {
                    setLogement(p.id);
                    reset();
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    logement === p.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-surface-2/60 hover:border-primary/40",
                  )}
                >
                  <span className="block text-sm font-semibold">{t(p.label)}</span>
                  <span className="mt-1 block font-display text-lg font-extrabold text-primary">≈ {p.m3} m³</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5 max-w-xs">
              <Field
                label={t({ fr: "Volume (m³)", en: "Volume (m³)" })}
                hint={t({
                  fr: "Visite technique gratuite au-delà de 30 m³.",
                  en: "Free technical survey above 30 m³.",
                })}
              >
                <Input
                  type="number"
                  min={1}
                  max={200}
                  value={volume}
                  onChange={(e) => {
                    setVolume(e.target.value);
                    reset();
                  }}
                />
              </Field>
            </div>
          )}

          <div className="mt-6">
            <CalcButton
              label={t({ fr: "Obtenir mon devis Déménagement", en: "Get my moving quote" })}
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
        eyebrow={t({ fr: "Devis déménagement", en: "Moving quote" })}
        submitLabel={t({ fr: "Valider ma demande", en: "Confirm my request" })}
        pending={create.isPending}
        error={create.isError}
        note={t({
          fr: "Volume, distance, étages et accessibilité : tout est pris en compte dans le montant affiché.",
          en: "Volume, distance, floors and access: all factored into the amount shown.",
        })}
      />
    </form>
  );
}
