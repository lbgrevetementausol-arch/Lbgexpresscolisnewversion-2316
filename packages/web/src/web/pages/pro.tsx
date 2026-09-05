import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { Section } from "../components/site/section";

/**
 * L'espace pro a été fusionné dans le back-office /admin :
 * livreurs, courses, messages, clés API et webhooks y sont désormais réunis.
 */
export default function ProPage() {
  const { t } = useI18n();
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/admin", { replace: true });
  }, [navigate]);

  return (
    <Section>
      <p className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="size-4 animate-spin" />
        {t({
          fr: "L'espace pro est désormais intégré au back-office. Redirection vers /admin…",
          en: "The pro area is now part of the back-office. Redirecting to /admin…",
        })}
      </p>
    </Section>
  );
}
