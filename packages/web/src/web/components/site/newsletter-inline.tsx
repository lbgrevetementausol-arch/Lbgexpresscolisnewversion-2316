import { useState } from "react";
import { Link } from "wouter";
import { Check, Loader2, Mail } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { useNewsletterSubscribe } from "../../queries/newsletter";

/**
 * Bloc de capture d'e-mail discret, posé juste au-dessus du pied de page sur les
 * pages stratégiques (accueil, tarifs, aide). Volontairement sobre : une ligne de
 * promesse, un champ, un bouton — il ne concurrence pas les appels à l'action de devis.
 *
 * `source` distingue l'origine de l'inscription dans le back-office, pour mesurer
 * quelle page capture le mieux.
 */
export function NewsletterInline({ source }: { source: string }) {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const subscribe = useNewsletterSubscribe();

  const submit = async () => {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError(t({ fr: "Entrez une adresse e-mail valide.", en: "Enter a valid email address." }));
      return;
    }
    setError(null);
    try {
      await subscribe.mutateAsync({ email: value, source, locale: lang });
    } catch {
      setError(t({ fr: "Envoi impossible, réessayez.", en: "Could not send, please retry." }));
    }
  };

  return (
    <section className="border-t border-border bg-surface-2/40">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        {subscribe.isSuccess ? (
          <div className="flex items-center justify-center gap-3 text-center">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
              <Check className="size-4" />
            </span>
            <p className="text-sm font-medium">
              {t({
                fr: "Inscription confirmée — merci ! Vous recevrez nos prochains départs et nos conseils d'expédition.",
                en: "You're subscribed — thank you! You'll receive our next departures and shipping tips.",
              })}
            </p>
          </div>
        ) : (
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto] md:gap-10">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Mail className="size-3.5" />
                {t({ fr: "Lettre d'information", en: "Newsletter" })}
              </p>
              <h2 className="mt-2 font-display text-lg font-bold leading-snug sm:text-xl">
                {t({
                  fr: "Nos départs et nos tarifs, une fois par mois",
                  en: "Our departures and rates, once a month",
                })}
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                {t({
                  fr: "Prochains départs vers Cotonou, Lomé et Bamako, conseils pour préparer un colis ou un déménagement, et offres réservées aux inscrits. Un e-mail par mois maximum, désinscription en un clic.",
                  en: "Upcoming departures to Cotonou, Lomé and Bamako, tips to prepare a parcel or a move, and subscriber-only offers. One email a month at most, unsubscribe in one click.",
                })}
              </p>
            </div>

            <div className="w-full md:w-[22rem]">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  aria-label={t({ fr: "Votre e-mail", en: "Your email" })}
                  type="email"
                  placeholder="vous@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void submit();
                  }}
                  className="min-w-0 flex-1 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm outline-none transition focus:border-primary/60"
                />
                <button
                  type="button"
                  onClick={() => void submit()}
                  disabled={subscribe.isPending}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
                >
                  {subscribe.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  {t({ fr: "Je m'inscris", en: "Sign up" })}
                </button>
              </div>
              {error ? <p className="mt-2 text-xs font-medium text-danger">{error}</p> : null}
              <p className="mt-2 text-[0.6875rem] leading-relaxed text-muted">
                {t({
                  fr: "Vos données servent uniquement à vous envoyer cette lettre. Voir la ",
                  en: "Your data is only used to send you this newsletter. See our ",
                })}
                <Link to="/confidentialite" className="text-primary underline-offset-2 hover:underline">
                  {t({ fr: "politique de confidentialité", en: "privacy policy" })}
                </Link>
                .
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
