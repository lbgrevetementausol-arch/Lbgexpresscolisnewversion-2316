import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Crosshair,
  Loader2,
  LogOut,
  MapPin,
  Navigation,
  Package,
  Phone,
  Truck,
} from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { CONTACT, dateTime, moneyCents } from "../lib/format";
import { PageHero } from "../components/site/layout";
import { Card, Section } from "../components/site/section";
import { Field, Input, Textarea } from "../components/site/field";
import { useDriverHistory, useDriverJobs, useDriverLogin, usePushDriverLocation, useUpdateJob } from "../queries/drivers";

const STORAGE_KEY = "lbg-driver";

interface DriverSession {
  id: number;
  name: string;
  email: string;
  vehicle: string | null;
  city: string | null;
  token: string;
}

type JobStatus = "a_recuperer" | "en_route" | "en_livraison" | "livre" | "incident";

const JOB_STATUS: Record<JobStatus, { fr: string; en: string; tone: string }> = {
  a_recuperer: { fr: "À récupérer", en: "To pick up", tone: "text-warning border-warning/40 bg-warning/10" },
  en_route: { fr: "En route", en: "En route", tone: "text-primary border-primary/40 bg-primary/10" },
  en_livraison: { fr: "En livraison", en: "Out for delivery", tone: "text-primary border-primary/40 bg-primary/10" },
  livre: { fr: "Livré", en: "Delivered", tone: "text-success border-success/40 bg-success/10" },
  incident: { fr: "Incident", en: "Incident", tone: "text-danger border-danger/40 bg-danger/10" },
};

const NEXT_ACTIONS: { status: JobStatus; fr: string; en: string }[] = [
  { status: "a_recuperer", fr: "À récupérer", en: "To pick up" },
  { status: "en_route", fr: "En route", en: "En route" },
  { status: "en_livraison", fr: "En livraison", en: "Out for delivery" },
  { status: "livre", fr: "Livré", en: "Delivered" },
  { status: "incident", fr: "Incident", en: "Incident" },
];

function readSession(): DriverSession | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as DriverSession;
    return parsed && typeof parsed.token === "string" && parsed.token.length > 10 ? parsed : null;
  } catch {
    return null;
  }
}

export default function LivreurPage() {
  const { t, lang } = useI18n();
  useSeo(SEO_ROUTES["/livreur"]);
  const [session, setSession] = useState<DriverSession | null>(readSession);

  useEffect(() => {
    if (session) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Espace livreur", en: "Driver area" })}
        title={
          session
            ? t({ fr: `Bonjour ${session.name}`, en: `Hello ${session.name}` })
            : t({ fr: "Vos courses du jour", en: "Your jobs of the day" })
        }
        lead={
          session
            ? t({
                fr: "Mettez à jour chaque course : le client voit le changement en direct sur sa page de suivi.",
                en: "Update each job: the customer sees the change live on their tracking page.",
              })
            : t({
                fr: "Connectez-vous avec l'email et le code à 6 caractères transmis par l'exploitation.",
                en: "Sign in with the email and 6-character code given to you by operations.",
              })
        }
        image="/images/van-night.jpg"
      >
        {session ? (
          <button
            type="button"
            onClick={() => setSession(null)}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition hover:border-danger/50 hover:text-danger"
          >
            <LogOut className="size-4" />
            {t({ fr: "Se déconnecter", en: "Sign out" })}
          </button>
        ) : null}
      </PageHero>

      <Section>
        {session ? (
          <DriverBoard session={session} lang={lang} />
        ) : (
          <LoginCard onLogged={setSession} />
        )}
      </Section>
    </>
  );
}

function LoginCard({ onLogged }: { onLogged: (session: DriverSession) => void }) {
  const { t } = useI18n();
  const login = useDriverLogin();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(
      { email, code },
      { onSuccess: (driver) => onLogged(driver as DriverSession) },
    );
  };

  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1.1fr_1fr] md:items-start">
      <Card hover={false}>
        <h2 className="font-display text-xl font-bold">{t({ fr: "Connexion livreur", en: "Driver sign-in" })}</h2>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label="Email">
            <Input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="prenom@lbgexpresscolis.fr"
            />
          </Field>
          <Field label={t({ fr: "Code d'accès", en: "Access code" })}>
            <Input
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="LBG001"
              className="tracking-[0.2em]"
            />
          </Field>

          {login.isError ? (
            <p className="flex items-center gap-2 text-sm text-danger">
              <AlertTriangle className="size-4" />
              {t({ fr: "Email ou code invalide.", en: "Invalid email or code." })}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={login.isPending}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
          >
            {login.isPending ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />}
            {t({ fr: "Accéder à mes courses", en: "Open my jobs" })}
          </button>
        </form>
      </Card>

      <Card hover={false}>
        <h3 className="font-display text-base font-bold">{t({ fr: "Comptes de démonstration", en: "Demo accounts" })}</h3>
        <ul className="mt-4 grid gap-2 text-sm text-muted">
          <li className="rounded-xl border border-border bg-surface-2/60 p-3 font-mono text-xs">
            moussa@lbgexpresscolis.fr · LBG001
          </li>
          <li className="rounded-xl border border-border bg-surface-2/60 p-3 font-mono text-xs">
            sophie@lbgexpresscolis.fr · LBG002
          </li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          {t({
            fr: "Code perdu ou compte bloqué ? Appelez l'exploitation, un nouveau code est généré immédiatement.",
            en: "Lost code or blocked account? Call operations, a new code is issued immediately.",
          })}
        </p>
        <a href={CONTACT.phoneHref} className="mt-2 inline-flex items-center gap-2 font-display font-bold text-primary">
          <Phone className="size-4" />
          {CONTACT.phone}
        </a>
      </Card>
    </div>
  );
}

