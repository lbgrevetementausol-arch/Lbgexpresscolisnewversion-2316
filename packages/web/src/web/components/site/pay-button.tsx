import { useState } from "react";
import { useLocation } from "wouter";
import { CreditCard, Landmark, Loader2, MessageCircle, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "../../lib/i18n";
import { CONTACT, whatsappLink } from "../../lib/format";
import { trackCheckout } from "../../lib/pixels";
import { useCheckout, useMyposSession } from "../../queries/invoices";
import { startMyposPayment } from "../../lib/mypos";

export interface PayTarget {
  /** Commande/devis existant à facturer. */
  quoteRef?: string;
  /** Paiement direct : coordonnées client (obligatoires sans quoteRef). */
  customer?: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    address?: string;
  };
  /** Détail de la prestation pour un paiement direct. */
  service?: {
    kind?: "colis" | "palette" | "demenagement" | "international";
    zone?: "idf" | "france" | "corse" | "europe" | "maghreb" | "afrique" | "monde";
    service?: "economique" | "standard" | "express" | "premium";
    weightKg?: number;
    volumeM3?: number;
    pieces?: number;
    fromAddress?: string;
    toAddress?: string;
    amountCents?: number;
    label?: string;
  };
  subject?: string;
}

/**
 * Bouton de paiement unique du site : crée la commande + la facture pro numérotée,
 * puis envoie le client sur sa facture (d'où part la redirection MyPOS).
 */
export function PayButton({
  target,
  label,
  className,
  variant = "primary",
  disabled,
  onBeforeCheckout,
}: {
  target: PayTarget | (() => PayTarget | null);
  label?: string;
  className?: string;
  variant?: "primary" | "outline";
  disabled?: boolean;
  onBeforeCheckout?: () => boolean;
}) {
  const { t, lang } = useI18n();
  const [, navigate] = useLocation();
  const checkout = useCheckout();
  const session = useMyposSession();
  const [error, setError] = useState<string | null>(null);
  const busy = checkout.isPending || session.isPending;

  const run = async () => {
    setError(null);
    if (onBeforeCheckout && !onBeforeCheckout()) return;
    const resolved = typeof target === "function" ? target() : target;
    if (!resolved) return;
    try {
      const result = await checkout.mutateAsync({
        quoteRef: resolved.quoteRef,
        customer: resolved.customer,
        service: resolved.service,
        subject: resolved.subject,
        locale: lang,
      });
      // La facture pro est enregistrée, puis le client part directement sur la page
      // de paiement par carte MyPOS ; la facture reste ouverte derrière lui.
      trackCheckout({ content_name: result.number, ref: resolved.quoteRef ?? result.quoteRef });
      // Session myPOS Checkout : formulaire signé auto-soumis (montant + référence pré-remplis).
      try {
        const pay = await session.mutateAsync({ number: result.number, locale: lang });
        if (pay.mode === "form") {
          startMyposPayment(pay, result.number);
          return;
        }
        navigate(`/facture/${result.number}`);
        startMyposPayment(pay, result.number);
      } catch {
        // Repli : la facture reste consultable et payable depuis sa page.
        navigate(`/facture/${result.number}`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t({ fr: "Paiement indisponible, réessayez.", en: "Payment unavailable, please retry." }),
      );
    }
  };

  return (
    <div className="grid gap-2">
      <button
        type="button"
        onClick={run}
        disabled={disabled || busy}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary"
            ? "bg-primary text-primary-foreground hover:bg-primary-strong"
            : "border border-border hover:border-primary/50",
          className,
        )}
      >
        {busy ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
        {busy
          ? t({ fr: "Préparation du paiement…", en: "Preparing your payment…" })
          : (label ?? t({ fr: "Payer par carte bancaire", en: "Pay by card" }))}
      </button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}

/** Mention virement affichée à côté de chaque bouton de paiement (jamais d'IBAN en ligne). */
export function TransferNotice({ className, compact }: { className?: string; compact?: boolean }) {
  const { t } = useI18n();
  const message = t({
    fr: "Bonjour, je souhaite régler par virement bancaire. Pouvez-vous m'envoyer vos coordonnées bancaires ?",
    en: "Hello, I'd like to pay by bank transfer. Could you send me your bank details?",
  });

  return (
    <div className={cn("rounded-card border border-border bg-surface-2/60 p-4", className)}>
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Landmark className="size-4 text-primary" />
        {t({ fr: "Paiement par virement bancaire", en: "Payment by bank transfer" })}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        {t({
          fr: "Cliquez sur WhatsApp : le message de demande de nos coordonnées bancaires est déjà pré-rempli, il n'y a plus qu'à l'envoyer. Aucune donnée bancaire n'est publiée sur le site.",
          en: "Tap WhatsApp: the request for our bank details is already pre-filled, just send it. No banking data is published on the site.",
        })}
      </p>
      {compact ? null : (
        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={whatsappLink(message)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-[#04150c] transition hover:brightness-110"
          >
            <MessageCircle className="size-4" />
            {t({ fr: "Demander les coordonnées bancaires", en: "Request the bank details" })}
          </a>
          <a
            href={CONTACT.phoneHref}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
          >
            <Phone className="size-4 text-primary" />
            {CONTACT.phone}
          </a>
          <a
            href={`mailto:${CONTACT.email}?subject=${encodeURIComponent("Coordonnées bancaires")}`}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary/50"
          >
            {CONTACT.email}
          </a>
        </div>
      )}
    </div>
  );
}
