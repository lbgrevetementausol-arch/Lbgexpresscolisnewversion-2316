import { useState } from "react";
import { AlertTriangle, BellRing, CheckCircle2, Loader2, MapPin, Package, Power } from "lucide-react";
import { Card } from "../site/section";
import { dateTime, moneyCents } from "../../lib/format";
import { useAcceptOffer, useDriverOffers, useSetDriverAvailability } from "../../queries/driver-account";

function errMessage(error: unknown, fallback: string) {
  const m = (error as { message?: string } | null)?.message;
  return m && m.length < 200 ? m : fallback;
}

/** Interrupteur de disponibilité — conditionne la réception des offres par e-mail. */
export function AvailabilityCard({
  token,
  available,
  onChange,
}: {
  token: string;
  available: boolean;
  onChange: (next: boolean) => void;
}) {
  const setAvailability = useSetDriverAvailability();

  return (
    <Card hover={false}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 font-display text-base font-bold">
            <Power className={`size-5 ${available ? "text-success" : "text-muted"}`} />
            {available ? "Vous êtes disponible" : "Vous êtes indisponible"}
          </h3>
          <p className="mt-1.5 text-sm text-muted">
            {available
              ? "Vous recevez un e-mail dès qu'une nouvelle course est payée."
              : "Activez la disponibilité pour recevoir les courses par e-mail."}
          </p>
        </div>
        <button
          type="button"
          disabled={setAvailability.isPending}
          onClick={() =>
            setAvailability.mutate({ token, available: !available }, { onSuccess: (r) => onChange(r.available) })
          }
          className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition disabled:opacity-60 ${
            available
              ? "border border-border hover:border-danger/50 hover:text-danger"
              : "bg-success text-white hover:opacity-90"
          }`}
        >
          {setAvailability.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          {available ? "Me mettre indisponible" : "Je suis disponible"}
        </button>
      </div>
      {setAvailability.isError ? (
        <p className="mt-3 text-xs text-danger">{errMessage(setAvailability.error, "Changement impossible.")}</p>
      ) : null}
    </Card>
  );
}

/** Courses ouvertes à tous les livreurs validés — premier arrivé, premier servi. */
export function OffersPanel({ token, lang }: { token: string; lang: "fr" | "en" }) {
  const offers = useDriverOffers(token);
  const accept = useAcceptOffer();
  const [taken, setTaken] = useState<number | null>(null);

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-2 font-display text-xl font-bold">
          <BellRing className="size-5 text-primary" />
          Courses disponibles
          {offers.data ? <span className="text-muted">({offers.data.length})</span> : null}
        </h2>
        {offers.isFetching ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
      </div>

      {offers.isError ? (
        <Card hover={false} className="text-sm text-muted">
          {errMessage(offers.error, "Courses indisponibles pour le moment.")}
        </Card>
      ) : offers.isLoading ? (
        <Card hover={false} className="text-sm text-muted">
          Chargement des courses…
        </Card>
      ) : offers.data && offers.data.length > 0 ? (
        offers.data.map((offer) => (
          <Card key={offer.id} hover={false}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-primary">{offer.trackingNumber}</p>
                <p className="mt-1 text-sm text-muted">
                  {offer.service ?? "Course"}
                  {offer.scheduledAt ? ` · ${dateTime(offer.scheduledAt, lang)}` : ""}
                </p>
              </div>
              {offer.payoutCents ? (
                <span className="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-sm font-bold text-success">
                  {moneyCents(offer.payoutCents, lang)}
                </span>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3 text-sm">
              <p className="flex gap-2">
                <Package className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted">Enlèvement</span>
                  {offer.pickupAddress}
                </span>
              </p>
              <p className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-xs uppercase tracking-wider text-muted">Livraison</span>
                  {offer.dropAddress}
                </span>
              </p>
              {offer.weightKg || offer.volumeM3 ? (
                <p className="text-xs text-muted">
                  {offer.weightKg ? `${offer.weightKg} kg` : ""}
                  {offer.weightKg && offer.volumeM3 ? " · " : ""}
                  {offer.volumeM3 ? `${offer.volumeM3} m³` : ""}
                </p>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={accept.isPending}
                onClick={() =>
                  accept.mutate(
                    { token, offerId: offer.id },
                    { onSuccess: () => setTaken(offer.id), onError: () => setTaken(null) },
                  )
                }
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
              >
                {accept.isPending && accept.variables?.offerId === offer.id ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-4" />
                )}
                J'accepte cette course
              </button>
              {taken === offer.id ? (
                <span className="text-sm font-semibold text-success">Course attribuée, elle est dans vos courses.</span>
              ) : null}
              {accept.isError && accept.variables?.offerId === offer.id ? (
                <span className="flex items-center gap-2 text-sm text-danger">
                  <AlertTriangle className="size-4" />
                  {errMessage(accept.error, "Course déjà prise.")}
                </span>
              ) : null}
            </div>
          </Card>
        ))
      ) : (
        <Card hover={false}>
          <p className="text-sm text-muted">
            Aucune course ouverte pour l'instant. Dès qu'une commande est payée, vous recevez un e-mail et elle apparaît
            ici.
          </p>
        </Card>
      )}
    </div>
  );
}

/** Écran d'attente tant que le dossier n'est pas validé par l'administration. */
export function PendingApprovalCard({ status }: { status: string }) {
  const refused = status === "refuse";
  return (
    <Card hover={false} className="mx-auto max-w-2xl">
      <h2 className="flex items-center gap-2 font-display text-xl font-bold">
        <AlertTriangle className={`size-6 ${refused ? "text-danger" : "text-warning"}`} />
        {refused ? "Dossier refusé" : "Dossier en cours de validation"}
      </h2>
      <p className="mt-3 text-sm text-muted">
        {refused
          ? "Votre dossier n'a pas été retenu. Contactez l'exploitation si vous pensez qu'il s'agit d'une erreur ou pour transmettre de nouveaux documents."
          : "Vos documents sont en cours de contrôle par LBG Express. Vous recevrez un e-mail dès que votre compte sera activé — en général sous 24 à 48 h ouvrées. Les courses apparaîtront ici à ce moment-là."}
      </p>
    </Card>
  );
}
