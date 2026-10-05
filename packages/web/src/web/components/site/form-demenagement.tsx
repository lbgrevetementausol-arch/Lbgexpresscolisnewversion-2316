import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Truck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { trackFunnel, trackLead } from "../../lib/pixels";
import { devisDetaille, PIECES_VOLUME, TARIF } from "../../lib/pricing-strategique";
import { useCreateStrategicQuote } from "../../queries/quotes";
import { AddressInput } from "./address-input";
import { Checkbox, Field, Input, Select } from "./field";
import { Card } from "./section";
import { ContactFields, DistanceField, PricePanel, toNumber, useRoute } from "./strategic-quote";
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
            <Select
              value={etage}
              onChange={(e) => {
                onEtage(e.target.value);
                if (e.target.value === "0") onAscenseur(false);
              }}
            >
              {ETAGES.map((n) => (
                <option key={n} value={String(n)}>
                  {n === 0 ? t({ fr: "Rez-de-chaussée", en: "Ground floor" }) : `${n}${t({ fr: "ᵉ étage", en: "th floor" })}`}
                </option>
              ))}
            </Select>
          </Field>
          {Number(etage) > 0 ? (
          <div>
            <Checkbox
              checked={ascenseur}
              onChange={onAscenseur}
              label={t({ fr: "Ascenseur utilisable", en: "Usable elevator" })}
              hint={t({ fr: "Assez grand pour les cartons", en: "Large enough for boxes" })}
            />
          </div>
          ) : null}
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
  const [ascenseurDepart, setAscenseurDepart] = useState(false);
  const [accesDepart, setAccesDepart] = useState(false);
  const [etageArrivee, setEtageArrivee] = useState("0");
  const [ascenseurArrivee, setAscenseurArrivee] = useState(false);
  const [accesArrivee, setAccesArrivee] = useState(false);

  const [modeVolume, setModeVolume] = useState<"logement" | "m3">("logement");
  const [logement, setLogement] = useState<string>("");
  const [volume, setVolume] = useState("");
  const [date, setDate] = useState("");
  const [emballage, setEmballage] = useState(false);
  const [objets, setObjets] = useState<string[]>([]);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");


  const volumeM3 =
    modeVolume === "m3"
      ? toNumber(volume)
      : (PIECES_VOLUME.find((p) => p.id === logement)?.m3 ?? 0);
  const km = toNumber(route.km);
  const accesDifficile = accesDepart || accesArrivee;
  const adressesOk = route.from.address.length > 2 && route.to.address.length > 2;
  const pret = adressesOk && km > 0 && km <= 2000 && volumeM3 > 0;
  const options = {
    distance: km,
    volumeM3,
    etageDepart: toNumber(etageDepart),
    etageArrivee: toNumber(etageArrivee),
    ascenseurDepart,
    ascenseurArrivee,
    accesDifficile,
    emballage,
    objetsLourds: objets,
    date: date || undefined,
  };
  // Estimation en direct : recalculée à chaque changement (le serveur refait le même calcul).
  const result = useMemo(
    () => (pret ? devisDetaille("demenagement", options) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pret, JSON.stringify(options)],
  );

  // Étapes du tunnel (dataLayer), une seule fois chacune.
  const sent = useRef(new Set<string>());
  const step = (name: string, params: Record<string, string | number> = {}) => {
    if (sent.current.has(name)) return;
    sent.current.add(name);
    trackFunnel(name, { service: "demenagement", ...params });
  };
  useEffect(() => {
    if (adressesOk && km > 0) step("quote_step_address", { distance_km: km });
    if (volumeM3 > 0) step("quote_step_volume", { volume_m3: volumeM3 });
    if (result) step("quote_price_displayed", { value: result.total, currency: "EUR", volume_m3: volumeM3, distance_km: km });
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    const etage = (n: string, asc: boolean) =>
      `${t({ fr: "étage", en: "floor" })} ${n}${n !== "0" ? (asc ? t({ fr: " avec ascenseur", en: " with elevator" }) : t({ fr: " sans ascenseur", en: " no elevator" })) : ""}`;
    create.mutate(
      {
        typeService: "demenagement",
        fromAddress: `${route.from.address} — ${etage(etageDepart, ascenseurDepart)}`,
        toAddress: `${route.to.address} — ${etage(etageArrivee, ascenseurArrivee)}`,
        distanceKm: km,
        volumeM3,
        etageDepart: options.etageDepart,
        etageArrivee: options.etageArrivee,
        ascenseurDepart,
        ascenseurArrivee,
        accesDifficile,
        emballage,
        objetsLourds: objets,
        date: date || undefined,
        clientTotal: result.total,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerEmail: email,
        customerPhone: phone,
        message: message || undefined,
        locale: lang,
      },
      {
        onSuccess: (data) => {
          trackLead({
            value: data.total,
            currency: "EUR",
            content_name: "Déménagement",
            ref: data.ref,
            quote_id: data.ref,
            volume_m3: volumeM3,
            distance_km: km,
          });
          navigate(`/paiement/${data.ref}`);
        },
      },
    );
  };

  return (
    <form onSubmit={submit} onFocusCapture={() => step("quote_start")} className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
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
              }}
              onPlace={(p) => {
                route.onFrom(p);
              }}
              etage={etageDepart}
              onEtage={(v) => {
                setEtageDepart(v);
              }}
              ascenseur={ascenseurDepart}
              onAscenseur={(v) => {
                setAscenseurDepart(v);
              }}
              acces={accesDepart}
              onAcces={(v) => {
                setAccesDepart(v);
              }}
              placeholder={t({ fr: "12 rue de Paris, 75001 Paris", en: "12 rue de Paris, 75001 Paris" })}
            />
            <AdresseBloc
              titre={t({ fr: "Nouveau logement", en: "New home" })}
              value={route.to.address}
              onAddress={(v) => {
                route.setTo({ address: v });
              }}
              onPlace={(p) => {
                route.onTo(p);
              }}
              etage={etageArrivee}
              onEtage={(v) => {
                setEtageArrivee(v);
              }}
              ascenseur={ascenseurArrivee}
              onAscenseur={(v) => {
                setAscenseurArrivee(v);
              }}
              acces={accesArrivee}
              onAcces={(v) => {
                setAccesArrivee(v);
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
                  }}
                />
              </Field>
            </div>
          )}

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field
              label={t({ fr: "Date souhaitée", en: "Preferred date" })}
              hint={t({
                fr: "Juin–sept., fin de mois, vendredi et samedi : haute saison. Oct.–mars en semaine : tarif réduit.",
                en: "June–Sept., end of month, Friday and Saturday: peak season. Oct.–March midweek: reduced rate.",
              })}
            >
              <Input
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Checkbox
              checked={emballage}
              onChange={setEmballage}
              label={t({
                fr: `Emballage et cartons fournis (+${TARIF.demenagement.emballageParM3} €/m³)`,
                en: `Packing and boxes supplied (+€${TARIF.demenagement.emballageParM3}/m³)`,
              })}
            />
          </div>
          <fieldset className="mt-5">
            <legend className="text-sm font-medium">{t({ fr: "Objets lourds (forfait par objet)", en: "Heavy items (flat fee each)" })}</legend>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {TARIF.demenagement.objetsLourds.map((o) => (
                <Checkbox
                  key={o.id}
                  checked={objets.includes(o.id)}
                  onChange={(v) => setObjets((prev) => (v ? [...prev, o.id] : prev.filter((x) => x !== o.id)))}
                  label={`${t(o.label)} (+${o.prix} €)`}
                />
              ))}
            </div>
          </fieldset>
          {adressesOk && !(km > 0 && km <= 2000) ? (
            <p className="mt-4 text-sm text-danger">
              {t({
                fr: "Distance manquante ou invalide : choisissez les villes dans les suggestions ou saisissez la distance en km.",
                en: "Missing or invalid distance: pick the cities from the suggestions or type the distance in km.",
              })}
            </p>
          ) : null}
        </Card>

        {result ? (
          <Card hover={false}>
            <h3 className="font-display text-lg font-bold">
              {t({ fr: "3. Vos coordonnées", en: "3. Your details" })}
            </h3>
            <ContactFields
              firstName={firstName}
              lastName={lastName}
              email={email}
              phone={phone}
              message={message}
              onFirstName={setFirstName}
              onLastName={setLastName}
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
        submitLabel={t({ fr: "Recevoir mon devis", en: "Get my quote" })}
        pending={create.isPending}
        error={create.isError}
        note={t({
          fr: "Renseignez les deux adresses, la distance et le volume : l'estimation s'affiche ici en direct, détaillée ligne par ligne.",
          en: "Enter both addresses, the distance and the volume: the estimate appears here live, itemised.",
        })}
      />
    </form>
  );
}
