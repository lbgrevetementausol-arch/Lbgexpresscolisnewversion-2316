import { useState } from "react";
import { Link, useLocation, useSearchParams } from "wouter";
import { Loader2, Lock, LogIn, Mail } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { authClient } from "../lib/auth";
import { Card, Section } from "../components/site/section";
import { Field, Input } from "../components/site/field";
import { CONTACT } from "../lib/format";

export default function ConnexionPage() {
  const { t } = useI18n();
  const [, navigate] = useLocation();
  const [params] = useSearchParams();
  const next = params.get("suite") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const result = await authClient.signIn.email({ email: email.trim(), password });
      if (result.error) {
        setError(
          t({
            fr: "Identifiants invalides. Vérifiez votre email et votre mot de passe.",
            en: "Invalid credentials. Check your email and password.",
          }),
        );
        return;
      }
      const role = (result.data?.user as { role?: string | null } | undefined)?.role;
      navigate(next || (role === "admin" ? "/admin" : "/espace-client"));
    } catch {
      setError(t({ fr: "Connexion impossible, réessayez.", en: "Sign-in failed, please retry." }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Section>
      <Card hover={false} className="mx-auto max-w-md">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {t({ fr: "Espace sécurisé", en: "Secure area" })}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{t({ fr: "Connexion", en: "Sign in" })}</h1>
        <p className="mt-2 text-sm text-muted">
          {t({
            fr: "Accédez à vos commandes, vos factures et — pour l'équipe LBG — au back-office.",
            en: "Access your orders, invoices and — for the LBG team — the back office.",
          })}
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label={t({ fr: "Email", en: "Email" })}>
            <Input
              type="email"
              required
              autoComplete="email"
              aria-label={t({ fr: "Email", en: "Email" })}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@exemple.fr"
            />
          </Field>
          <Field label={t({ fr: "Mot de passe", en: "Password" })}>
            <Input
              type="password"
              required
              autoComplete="current-password"
              aria-label={t({ fr: "Mot de passe", en: "Password" })}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
          >
            {busy ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
            {busy ? t({ fr: "Connexion…", en: "Signing in…" }) : t({ fr: "Se connecter", en: "Sign in" })}
          </button>
        </form>

        <div className="mt-6 grid gap-2 border-t border-border pt-4 text-sm text-muted">
          <p className="flex items-center gap-2">
            <Mail className="size-4 text-primary" />
            <Link to="/inscription" className="font-semibold text-foreground hover:text-primary">
              {t({ fr: "Créer un compte client", en: "Create a customer account" })}
            </Link>
          </p>
          <p className="flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            {t({ fr: "Mot de passe oublié ? Appelez le ", en: "Forgot your password? Call " })}
            {CONTACT.phone}
          </p>
        </div>
      </Card>
    </Section>
  );
}
