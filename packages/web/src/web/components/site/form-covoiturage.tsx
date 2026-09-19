import { useState } from "react";
import { useLocation } from "wouter";
import { Info, Package } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { trackLead } from "../../lib/pixels";
import {
  COVOITURAGE_MAX_KG,
  COVOITURAGE_SEUIL_KG,
  COVOITURAGE_SUPPLEMENT_PAR_KG,
  devisDetaille,
  GABARITS,
  type DevisDetaille,
  type GabaritId,
} from "../../lib/pricing-strategique";
import { useCreateStrategicQuote } from "../../queries/quotes";
import { AddressInput } from "./address-input";
import { Field, Input } from "./field";
import { Card } from "./section";
import { CalcButton, ContactFields, DistanceField, PricePanel, toNumber, useRoute } from "./strategic-quote";
import { cn } from "@/lib/utils";

/**
 * Formulaire 1 — Covoiturage de colis, France métropolitaine uniquement.
 * Champs propres à l'offre : villes françaises, gabarit visuel, poids sans limite de gabarit
 * jusqu'à 100 kg (supplément au kilo au-delà de 10 kg), devis sur mesure au-delà.
 */
export function FormCovoiturage() {
  const { t, lang } = useI18n();
  const [, navigate] = useLocation();
  const route = useRoute();
  const create = useCreateStrategicQuote();

  const [gabarit, setGabarit] = useState<GabaritId>("moyen");
  const [poids, setPoids] = useState("4");
  const [result, setResult] = useState<DevisDetaille | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const km = toNumber(route.km);
  const poidsNum = toNumber(poids);
  const horsGabarit = poidsNum > COVOITURAGE_MAX_KG;
  const pret = route.from.address.length > 2 && route.to.address.length > 2 && km > 0 && poidsNum > 0;

  const reset = () => setResult(null);

  const choisirGabarit = (id: GabaritId) => {
    const g = GABARITS.find((x) => x.id === id);
    setGabarit(id);
    if (g) setPoids(String(g.poidsDefaut));
    reset();
  };

  const calculer = () => {
    if (!pret || horsGabarit) return;
    setResult(devisDetaille("covoiturage", { distance: km, poids: poidsNum }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    create.mutate(
      {
        typeService: "covoiturage",
        fromAddress: route.from.address,
        toAddress: route.to.address,
        distanceKm: km,
        weightKg: poidsNum,
        gabarit,
        customerFirstName: firstName,
        customerLastName: lastName,
        customerEmail: email,
        customerPhone: phone,
        message: message || undefined,
        locale: lang,
      },
      {
        onSuccess: (data) => {
          trackLead({ value: data.total, content_name: "Covoiturage de colis", ref: data.ref });
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
            {t({ fr: "1. Votre trajet en France", en: "1. Your route in France" })}
          </h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t({ fr: "Ville de départ", en: "Departure city" })}>
              <AddressInput
                required
                country="fr"
                cityOnly
                value={route.from.address}
                onChange={(v) => {
                  route.setFrom({ address: v });
                  reset();
                }}
                onPlace={(p) => {
                  route.onFrom(p);
                  reset();
                }}
                placeholder={t({ fr: "Paris", en: "Paris" })}
              />
            </Field>
            <Field label={t({ fr: "Ville d'arrivée", en: "Arrival city" })}>
              <AddressInput
                required
                country="fr"
                cityOnly
                value={route.to.address}
                onChange={(v) => {
                  route.setTo({ address: v });
                  reset();
                }}
                onPlace={(p) => {
                  route.onTo(p);
                  reset();
                }}
                placeholder={t({ fr: "Lille", en: "Lille" })}
              />
            </Field>
            <DistanceField
              km={route.km}
              kmAuto={route.kmAuto}
              onChange={(v) => {
                route.setKmManual(v);
                reset();
              }}
            />
          </div>
          <p className="mt-4 flex items-start gap-2 text-xs text-muted">
            <Info className="mt-0.5 size-4 shrink-0 text-primary" />
            {t({
              fr: "Offre réservée à la France métropolitaine. Pour un envoi vers l'étranger, utilisez le formulaire Fret international.",
              en: "This offer covers mainland France only. For shipments abroad, use the international freight form.",
            })}
          </p>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">{t({ fr: "2. Votre colis", en: "2. Your parcel" })}</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {GABARITS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => choisirGabarit(g.id)}
                aria-pressed={gabarit === g.id}
                className={cn(
                  "rounded-xl border p-4 text-left transition",
                  gabarit === g.id
                    ? "border-primary bg-primary/10"
                    : "border-border bg-surface-2/60 hover:border-primary/40",
                )}
              >
                <Package
                  className={cn(
                    "size-5",
                    g.id === "petit" && "size-4",
                    g.id === "grand" && "size-7",
                    g.id === "hors-norme" && "size-8",
                    gabarit === g.id ? "text-primary" : "text-muted",
                  )}
                />
                <span className="mt-3 block font-display text-base font-bold">{t(g.label)}</span>
                <span className="mt-1 block text-xs leading-relaxed text-muted">{t(g.exemple)}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 max-w-xs">
            <Field
              label={t({ fr: "Poids réel (kg)", en: "Actual weight (kg)" })}
              hint={t({
                fr: `Pas de limite de gabarit : jusqu'à ${COVOITURAGE_SEUIL_KG} kg inclus au tarif standard, puis ${COVOITURAGE_SUPPLEMENT_PAR_KG.toFixed(2).replace(".", ",")} € par kilo supplémentaire jusqu'à ${COVOITURAGE_MAX_KG} kg.`,
                en: `No size cap: up to ${COVOITURAGE_SEUIL_KG} kg at the standard rate, then €${COVOITURAGE_SUPPLEMENT_PAR_KG.toFixed(2)} per extra kilo up to ${COVOITURAGE_MAX_KG} kg.`,
              })}
            >
              <Input
                type="number"
                min={0.1}
                step={0.1}
                max={COVOITURAGE_MAX_KG}
                value={poids}
                onChange={(e) => {
                  setPoids(e.target.value);
                  reset();
                }}
              />
            </Field>
          </div>
          {horsGabarit ? (
            <p className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed">
              {t({
                fr: `Au-delà de ${COVOITURAGE_MAX_KG} kg, le colis sort du calcul automatique : demandez un devis sur mesure, nous le traitons en fret — sans limite de poids.`,
                en: `Above ${COVOITURAGE_MAX_KG} kg the parcel leaves the instant calculator: ask for a custom quote, we handle it as freight — with no weight limit.`,
              })}{" "}
              <a href="/devis" className="font-semibold text-primary underline">
                {t({ fr: "Devis sur mesure", en: "Custom quote" })}
              </a>
            </p>
          ) : null}
          <div className="mt-6">
            <CalcButton
              label={t({ fr: "Calculer mon tarif Covoiturage", en: "Calculate my ride-share price" })}
              done={result !== null}
              disabled={!pret || horsGabarit}
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
        eyebrow={t({ fr: "Tarif covoiturage", en: "Ride-share price" })}
        submitLabel={t({ fr: "Valider mon envoi", en: "Confirm my shipment" })}
        pending={create.isPending}
        error={create.isError}
        note={t({
          fr: "Renseignez les deux villes et le gabarit, puis lancez le calcul : prix ferme, dès 8,99 € sur les trajets courts.",
          en: "Enter both cities and the parcel size, then run the calculation: firm price, from €8.99 on short runs.",
        })}
      />
    </form>
  );
}
