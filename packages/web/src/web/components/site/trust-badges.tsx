import { BadgeCheck, CreditCard, FileCheck2, Headset, ShieldCheck, Truck } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { COMPANY } from "../../lib/legal-content";
import { CONTACT } from "../../lib/format";
import { cn } from "@/lib/utils";

/**
 * Bandeau de réassurance posé sous les formulaires de devis.
 *
 * Chaque affirmation est adossée à un engagement réellement écrit dans les CGV
 * (licence transporteur, police marchandises transportées + RC pro Simplis,
 * barème d'annulation, prix ferme, myPOS). Ne pas y ajouter de promesse
 * qui ne serait pas tenue par un document contractuel.
 */

const BADGES = [
  {
    icon: Truck,
    label: { fr: "Transporteurs professionnels", en: "Professional carriers" },
    detail: {
      fr: "Entreprises inscrites au registre, licence et attestations vérifiées avant la première tournée.",
      en: "Registered companies: licence and certificates checked before their first run.",
    },
  },
  {
    icon: ShieldCheck,
    label: { fr: "Marchandises couvertes", en: "Goods covered" },
    detail: {
      fr: `Police marchandises transportées et RC professionnelle souscrites auprès de ${COMPANY.insurer}. Option ad valorem sur la valeur déclarée.`,
      en: `Goods-in-transit and professional liability cover with ${COMPANY.insurer}. Optional ad valorem cover on declared value.`,
    },
  },
  {
    icon: CreditCard,
    label: { fr: "Paiement sécurisé myPOS", en: "Secure myPOS payment" },
    detail: {
      fr: "Établissement de paiement agréé, 3-D Secure. Nous ne stockons aucune donnée de carte.",
      en: "Licensed payment institution, 3-D Secure. We never store card details.",
    },
  },
  {
    icon: BadgeCheck,
    label: { fr: "Prix ferme, sans surprise", en: "Firm price, no surprises" },
    detail: {
      fr: "Le tarif affiché par le calculateur est celui que vous payez : ni frais de dossier, ni supplément caché.",
      en: "The price the calculator shows is the price you pay: no admin fees, no hidden surcharges.",
    },
  },
  {
    icon: FileCheck2,
    label: { fr: "Annulation gratuite 24 h avant", en: "Free cancellation 24 h ahead" },
    detail: {
      fr: "Vous annulez sans frais jusqu'à 24 heures avant l'enlèvement, selon notre barème d'annulation.",
      en: "Cancel free of charge up to 24 hours before pickup, per our cancellation scale.",
    },
  },
  {
    icon: Headset,
    label: { fr: "Un interlocuteur joignable", en: "A real person to call" },
    detail: {
      fr: `Suivi de votre envoi et réponse par téléphone ou WhatsApp au ${CONTACT.phone}.`,
      en: `Shipment tracking and answers by phone or WhatsApp on ${CONTACT.phone}.`,
    },
  },
] as const;

/** Bandeau complet (6 gages), à placer sous un formulaire de devis. */
export function TrustBadges({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <section
      aria-label={t({ fr: "Nos garanties", en: "Our guarantees" })}
      className={cn("rounded-card border border-border bg-surface-2/40 p-5 sm:p-6", className)}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        {t({ fr: "Vous êtes couvert de bout en bout", en: "You're covered end to end" })}
      </p>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BADGES.map((b) => (
          <li key={b.label.fr} className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
              <b.icon className="size-[1.1rem]" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold leading-snug">{t(b.label)}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted">{t(b.detail)}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 border-t border-border pt-3 text-[0.7rem] leading-relaxed text-muted">
        {t({
          fr: `${COMPANY.legalName} — SIRET ${COMPANY.siret} — TVA ${COMPANY.vat}. Transporteur déclaré, code APE ${COMPANY.ape}. Conditions détaillées dans nos CGV.`,
          en: `${COMPANY.legalName} — SIRET ${COMPANY.siret} — VAT ${COMPANY.vat}. Registered carrier, APE code ${COMPANY.ape}. Full terms in our T&Cs.`,
        })}
      </p>
    </section>
  );
}
