import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2, ShieldAlert } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { authClient } from "../lib/auth";
import { Card, Section } from "./site/section";

/**
 * Garde de route : exige une session valide et, en option, le rôle admin.
 * Redirige vers la page de connexion en conservant la destination.
 */
export function ProtectedRoute({
  children,
  requireRole,
  redirectTo = "/connexion",
}: {
  children: React.ReactNode;
  requireRole?: "admin" | "client";
  redirectTo?: string;
}) {
  const { t } = useI18n();
  const [location, navigate] = useLocation();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user as { role?: string | null; accountStatus?: string | null } | undefined;

  useEffect(() => {
    if (!isPending && !session) {
      navigate(`${redirectTo}?suite=${encodeURIComponent(location)}`);
    }
  }, [isPending, session, location, navigate, redirectTo]);

  if (isPending) {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-md text-center">
          <Loader2 className="mx-auto size-6 animate-spin text-primary" />
          <p className="mt-3 text-sm text-muted">{t({ fr: "Vérification de la session…", en: "Checking session…" })}</p>
        </Card>
      </Section>
    );
  }

  if (!session) return null;

  if (user?.accountStatus === "bloque") {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-md">
          <p className="flex items-center gap-2 font-semibold text-danger">
            <ShieldAlert className="size-5" />
            {t({ fr: "Compte bloqué", en: "Account blocked" })}
          </p>
          <p className="mt-2 text-sm text-muted">
            {t({
              fr: "Votre accès a été suspendu. Contactez LBG Express Colis pour le rétablir.",
              en: "Your access has been suspended. Contact LBG Express Colis to restore it.",
            })}
          </p>
        </Card>
      </Section>
    );
  }

  if (requireRole === "admin" && user?.role !== "admin") {
    return (
      <Section>
        <Card hover={false} className="mx-auto max-w-md">
          <p className="flex items-center gap-2 font-semibold text-danger">
            <ShieldAlert className="size-5" />
            {t({ fr: "Accès réservé à l'administration", en: "Admin access only" })}
          </p>
          <p className="mt-2 text-sm text-muted">
            {t({
              fr: "Ce compte n'a pas les droits d'accès au back-office.",
              en: "This account has no back-office privileges.",
            })}
          </p>
        </Card>
      </Section>
    );
  }

  return <>{children}</>;
}
