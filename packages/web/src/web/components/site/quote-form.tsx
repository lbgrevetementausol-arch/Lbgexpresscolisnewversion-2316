import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { AlertTriangle, ArrowRight, Clock, Loader2, ShieldCheck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { money } from "../../lib/format";
import { trackLead } from "../../lib/pixels";
import { useCreateQuote, useEstimate, useQuoteOptions, type EstimateInput } from "../../queries/quotes";
import { AddressInput } from "./address-input";
import { Checkbox, Field, Input, Select, Textarea } from "./field";
import { Card } from "./section";

export type QuoteVariant = "colis" | "demenagement" | "international";

type Kind = NonNullable<EstimateInput["kind"]>;
type Zone = NonNullable<EstimateInput["zone"]>;
type Service = NonNullable<EstimateInput["service"]>;

const num = (v: string) => Number(v.replace(",", ".")) || 0;

function useParams() {
  const search = typeof window === "undefined" ? "" : window.location.search;
  return useMemo(() => new URLSearchParams(search), [search]);
}

/**
 * Formulaire de devis partagé par /devis, /demenagement et /commande-internationale.
 * Le prix est recalculé en direct par la même fonction que le calculateur public.
 */
export function QuoteForm({ variant }: { variant: QuoteVariant }) {
  const { t, lang } = useI18n();
  const [, navigate] = useLocation();
  const options = useQuoteOptions();
  const params = useParams();

  const [kind, setKind] = useState<Kind>(
    variant === "colis" ? ((params.get("kind") as Kind) ?? "colis") : variant === "demenagement" ? "demenagement" : "international",
  );
  const [zone, setZone] = useState<Zone>(
    (params.get("zone") as Zone) ?? (variant === "international" ? "afrique" : "france"),
  );
  const [service, setService] = useState<Service>((params.get("service") as Service) ?? "standard");

  const [weight, setWeight] = useState(params.get("weight") ?? "5");
  const [length, setLength] = useState("40");
  const [width, setWidth] = useState("30");
  const [height, setHeight] = useState("30");
  const [volume, setVolume] = useState(params.get("volume") ?? "20");
  const [pieces, setPieces] = useState("1");
  const [floors, setFloors] = useState("0");
  const [elevator, setElevator] = useState(true);

  const [cartons, setCartons] = useState("0");
  const [hoist, setHoist] = useState(false);
  const [distanceKm, setDistanceKm] = useState("");

  const [insurance, setInsurance] = useState(variant === "international");
  const [declaredValue, setDeclaredValue] = useState("300");
  const [homePickup, setHomePickup] = useState(variant !== "colis");
  const [packing, setPacking] = useState(variant === "demenagement");
  const [fragile, setFragile] = useState(false);

  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [company, setCompany] = useState("");
  const [goodsDescription, setGoodsDescription] = useState("");
  const [message, setMessage] = useState("");

  const estimateInput = useMemo<EstimateInput>(
    () => ({
      kind,
      zone,
      service,
      weightKg: variant === "demenagement" ? num(volume) * 60 : num(weight),
      lengthCm: variant === "demenagement" ? undefined : num(length),
      widthCm: variant === "demenagement" ? undefined : num(width),
      heightCm: variant === "demenagement" ? undefined : num(height),
      volumeM3: variant === "demenagement" ? num(volume) : undefined,
      declaredValue: insurance ? num(declaredValue) : undefined,
      insurance,
      homePickup,
      packing,
      fragile,
      floors: num(floors),
      elevator,
      pieces: Math.max(1, num(pieces)),
      cartons: num(cartons) || undefined,
      hoist,
      distanceKm: num(distanceKm) || undefined,
    }),
    [
      kind, zone, service, variant, weight, length, width, height, volume, insurance,
      declaredValue, homePickup, packing, fragile, floors, elevator, pieces,
      cartons, hoist, distanceKm,
    ],
  );

  const estimate = useEstimate(estimateInput);
  const createQuote = useCreateQuote();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    createQuote.mutate(
      {
        ...estimateInput,
        customerName,
        customerEmail,
        customerPhone: customerPhone || undefined,
        company: company || undefined,
        fromAddress,
        toAddress,
        goodsDescription: goodsDescription || undefined,
        message: message || undefined,
        locale: lang,
      },
      {
        onSuccess: (data) => {
          trackLead({ value: data.total, content_name: `Devis ${kind} ${zone}`, ref: data.ref });
          navigate(`/paiement/${data.ref}`);
        },
      },
    );
  };

  const zones = options.data?.zones ?? [];
  const services = options.data?.services ?? [];

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.55fr_1fr] lg:items-start">
      <div className="space-y-6">
        {/* Trajet */}
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">{t({ fr: "1. Trajet", en: "1. Route" })}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field
              label={t({ fr: "Adresse d'enlèvement", en: "Pickup address" })}
              hint={t({ fr: "Autocomplétion Google", en: "Google autocomplete" })}
            >
              <AddressInput
                value={fromAddress}
                onChange={setFromAddress}
                required
                placeholder={t({ fr: "12 rue de Paris, 75001 Paris", en: "12 rue de Paris, 75001 Paris" })}
                country={variant === "international" ? undefined : "fr"}
              />
            </Field>
            <Field label={t({ fr: "Adresse de livraison", en: "Delivery address" })}>
              <AddressInput
                value={toAddress}
                onChange={setToAddress}
                required
                placeholder={
                  variant === "international"
                    ? t({ fr: "Cotonou, Bénin", en: "Cotonou, Benin" })
                    : t({ fr: "5 avenue Jean Jaurès, 69007 Lyon", en: "5 avenue Jean Jaurès, 69007 Lyon" })
                }
              />
            </Field>
            <Field label={t({ fr: "Zone de destination", en: "Destination zone" })}>
              <Select value={zone} onChange={(e) => setZone(e.target.value as Zone)} disabled={options.isLoading}>
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {t(z.label)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t({ fr: "Formule", en: "Service level" })}>
              <Select
                value={service}
                onChange={(e) => setService(e.target.value as Service)}
                disabled={options.isLoading}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {t(s.label)}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        {/* Marchandise */}
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">
            {variant === "demenagement"
              ? t({ fr: "2. Votre déménagement", en: "2. Your move" })
              : t({ fr: "2. Marchandise", en: "2. Goods" })}
          </h3>

          {variant === "colis" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t({ fr: "Type", en: "Type" })}>
                <Select value={kind} onChange={(e) => setKind(e.target.value as Kind)}>
                  <option value="colis">{t({ fr: "Colis", en: "Parcel" })}</option>
                  <option value="palette">{t({ fr: "Palette / fret", en: "Pallet / freight" })}</option>
                </Select>
              </Field>
              <Field label={t({ fr: "Poids (kg)", en: "Weight (kg)" })}>
                <Input type="number" min={0.5} step={0.5} value={weight} onChange={(e) => setWeight(e.target.value)} />
              </Field>
              <Field label={t({ fr: "Nombre de colis", en: "Number of parcels" })}>
                <Input type="number" min={1} max={200} value={pieces} onChange={(e) => setPieces(e.target.value)} />
              </Field>
              <Field
                label={t({ fr: "Dimensions (cm)", en: "Dimensions (cm)" })}
                hint={t({ fr: "L × l × H — poids volumétrique calculé", en: "L × W × H — volumetric weight applied" })}
              >
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" min={1} value={length} onChange={(e) => setLength(e.target.value)} />
                  <Input type="number" min={1} value={width} onChange={(e) => setWidth(e.target.value)} />
                  <Input type="number" min={1} value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
              </Field>
            </div>
          ) : null}

          {variant === "demenagement" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field
                label={t({ fr: "Volume estimé (m³)", en: "Estimated volume (m³)" })}
                hint={t({ fr: "Studio ≈ 12 m³ · T3 ≈ 30 m³ · maison ≈ 55 m³", en: "Studio ≈ 12 m³ · 3-room ≈ 30 m³ · house ≈ 55 m³" })}
              >
                <Input type="number" min={1} max={200} value={volume} onChange={(e) => setVolume(e.target.value)} />
              </Field>
              <Field label={t({ fr: "Nombre de lots / meubles lourds", en: "Heavy items / lots" })}>
                <Input type="number" min={1} max={200} value={pieces} onChange={(e) => setPieces(e.target.value)} />
              </Field>
              <Field label={t({ fr: "Étages (sans ascenseur)", en: "Floors (no elevator)" })}>
                <Input type="number" min={0} max={30} value={floors} onChange={(e) => setFloors(e.target.value)} />
              </Field>
              <div className="flex items-end">
                <Checkbox
                  checked={elevator}
                  onChange={setElevator}
                  label={t({ fr: "Ascenseur disponible", en: "Elevator available" })}
                  hint={t({ fr: "Décochez si portage à la main", en: "Uncheck if carried by hand" })}
                />
              </div>
              <Field
                label={t({ fr: "Cartons standards fournis", en: "Standard boxes supplied" })}
                hint={t({ fr: "4,50 € HT l'unité", en: "€4.50 excl. VAT each" })}
              >
                <Input type="number" min={0} max={500} value={cartons} onChange={(e) => setCartons(e.target.value)} />
              </Field>
              <Field
                label={t({ fr: "Distance approximative (km)", en: "Approximate distance (km)" })}
                hint={t({ fr: "Sert au tarif court rayon / longue distance", en: "Sets short-haul vs long-distance rate" })}
              >
                <Input
                  type="number"
                  min={0}
                  max={20000}
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="120"
                />
              </Field>
              <div className="flex items-end">
                <Checkbox
                  checked={hoist}
                  onChange={setHoist}
                  label={t({ fr: "Monte-meuble nécessaire", en: "Furniture hoist required" })}
                  hint={t({ fr: "Passage par fenêtre / balcon — 180 € HT", en: "Window / balcony access — €180 excl. VAT" })}
                />
              </div>
            </div>
          ) : null}

          {variant === "international" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label={t({ fr: "Poids total (kg)", en: "Total weight (kg)" })}>
                <Input type="number" min={0.5} step={0.5} value={weight} onChange={(e) => setWeight(e.target.value)} />
              </Field>
              <Field label={t({ fr: "Nombre de colis / cartons", en: "Parcels / boxes" })}>
                <Input type="number" min={1} max={200} value={pieces} onChange={(e) => setPieces(e.target.value)} />
              </Field>
              <Field label={t({ fr: "Dimensions du plus gros colis (cm)", en: "Largest parcel dimensions (cm)" })}>
                <div className="grid grid-cols-3 gap-2">
                  <Input type="number" min={1} value={length} onChange={(e) => setLength(e.target.value)} />
                  <Input type="number" min={1} value={width} onChange={(e) => setWidth(e.target.value)} />
                  <Input type="number" min={1} value={height} onChange={(e) => setHeight(e.target.value)} />
                </div>
              </Field>
              <Field
                label={t({ fr: "Valeur déclarée (€)", en: "Declared value (€)" })}
                hint={t({ fr: "Sert au calcul de l'assurance et aux douanes", en: "Used for insurance and customs" })}
              >
                <Input type="number" min={0} value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} />
              </Field>
            </div>
          ) : null}

          <div className="mt-5">
            <Field
              label={t({ fr: "Description du contenu", en: "Contents description" })}
              hint={t({ fr: "Obligatoire pour l'international (douanes)", en: "Required for international shipments (customs)" })}
            >
              <Textarea
                value={goodsDescription}
                onChange={(e) => setGoodsDescription(e.target.value)}
                placeholder={t({
                  fr: "Ex. 2 cartons de vêtements, 1 téléviseur 42 pouces…",
                  en: "e.g. 2 boxes of clothes, 1 42-inch TV…",
                })}
              />
            </Field>
          </div>
        </Card>

        {/* Options */}
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">{t({ fr: "3. Options", en: "3. Options" })}</h3>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Checkbox
              checked={homePickup}
              onChange={setHomePickup}
              label={t({ fr: "Enlèvement à domicile", en: "Home pickup" })}
              hint={t({ fr: "Nous venons chercher l'envoi", en: "We collect the shipment" })}
            />
            <Checkbox
              checked={packing}
              onChange={setPacking}
              label={t({ fr: "Emballage professionnel", en: "Professional packing" })}
              hint={t({ fr: "Cartons, film, protections fournis", en: "Boxes, wrap and protection included" })}
            />
            <Checkbox
              checked={fragile}
              onChange={setFragile}
              label={t({ fr: "Contenu fragile", en: "Fragile contents" })}
              hint={t({ fr: "Manipulation renforcée", en: "Extra careful handling" })}
            />
            <Checkbox
              checked={insurance}
              onChange={setInsurance}
              label={t({ fr: "Assurance ad valorem", en: "Ad valorem insurance" })}
              hint={t({
                fr: "0,7 % de la valeur déclarée (min. 8 € HT)",
                en: "0.7% of declared value (min. €8 excl. VAT)",
              })}
            />
          </div>
          {insurance && variant !== "international" ? (
            <div className="mt-4 max-w-xs">
              <Field label={t({ fr: "Valeur déclarée (€)", en: "Declared value (€)" })}>
                <Input type="number" min={0} value={declaredValue} onChange={(e) => setDeclaredValue(e.target.value)} />
              </Field>
            </div>
          ) : null}
          {variant === "colis" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t({ fr: "Étages sans ascenseur", en: "Floors without elevator" })}>
                <Input type="number" min={0} max={30} value={floors} onChange={(e) => setFloors(e.target.value)} />
              </Field>
              <div className="flex items-end">
                <Checkbox
                  checked={elevator}
                  onChange={setElevator}
                  label={t({ fr: "Ascenseur disponible", en: "Elevator available" })}
                />
              </div>
            </div>
          ) : null}
        </Card>

        {/* Coordonnées */}
        <Card hover={false}>
          <h3 className="font-display text-lg font-bold">{t({ fr: "4. Vos coordonnées", en: "4. Your details" })}</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <Field label={t({ fr: "Nom et prénom", en: "Full name" })}>
              <Input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input required type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
            </Field>
            <Field label={t({ fr: "Téléphone", en: "Phone" })}>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+33 6 …" />
            </Field>
            <Field label={t({ fr: "Société (optionnel)", en: "Company (optional)" })}>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} />
            </Field>
            <Field className="sm:col-span-2" label={t({ fr: "Précisions", en: "Additional details" })}>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
            </Field>
          </div>
        </Card>
      </div>

      {/* Récapitulatif collant */}
      <div className="lg:sticky lg:top-24">
        <Card hover={false} className="border-primary/30">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t({ fr: "Votre prix", en: "Your price" })}
          </p>
          <p className="mt-2 font-display text-[2.6rem] font-extrabold leading-none text-primary">
            {estimate.isLoading && !estimate.data ? (
              <Loader2 className="size-9 animate-spin" />
            ) : (
              money(estimate.data?.total ?? 0, lang)
            )}
          </p>
          {estimate.data ? (
            <>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted">
                <Clock className="size-4 text-primary" />
                {estimate.data.etaDays[0]}–{estimate.data.etaDays[1]} {t({ fr: "jours ouvrés", en: "working days" })}
              </p>
              <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
                {estimate.data.breakdown.map((line) => (
                  <li key={line.key} className="flex justify-between gap-4 text-muted">
                    <span>{t(line.label)}</span>
                    <span className="tabular-nums text-foreground">{money(line.amount, lang)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-muted">
                {t({
                  fr: `Poids taxable retenu : ${estimate.data.chargeableWeight} kg`,
                  en: `Chargeable weight: ${estimate.data.chargeableWeight} kg`,
                })}
              </p>
            </>
          ) : null}

          <button
            type="submit"
            disabled={createQuote.isPending}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
          >
            {createQuote.isPending ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <>
                {t({ fr: "Valider ma commande", en: "Confirm my order" })}
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          {createQuote.isError ? (
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
              fr: "Aucun prélèvement à cette étape. Vous recevez un numéro de suivi TRK dès la validation.",
              en: "No charge at this step. You get a TRK tracking number as soon as you confirm.",
            })}
          </p>
        </Card>
      </div>
    </form>
  );
}
