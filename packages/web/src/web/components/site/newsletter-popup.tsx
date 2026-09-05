import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Check, Loader2, Mail, X } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { useNewsletterSubscribe } from "../../queries/newsletter";

const SEEN_KEY = "lbg-newsletter-popup";
const DELAY_MS = 10_000;

/**
 * Popup newsletter : s'ouvre 10 secondes après l'arrivée sur le site,
 * une seule fois par visiteur (réarmée au bout de 60 jours si le visiteur a fermé sans s'inscrire).
 */
export function NewsletterPopup() {
  const { t, lang } = useI18n();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const subscribe = useNewsletterSubscribe();

  useEffect(() => {
    let stored: { done?: boolean; at?: number } | null = null;
    try {
      const raw = window.localStorage.getItem(SEEN_KEY);
      stored = raw ? (JSON.parse(raw) as { done?: boolean; at?: number }) : null;
    } catch {
      stored = null;
    }
    if (stored?.done) return;
    if (stored?.at && Date.now() - stored.at < 1000 * 60 * 60 * 24 * 60) return;

    const timer = window.setTimeout(() => setOpen(true), DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const remember = (done: boolean) => {
    try {
      window.localStorage.setItem(SEEN_KEY, JSON.stringify({ done, at: Date.now() }));
    } catch {
      // Stockage indisponible : le popup se réaffichera à la prochaine visite, sans gravité.
    }
  };

  const close = () => {
    remember(false);
    setOpen(false);
  };

  const submit = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError(t({ fr: "Entrez une adresse e-mail valide.", en: "Enter a valid email address." }));
      return;
    }
    setError(null);
    try {
      await subscribe.mutateAsync({ email: value, name: name.trim() || undefined, source: "popup", locale: lang });
      remember(true);
    } catch {
      setError(t({ fr: "Envoi impossible, réessayez.", en: "Could not send, please retry." }));
    }
  };

  if (!open) return null;
  const done = subscribe.isSuccess;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center">
      <div className="glass relative w-full max-w-md rounded-card border border-border p-6 shadow-2xl">
        <button
          type="button"
          onClick={close}
          aria-label={t({ fr: "Fermer", en: "Close" })}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full border border-border text-muted transition hover:text-foreground"
        >
          <X className="size-4" />
        </button>

        {done ? (
          <div className="py-4 text-center">
            <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="size-6" />
            </span>
            <h2 className="mt-4 font-display text-lg font-bold">{t({ fr: "C'est noté, merci !", en: "You're in, thanks!" })}</h2>
            <p className="mt-2 text-sm text-muted">
              {t({
                fr: "Vous recevrez nos départs vers Cotonou, Lomé et Bamako, nos conseils d'expédition et nos offres. Un e-mail par mois maximum, désinscription en un clic.",
                en: "You'll get our departures to Cotonou, Lomé and Bamako, shipping tips and offers. One email a month at most, unsubscribe in one click.",
              })}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {t({ fr: "Continuer la visite", en: "Back to the site" })}
            </button>
          </div>
        ) : (
          <>
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Mail className="size-5" />
            </span>
            <h2 className="mt-4 font-display text-xl font-bold leading-tight">
              {t({
                fr: "Nos départs et nos bons plans, une fois par mois",
                en: "Our departures and best deals, once a month",
              })}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t({
                fr: "Prochains départs aériens et maritimes vers Cotonou, Lomé et Bamako, conseils pour préparer un colis ou un déménagement, et offres réservées aux inscrits. Pas de spam, désinscription en un clic.",
                en: "Upcoming air and sea departures to Cotonou, Lomé and Bamako, tips to prepare a parcel or a move, and subscriber-only offers. No spam, unsubscribe in one click.",
              })}
            </p>

            <div className="mt-5 grid gap-2">
              <input
                aria-label={t({ fr: "Votre prénom", en: "Your first name" })}
                placeholder={t({ fr: "Votre prénom (facultatif)", en: "Your first name (optional)" })}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60"
              />
              <input
                aria-label={t({ fr: "Votre e-mail", en: "Your email" })}
                type="email"
                placeholder="vous@exemple.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void submit();
                }}
                className="rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm outline-none focus:border-primary/60"
              />
              {error ? <p className="text-xs font-medium text-danger">{error}</p> : null}
              <button
                type="button"
                onClick={() => void submit()}
                disabled={subscribe.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
              >
                {subscribe.isPending ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                {t({ fr: "Je m'inscris", en: "Sign me up" })}
              </button>
              <button
                type="button"
                onClick={close}
                className="text-xs font-medium text-muted transition hover:text-foreground"
              >
                {t({ fr: "Non merci", en: "No thanks" })}
              </button>
            </div>

            <p className="mt-4 text-[0.6875rem] leading-relaxed text-muted">
              {t({
                fr: "Vos données servent uniquement à vous envoyer cette lettre. Voir la ",
                en: "Your data is only used to send you this newsletter. See our ",
              })}
              <Link to="/confidentialite" className="text-primary underline-offset-2 hover:underline">
                {t({ fr: "politique de confidentialité", en: "privacy policy" })}
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
