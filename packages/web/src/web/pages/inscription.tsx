import { useState } from "react";
import { Link, useLocation } from "wouter";
import { CheckCircle2, Loader2, UserPlus } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { authClient } from "../lib/auth";
import { Card, Section } from "../components/site/section";
import { Field, Input } from "../components/site/field";
import { trackSignup } from "../lib/pixels";

export default function InscriptionPage() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (form.password.length < 8) {
      setError(t({ fr: "Mot de passe : 8 caractères minimum.", en: "Password: 8 characters minimum." }));
      return;
    }
    setBusy(true);
    try {
      const result = await authClient.signUp.email({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        company: form.company.trim() || undefined,
      } as Parameters<typeof authClient.signUp.email>[0]);
      if (result.error) {
        setError(
          t({
            fr: "Inscription impossible : cet email est peut-être déjà utilisé.",
            en: "Sign-up failed: this email may already be in use.",
          }),
        );
        return;
      }
      trackSignup({ method: "email" });
      setDone(true);
      setTimeout(() => navigate("/espace-client"), 1200);
    } catch {
      setError(t({ fr: "Inscription impossible, réessayez.", en: "Sign-up failed, please retry." }));
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-md text-center">
          <CheckCircle2 className="mx-auto size-8 text-success" />
          <p className="mt-3 text-lg font-bold">{t({ fr: "Compte créé", en: "Account created" })}</p>
          <p className="mt-2 text-sm text-muted">
            {t({
              fr: "Bienvenue ! Nous vous redirigeons vers votre espace client. Nos équipes vérifient les nouveaux comptes professionnels sous 24 h.",
              en: "Welcome! Redirecting you to your customer area. We review new business accounts within 24h.",
            })}
          </p>
        </Card>
      </Section>
    );
  }

  return (
    <Section>
      <Card hover={false} className="mx-auto max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t({ fr: "Espace client", en: "Customer area" })}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{t({ fr: "Créer un compte", en: "Create an account" })}</h1>
        <p className="mt-2 text-sm text-muted">
          {t({
            fr: "Suivez vos commandes, retrouvez vos factures et payez en ligne en deux clics.",
            en: "Track your orders, find your invoices and pay online in two clicks.",
          })}
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label={t({ fr: "Nom et prénom", en: "Full name" })}>
            <Input
              required
              aria-label={t({ fr: "Nom et prénom", en: "Full name" })}
              value={form.name}
              onChange={set("name")}
            />
          </Field>
          <Field label={t({ fr: "Email", en: "Email" })}>
            <Input
              type="email"
              required
              autoComplete="email"
              aria-label={t({ fr: "Email", en: "Email" })}
              value={form.email}
              onChange={set("email")}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t({ fr: "Téléphone", en: "Phone" })}>
              <Input
                aria-label={t({ fr: "Téléphone", en: "Phone" })}
                value={form.phone}
                onChange={set("phone")}
                placeholder="+33…"
              />
            </Field>
            <Field label={t({ fr: "Société (option)", en: "Company (optional)" })}>
              <Input
                aria-label={t({ fr: "Société", en: "Company" })}
                value={form.company}
                onChange={set("company")}
              />
            </Field>
          </div>
          <Field
            label={t({ fr: "Mot de passe", en: "Password" })}
            hint={t({ fr: "8 caractères minimum.", en: "8 characters minimum." })}
          >
            <Input
              type="password"
              required
              autoComplete="new-password"
              aria-label={t({ fr: "Mot de passe", en: "Password" })}
              value={form.password}
              onChange={set("password")}
            />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            {busy ? t({ fr: "Création…", en: "Creating…" }) : t({ fr: "Créer mon compte", en: "Create my account" })}
          </button>
        </form>

        <p className="mt-5 border-t border-border pt-4 text-sm text-muted">
          {t({ fr: "Déjà client ? ", en: "Already a customer? " })}
          <Link to="/connexion" className="font-semibold text-foreground hover:text-primary">
            {t({ fr: "Se connecter", en: "Sign in" })}
          </Link>
        </p>
      </Card>
    </Section>
  );
}
