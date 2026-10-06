import { BadgeEuro, LockKeyhole, PhoneCall, ShieldCheck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { COMPANY } from "../../lib/legal-content";
import { cn } from "@/lib/utils";

/**
 * 4 badges de confiance posés sous les formulaires (accueil + pages services).
 *
 * Chaque affirmation est adossée à un document réel :
 * - assurance : attestation Simplis RC Pro, contrat n° 76486184 (assureur WAKAM),
 *   valable du 24/06/2026 au 23/06/2027, biens confiés 100 000 € / sinistre, franchise 200 € ;
 * - paiement : myPOS, commande confirmée uniquement par la notification de paiement ;
 * - prix : facture proforma au montant du devis, avant paiement ;
 * - contact : phrase envoyée dans le mail de confirmation.
 * Ne rien ajouter qui ne soit pas tenu par un document.
 */
export const INSURANCE = {
  insurer: COMPANY.insurer,
  underwriter: "WAKAM",
  contract: "76486184",
  validUntil: { fr: "23/06/2027", en: "23 June 2027" },
  entrustedCap: { fr: "100 000 €", en: "€100,000" },
  deductible: { fr: "200 €", en: "€200" },
} as const;

const BADGES = [
  {
    icon: ShieldCheck,
    highlight: true,
    label: { fr: "Assuré RC Pro", en: "Insured (prof. liability)" },
    detail: {
      fr: `${INSURANCE.insurer} × ${INSURANCE.underwriter} · biens confiés jusqu'à ${INSURANCE.entrustedCap.fr}`,
      en: `${INSURANCE.insurer} × ${INSURANCE.underwriter} · goods entrusted up to ${INSURANCE.entrustedCap.en}`,
    },
  },
  {
    icon: LockKeyhole,
    highlight: false,
    label: { fr: "Paiement sécurisé", en: "Secure payment" },
    detail: { fr: "myPOS · 3-D Secure", en: "myPOS · 3-D Secure" },
  },
  {
    icon: BadgeEuro,
    highlight: false,
    label: { fr: "Prix TTC ferme", en: "Firm price incl. VAT" },
    detail: { fr: "Facture proforma avant paiement", en: "Proforma invoice before payment" },
  },
  {
    icon: PhoneCall,
    highlight: false,
    label: { fr: "Transporteur joignable", en: "Reachable carrier" },
    detail: { fr: "Appel rapide après paiement", en: "Quick call after payment" },
  },
] as const;

/** Bandeau de 4 badges, à placer sous un formulaire de devis. */
export function TrustBadges({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <section
      aria-label={t({ fr: "Nos garanties", en: "Our guarantees" })}
      className={cn("rounded-card border border-border bg-surface-2/40 p-4 sm:p-5", className)}
    >
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {BADGES.map((b) => (
          <li
            key={b.label.fr}
            className={cn(
              "flex items-center gap-3 rounded-2xl border p-3",
              b.highlight ? "border-primary/45 bg-primary/10" : "border-border bg-background/40",
            )}
          >
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-xl",
                b.highlight ? "bg-primary text-primary-foreground" : "bg-primary/12 text-primary",
              )}
            >
              <b.icon className="size-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold leading-tight">{t(b.label)}</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">{t(b.detail)}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-center text-[0.7rem] leading-relaxed text-muted">
        {t({
          fr: `Contrat ${INSURANCE.insurer} n° ${INSURANCE.contract}, valable jusqu'au ${INSURANCE.validUntil.fr} · franchise ${INSURANCE.deductible.fr} · attestation sur demande · SIRET ${COMPANY.siret}`,
          en: `${INSURANCE.insurer} policy no. ${INSURANCE.contract}, valid until ${INSURANCE.validUntil.en} · ${INSURANCE.deductible.en} deductible · certificate on request · SIRET ${COMPANY.siret}`,
        })}
      </p>
    </section>
  );
}
