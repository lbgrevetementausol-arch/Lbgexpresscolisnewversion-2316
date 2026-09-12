import { useState } from "react";
import { Loader2, Truck, Users } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { Card } from "../site/section";
import { Field, Input, Select } from "../site/field";
import { useProToken } from "../../queries/admin";
import { useAssignJob, useCreateDriver, useProDrivers } from "../../queries/pro";
import { DriverApprovalsPanel, JobOffersPanel } from "./driver-approvals";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap";
const td = "px-4 py-3 text-sm align-top";

/** Livreurs + attribution des courses — fusionné depuis l'ancien espace /pro. */
export function DriversPanel() {
  const { t, lang } = useI18n();
  const token = useProToken(true);
  const code = token.data?.code ?? null;

  const drivers = useProDrivers(code);
  const createDriver = useCreateDriver();
  const assign = useAssignJob();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [city, setCity] = useState("");

  const [driverId, setDriverId] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [recipient, setRecipient] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [payout, setPayout] = useState("");

  if (!code) {
    return (
      <Card hover={false} className="text-sm text-muted">
        <Loader2 className="mr-2 inline size-4 animate-spin" />
        {t({ fr: "Chargement…", en: "Loading…" })}
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <DriverApprovalsPanel />
      <JobOffersPanel lang={lang} />

      <Card hover={false} className="overflow-hidden p-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h3 className="font-display text-base font-bold">
            {t({ fr: "Livreurs (comptes créés manuellement)", en: "Drivers (manually created)" })}
            <span className="ml-2 text-muted">({drivers.data?.length ?? 0})</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-surface-2/60">
              <tr>
                <th className={th}>{t({ fr: "Livreur", en: "Driver" })}</th>
                <th className={th}>{t({ fr: "Code", en: "Code" })}</th>
                <th className={th}>{t({ fr: "Véhicule", en: "Vehicle" })}</th>
                <th className={th}>{t({ fr: "Ville", en: "City" })}</th>
                <th className={th}>{t({ fr: "Actif", en: "Active" })}</th>
              </tr>
            </thead>
            <tbody>
              {(drivers.data ?? []).map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className={td}>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted">{d.email}</p>
                    {d.phone ? <p className="text-xs text-muted">{d.phone}</p> : null}
                  </td>
                  <td className={`${td} font-mono text-xs text-primary`}>{d.code}</td>
                  <td className={td}>{d.vehicle ?? "—"}</td>
                  <td className={td}>{d.city ?? "—"}</td>
                  <td className={td}>{d.active ? t({ fr: "Oui", en: "Yes" }) : t({ fr: "Non", en: "No" })}</td>
                </tr>
              ))}
              {(drivers.data ?? []).length === 0 ? (
                <tr>
                  <td className={`${td} text-muted`} colSpan={5}>
                    {t({ fr: "Aucun livreur enregistré.", en: "No driver recorded." })}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card hover={false}>
          <h3 className="font-display text-base font-bold">{t({ fr: "Ajouter un livreur", en: "Add a driver" })}</h3>
          <p className="mt-2 text-sm text-muted">
            {t({
              fr: "Le code d'accès à l'espace livreur (/livreur) est généré automatiquement.",
              en: "The driver-area (/livreur) access code is generated automatically.",
            })}
          </p>
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              createDriver.mutate(
                {
                  accessCode: code,
                  name,
                  email,
                  phone: phone || undefined,
                  vehicle: vehicle || undefined,
                  city: city || undefined,
                },
                {
                  onSuccess: () => {
                    setName("");
                    setEmail("");
                    setPhone("");
                    setVehicle("");
                    setCity("");
                  },
                },
              );
            }}
          >
            <Field label={t({ fr: "Nom", en: "Name" })}>
              <Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </Field>
            <Field label={t({ fr: "Téléphone", en: "Phone" })}>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Field>
            <Field label={t({ fr: "Véhicule", en: "Vehicle" })}>
              <Input value={vehicle} onChange={(e) => setVehicle(e.target.value)} placeholder="Fourgon 12 m³" />
            </Field>
            <Field label={t({ fr: "Ville", en: "City" })} className="sm:col-span-2">
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </Field>
            {createDriver.data ? (
              <p className="rounded-xl border border-success/40 bg-success/10 p-3 text-sm text-success sm:col-span-2">
                {t({ fr: "Livreur créé — code :", en: "Driver created — code:" })}{" "}
                <span className="font-mono font-bold">{createDriver.data.code}</span>
              </p>
            ) : null}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={createDriver.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
              >
                {createDriver.isPending ? <Loader2 className="size-4 animate-spin" /> : <Users className="size-4" />}
                {t({ fr: "Créer le livreur", en: "Create driver" })}
              </button>
            </div>
          </form>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-base font-bold">{t({ fr: "Assigner une course", en: "Assign a job" })}</h3>
          <p className="mt-2 text-sm text-muted">
            {t({
              fr: "La course apparaît immédiatement dans l'espace livreur, et chaque changement de statut alimente le suivi client.",
              en: "The job appears instantly in the driver area, and every status change feeds the customer tracking.",
            })}
          </p>
          <form
            className="mt-5 grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              assign.mutate(
                {
                  accessCode: code,
                  driverId: Number(driverId),
                  trackingNumber,
                  pickupAddress: pickup,
                  dropAddress: drop,
                  recipientName: recipient || undefined,
                  recipientPhone: recipientPhone || undefined,
                  payoutCents: payout ? Math.round(Number(payout) * 100) : undefined,
                },
                {
                  onSuccess: () => {
                    setTrackingNumber("");
                    setPickup("");
                    setDrop("");
                    setRecipient("");
                    setRecipientPhone("");
                    setPayout("");
                  },
                },
              );
            }}
          >
            <Field label={t({ fr: "Livreur", en: "Driver" })}>
              <Select required value={driverId} onChange={(e) => setDriverId(e.target.value)}>
                <option value="">{t({ fr: "Choisir…", en: "Select…" })}</option>
                {(drivers.data ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t({ fr: "Numéro de suivi", en: "Tracking number" })}>
              <Input
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                placeholder="TRK-20260828-XXXXXX"
              />
            </Field>
            <Field label={t({ fr: "Adresse d'enlèvement", en: "Pickup address" })} className="sm:col-span-2">
              <Input required value={pickup} onChange={(e) => setPickup(e.target.value)} />
            </Field>
            <Field label={t({ fr: "Adresse de livraison", en: "Drop-off address" })} className="sm:col-span-2">
              <Input required value={drop} onChange={(e) => setDrop(e.target.value)} />
            </Field>
            <Field label={t({ fr: "Destinataire", en: "Recipient" })}>
              <Input value={recipient} onChange={(e) => setRecipient(e.target.value)} />
            </Field>
            <Field label={t({ fr: "Téléphone destinataire", en: "Recipient phone" })}>
              <Input value={recipientPhone} onChange={(e) => setRecipientPhone(e.target.value)} />
            </Field>
            <Field label={t({ fr: "Rémunération livreur (€)", en: "Driver payout (€)" })}>
              <Input type="number" min={0} step="0.5" value={payout} onChange={(e) => setPayout(e.target.value)} />
            </Field>
            {assign.isError ? (
              <p className="text-sm text-danger sm:col-span-2">
                {t({ fr: "Assignation impossible. Vérifiez les champs.", en: "Assignment failed. Check the fields." })}
              </p>
            ) : null}
            {assign.isSuccess ? (
              <p className="text-sm text-success sm:col-span-2">{t({ fr: "Course assignée.", en: "Job assigned." })}</p>
            ) : null}
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={assign.isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
              >
                {assign.isPending ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
                {t({ fr: "Assigner la course", en: "Assign job" })}
              </button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
