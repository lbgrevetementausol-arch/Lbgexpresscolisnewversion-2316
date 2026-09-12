import { useState } from "react";
import { BellRing, CheckCircle2, FileText, Loader2, XCircle } from "lucide-react";
import { Card } from "../site/section";
import { dateTime, moneyCents } from "../../lib/format";
import {
  openDriverDocument,
  useAdminCancelOffer,
  useAdminDrivers,
  useAdminJobOffers,
  useAdminResendOffer,
  useAdminSetApproval,
  useAdminSetDriverActive,
} from "../../queries/driver-account";

const th = "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted whitespace-nowrap";
const td = "px-4 py-3 text-sm align-top";

const STATUS_LABEL: Record<string, { label: string; tone: string }> = {
  en_attente: { label: "En attente", tone: "text-warning border-warning/40 bg-warning/10" },
  valide: { label: "Validé", tone: "text-success border-success/40 bg-success/10" },
  refuse: { label: "Refusé", tone: "text-danger border-danger/40 bg-danger/10" },
};

const OFFER_LABEL: Record<string, { label: string; tone: string }> = {
  ouverte: { label: "Ouverte", tone: "text-primary border-primary/40 bg-primary/10" },
  attribuee: { label: "Attribuée", tone: "text-success border-success/40 bg-success/10" },
  annulee: { label: "Annulée", tone: "text-muted border-border bg-surface-2" },
};

function DocLink({ docKey, label }: { docKey: string | null; label: string }) {
  const [error, setError] = useState(false);
  if (!docKey) return <span className="text-xs text-muted">{label} : —</span>;
  return (
    <button
      type="button"
      onClick={() => {
        setError(false);
        openDriverDocument(docKey).catch(() => setError(true));
      }}
      className={`inline-flex items-center gap-1.5 text-xs font-semibold ${error ? "text-danger" : "text-primary"} underline-offset-4 hover:underline`}
    >
      <FileText className="size-3.5" />
      {error ? `${label} indisponible` : label}
    </button>
  );
}