function DriverBoard({ session, lang }: { session: DriverSession; lang: "fr" | "en" }) {
  const { t } = useI18n();
  const jobs = useDriverJobs(session.token);
  const history = useDriverHistory(session.token);

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div className="grid gap-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold">
            {t({ fr: "Courses en cours", en: "Active jobs" })}
            {jobs.data ? <span className="ml-2 text-muted">({jobs.data.length})</span> : null}
          </h2>
          {jobs.isFetching ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
        </div>

        {jobs.isLoading ? (
          <Card hover={false} className="text-sm text-muted">
            {t({ fr: "Chargement des courses…", en: "Loading jobs…" })}
          </Card>
        ) : jobs.data && jobs.data.length > 0 ? (
          jobs.data.map((job) => <JobCard key={job.id} job={job} token={session.token} lang={lang} />)
        ) : (
          <Card hover={false}>
            <p className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="size-5 text-success" />
              {t({ fr: "Aucune course en attente", en: "No pending job" })}
            </p>
            <p className="mt-2 text-sm text-muted">
              {t({
                fr: "Tout est livré. L'exploitation vous assigne de nouvelles courses dans la journée.",
                en: "Everything is delivered. Operations will assign new jobs during the day.",
              })}
            </p>
          </Card>
        )}
      </div>

      <div className="grid gap-5 lg:sticky lg:top-28">
        <Card hover={false}>
          <h3 className="font-display text-base font-bold">{t({ fr: "Mon profil", en: "My profile" })}</h3>
          <dl className="mt-4 grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted">Email</dt>
              <dd className="truncate">{session.email}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t({ fr: "Véhicule", en: "Vehicle" })}</dt>
              <dd>{session.vehicle ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted">{t({ fr: "Ville", en: "City" })}</dt>
              <dd>{session.city ?? "—"}</dd>
            </div>
          </dl>
        </Card>

        <Card hover={false}>
          <h3 className="font-display text-base font-bold">{t({ fr: "Historique livré", en: "Delivered history" })}</h3>
          {history.isLoading ? (
            <p className="mt-3 text-sm text-muted">{t({ fr: "Chargement…", en: "Loading…" })}</p>
          ) : history.data && history.data.length > 0 ? (
            <ul className="mt-4 grid gap-3 text-sm">
              {history.data.slice(0, 8).map((job) => (
                <li key={job.id} className="border-b border-border pb-3 last:border-0 last:pb-0">
                  <p className="font-mono text-xs text-primary">{job.trackingNumber}</p>
                  <p className="mt-1 truncate text-muted">{job.dropAddress}</p>
                  <p className="mt-1 text-xs text-muted">
                    {dateTime(job.createdAt, lang)}
                    {job.payoutCents ? ` · ${moneyCents(job.payoutCents, lang)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-muted">
              {t({ fr: "Aucune livraison enregistrée pour l'instant.", en: "No delivery recorded yet." })}
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

interface JobRow {
  id: number;
  driverId: number;
  trackingNumber: string;
  pickupAddress: string;
  dropAddress: string;
  recipientName: string | null;
  recipientPhone: string | null;
  scheduledAt: Date | string | null;
  status: string;
  payoutCents: number | null;
  createdAt: Date | string;
}

function JobCard({ job, token, lang }: { job: JobRow; token: string; lang: "fr" | "en" }) {
  const { t } = useI18n();
  const update = useUpdateJob();
  const pushLocation = usePushDriverLocation();
  const [note, setNote] = useState("");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoOk, setGeoOk] = useState(false);

  const current = (JOB_STATUS[job.status as JobStatus] ?? JOB_STATUS.a_recuperer)!;

  const share = () => {
    setGeoError(null);
    setGeoOk(false);
    if (!("geolocation" in navigator)) {
      setGeoError(t({ fr: "Géolocalisation indisponible sur cet appareil.", en: "Geolocation unavailable on this device." }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pushLocation.mutate(
          {
            token,
            trackingNumber: job.trackingNumber,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          },
          { onSuccess: () => setGeoOk(true) },
        );
      },
      () =>
        setGeoError(
          t({
            fr: "Position refusée. Autorisez la localisation dans votre navigateur.",
            en: "Location denied. Allow location access in your browser.",
          }),
        ),
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  };

  return (
    <Card hover={false}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-sm font-semibold text-primary">{job.trackingNumber}</p>
          <p className="mt-1 text-sm text-muted">
            {job.recipientName ?? t({ fr: "Destinataire", en: "Recipient" })}
            {job.scheduledAt ? ` · ${dateTime(job.scheduledAt, lang)}` : ""}
          </p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${current.tone}`}>
          {t(current)}
        </span>
      </div>

      <div className="mt-5 grid gap-3 text-sm">
        <p className="flex gap-2">
          <Package className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-wider text-muted">
              {t({ fr: "Enlèvement", en: "Pickup" })}
            </span>
            {job.pickupAddress}
          </span>
        </p>
        <p className="flex gap-2">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>
            <span className="block text-xs uppercase tracking-wider text-muted">
              {t({ fr: "Livraison", en: "Drop-off" })}
            </span>
            {job.dropAddress}
          </span>
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.dropAddress)}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-semibold transition hover:border-primary/50"
        >
          <Navigation className="size-4" />
          {t({ fr: "Itinéraire", en: "Directions" })}
        </a>
        {job.recipientPhone ? (
          <a
            href={`tel:${job.recipientPhone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-xs font-semibold transition hover:border-primary/50"
          >
            <Phone className="size-4" />
            {t({ fr: "Appeler", en: "Call" })}
          </a>
        ) : null}
        <button
          type="button"
          onClick={share}
          disabled={pushLocation.isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20 disabled:opacity-60"
        >
          {pushLocation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
          {t({ fr: "Partager ma position", en: "Share my location" })}
        </button>
        {job.payoutCents ? (
          <span className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted">
            {moneyCents(job.payoutCents, lang)}
          </span>
        ) : null}
      </div>

      {geoOk ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-success">
          <CheckCircle2 className="size-4" />
          {t({ fr: "Position transmise au client.", en: "Location sent to the customer." })}
        </p>
      ) : null}
      {geoError ? (
        <p className="mt-3 flex items-center gap-2 text-xs text-danger">
          <AlertTriangle className="size-4" />
          {geoError}
        </p>
      ) : null}

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {t({ fr: "Mettre à jour le statut", en: "Update status" })}
        </p>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t({
            fr: "Note visible dans le suivi (optionnel) : absent, code portail, colis remis au voisin…",
            en: "Note shown in tracking (optional): absent, gate code, left with neighbour…",
          })}
          className="mt-3 min-h-20 text-sm"
          maxLength={240}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {NEXT_ACTIONS.filter((a) => a.status !== job.status).map((action) => (
            <button
              key={action.status}
              type="button"
              disabled={update.isPending}
              onClick={() =>
                update.mutate(
                  { token, jobId: job.id, status: action.status, note: note.trim() || undefined },
                  { onSuccess: () => setNote("") },
                )
              }
              className={`rounded-xl border px-4 py-2 text-xs font-semibold transition disabled:opacity-60 ${
                action.status === "incident"
                  ? "border-danger/40 text-danger hover:bg-danger/10"
                  : action.status === "livre"
                    ? "border-success/40 text-success hover:bg-success/10"
                    : "border-border hover:border-primary/50"
              }`}
            >
              {update.isPending ? "…" : t(action)}
            </button>
          ))}
        </div>
        {update.isError ? (
          <p className="mt-3 text-xs text-danger">
            {t({ fr: "Mise à jour impossible. Réessayez.", en: "Update failed. Try again." })}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