/** Dossiers d'inscription livreur : documents, validation, activation. */
export function DriverApprovalsPanel() {
  const drivers = useAdminDrivers();
  const setApproval = useAdminSetApproval();
  const setActive = useAdminSetDriverActive();
  const [onlyPending, setOnlyPending] = useState(false);

  const rows = (drivers.data ?? []).filter((d) => (onlyPending ? d.approvalStatus === "en_attente" : true));
  const pendingCount = (drivers.data ?? []).filter((d) => d.approvalStatus === "en_attente").length;

  return (
    <Card hover={false} className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <h3 className="font-display text-base font-bold">
          Dossiers livreurs
          {pendingCount > 0 ? (
            <span className="ml-2 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-0.5 text-xs font-semibold text-warning">
              {pendingCount} en attente
            </span>
          ) : null}
        </h3>
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            aria-label="Afficher uniquement les dossiers en attente"
            checked={onlyPending}
            onChange={(e) => setOnlyPending(e.target.checked)}
            className="size-4 accent-[var(--color-primary)]"
          />
          Afficher uniquement les dossiers en attente
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-surface-2/60">
            <tr>
              <th className={th}>Livreur</th>
              <th className={th}>Véhicule</th>
              <th className={th}>Documents</th>
              <th className={th}>Statut</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => {
              const status = STATUS_LABEL[d.approvalStatus] ?? STATUS_LABEL.en_attente!;
              const busy =
                (setApproval.isPending && setApproval.variables?.driverId === d.id) ||
                (setActive.isPending && setActive.variables?.driverId === d.id);
              return (
                <tr key={d.id} className="border-t border-border">
                  <td className={td}>
                    <p className="font-medium">{d.name}</p>
                    <p className="text-xs text-muted">{d.email}</p>
                    {d.phone ? (
                      <p className="text-xs text-muted">
                        {d.phone}
                        {d.whatsapp && d.whatsapp !== d.phone ? ` · WhatsApp ${d.whatsapp}` : ""}
                      </p>
                    ) : null}
                    {d.address ? <p className="mt-1 text-xs text-muted">{d.address}</p> : null}
                    <p className="mt-1 text-xs text-muted">
                      {d.emailVerified ? "E-mail vérifié" : "E-mail non vérifié"}
                      {d.available ? " · Disponible" : ""}
                    </p>
                  </td>
                  <td className={td}>
                    <p>{d.vehicle ?? "—"}</p>
                    {d.plate ? <p className="font-mono text-xs text-primary">{d.plate}</p> : null}
                    {d.siret ? <p className="text-xs text-muted">SIRET {d.siret}</p> : null}
                    {d.city ? <p className="text-xs text-muted">{d.city}</p> : null}
                  </td>
                  <td className={td}>
                    <div className="grid gap-1.5">
                      <DocLink docKey={d.licenseKey} label="Permis" />
                      <DocLink docKey={d.idPhotoKey} label="Pièce d'identité" />
                      <DocLink docKey={d.vehicleDocKey} label="Carte grise / assurance" />
                    </div>
                  </td>
                  <td className={td}>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                      {status.label}
                    </span>
                    {!d.active ? <p className="mt-1.5 text-xs text-danger">Compte désactivé</p> : null}
                  </td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-2">
                      {d.approvalStatus !== "valide" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setApproval.mutate({ driverId: d.id, status: "valide" })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-success/40 px-3 py-1.5 text-xs font-semibold text-success transition hover:bg-success/10 disabled:opacity-60"
                        >
                          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                          Valider
                        </button>
                      ) : null}
                      {d.approvalStatus !== "refuse" ? (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => setApproval.mutate({ driverId: d.id, status: "refuse" })}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
                        >
                          <XCircle className="size-3.5" />
                          Refuser
                        </button>
                      ) : null}
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => setActive.mutate({ driverId: d.id, active: !d.active })}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/50 disabled:opacity-60"
                      >
                        {d.active ? "Désactiver" : "Réactiver"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  {drivers.isLoading ? "Chargement…" : "Aucun dossier."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/** Courses proposées aux livreurs disponibles. */
export function JobOffersPanel({ lang }: { lang: "fr" | "en" }) {
  const offers = useAdminJobOffers();
  const resend = useAdminResendOffer();
  const cancel = useAdminCancelOffer();

  return (
    <Card hover={false} className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <h3 className="flex items-center gap-2 font-display text-base font-bold">
          <BellRing className="size-4 text-primary" />
          Courses proposées
          <span className="text-muted">({offers.data?.length ?? 0})</span>
        </h3>
        <p className="text-xs text-muted">Publiées automatiquement dès qu'une commande est payée.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="bg-surface-2/60">
            <tr>
              <th className={th}>Suivi</th>
              <th className={th}>Trajet</th>
              <th className={th}>Rémunération</th>
              <th className={th}>Statut</th>
              <th className={th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(offers.data ?? []).map((o) => {
              const status = OFFER_LABEL[o.status] ?? OFFER_LABEL.ouverte!;
              const busy =
                (resend.isPending && resend.variables?.offerId === o.id) ||
                (cancel.isPending && cancel.variables?.offerId === o.id);
              return (
                <tr key={o.id} className="border-t border-border">
                  <td className={td}>
                    <p className="font-mono text-xs text-primary">{o.trackingNumber}</p>
                    <p className="mt-1 text-xs text-muted">{dateTime(o.createdAt, lang)}</p>
                    <p className="text-xs text-muted">{o.notifiedCount} livreur(s) notifié(s)</p>
                  </td>
                  <td className={td}>
                    <p className="text-xs text-muted">De : {o.pickupAddress}</p>
                    <p className="text-xs text-muted">À : {o.dropAddress}</p>
                  </td>
                  <td className={td}>{o.payoutCents ? moneyCents(o.payoutCents, lang) : "—"}</td>
                  <td className={td}>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${status.tone}`}>
                      {status.label}
                    </span>
                    {o.driverName ? (
                      <p className="mt-1.5 text-xs text-muted">
                        {o.driverName}
                        {o.driverPhone ? ` · ${o.driverPhone}` : ""}
                      </p>
                    ) : null}
                  </td>
                  <td className={td}>
                    {o.status === "ouverte" ? (
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => resend.mutate({ offerId: o.id })}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold transition hover:border-primary/50 disabled:opacity-60"
                        >
                          {busy ? <Loader2 className="size-3.5 animate-spin" /> : "Renvoyer"}
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => cancel.mutate({ offerId: o.id })}
                          className="rounded-lg border border-danger/40 px-3 py-1.5 text-xs font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {(offers.data ?? []).length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted">
                  {offers.isLoading ? "Chargement…" : "Aucune course proposée pour l'instant."}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
