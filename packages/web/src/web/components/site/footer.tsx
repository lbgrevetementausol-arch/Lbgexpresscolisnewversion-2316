import { Link } from "wouter";
import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { CONTACT, whatsappLink } from "../../lib/format";


function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current text-primary">
      <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.5-3.91 3.78-3.91 1.1 0 2.24.2 2.24.2v2.47H15.2c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22C18.34 21.24 22 17.08 22 12.06Z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-current text-primary">
      <path d="M16.6 5.82a5.56 5.56 0 0 0 3.23 1.03v3.02a8.55 8.55 0 0 1-3.23-.65v5.99c0 3.03-2.45 5.49-5.47 5.49a5.48 5.48 0 0 1-2.37-10.42 5.7 5.7 0 0 1 2.37-.52c.35 0 .69.03 1.02.1v3.1a2.45 2.45 0 1 0 1.37 2.2V3.3h3.08c.2 1.02.72 1.91 1.48 2.52h-1.48Z" />
    </svg>
  );
}

const COLUMNS = [
  {
    title: { fr: "Services", en: "Services" },
    links: [
      { href: "/services", fr: "Tous nos services", en: "All services" },
      { href: "/covoiturage-colis", fr: "Covoiturage de colis", en: "Parcel ride-sharing" },
      { href: "/demenagement", fr: "Déménagement en France", en: "Moving in France" },
      { href: "/commande-internationale", fr: "International (Bénin, Togo, Mali)", en: "International (Benin, Togo, Mali)" },
      { href: "/devis", fr: "Devis en ligne", en: "Online quote" },
      { href: "/tarifs", fr: "Tarifs", en: "Pricing" },
    ],
  },
  {
    title: { fr: "Suivi & aide", en: "Tracking & help" },
    links: [
      { href: "/suivi", fr: "Suivre un colis", en: "Track a parcel" },
      { href: "/zones", fr: "Zones desservies", en: "Coverage" },
      { href: "/faq", fr: "Questions fréquentes", en: "FAQ" },
      { href: "/aide", fr: "Nous contacter", en: "Contact us" },
      { href: "/blog", fr: "Blog & conseils", en: "Blog & tips" },
    ],
  },
  {
    title: { fr: "Professionnels", en: "Business" },
    links: [
      { href: "/admin", fr: "Espace pro & API", en: "Pro area & API" },
      { href: "/livreur", fr: "Espace livreur", en: "Driver area" },
      { href: "/devenir-transporteur", fr: "Devenir transporteur", en: "Become a carrier" },
    ],
  },
  {
    title: { fr: "Informations légales", en: "Legal" },
    links: [
      { href: "/mentions-legales", fr: "Mentions légales", en: "Legal notice" },
      { href: "/cgv", fr: "CGV", en: "Terms of sale" },
      { href: "/livraison-delais", fr: "Livraison & délais", en: "Delivery & lead times" },
      { href: "/annulation-remboursement", fr: "Annulation & remboursement", en: "Cancellation & refund" },
      { href: "/confidentialite", fr: "Confidentialité", en: "Privacy policy" },
    ],
  },
];

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-surface/60">
      <div className="container-lbg grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/logo.png" alt="LBG Express Colis" className="size-11 rounded-lg" />
            <span className="font-display text-lg font-bold">
              LBG<span className="text-primary">EXPRESS</span> COLIS
            </span>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
            {t({
              fr: "Transport de colis, fret et déménagement en France et à l'international. Enlèvement à domicile, suivi temps réel, tarifs transparents.",
              en: "Parcel transport, freight and moving services across France and worldwide. Home pickup, real-time tracking, transparent pricing.",
            })}
          </p>
          <div className="mt-6 space-y-3 text-sm">
            <a href={CONTACT.phoneHref} className="flex items-center gap-3 text-muted transition hover:text-primary">
              <Phone className="size-4 text-primary" />
              {CONTACT.phone}
            </a>
            <a
              href={whatsappLink("Bonjour, je souhaite un devis LBG Express Colis.")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-muted transition hover:text-primary"
            >
              <MessageCircle className="size-4 text-primary" />
              WhatsApp
            </a>
            <a
              href={`mailto:${CONTACT.email}`}
              className="flex items-center gap-3 text-muted transition hover:text-primary"
            >
              <Mail className="size-4 text-primary" />
              {CONTACT.email}
            </a>
            <a
              href={CONTACT.instagram}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-muted transition hover:text-primary"
            >
              <Instagram className="size-4 text-primary" />
              Instagram @lbgexpresscolis
            </a>
            <a
              href={CONTACT.facebook}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-muted transition hover:text-primary"
            >
              <FacebookIcon />
              Facebook LBG Express Colis
            </a>
            <a
              href={CONTACT.tiktok}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 text-muted transition hover:text-primary"
            >
              <TikTokIcon />
              TikTok @lbgexpresscolis
            </a>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title.fr}>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-foreground">{t(col.title)}</h3>
            <ul className="space-y-2.5 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link to={link.href} className="text-muted transition hover:text-primary">
                    {t(link)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border py-6">
        <div className="container-lbg flex flex-col items-center gap-3 text-xs text-muted sm:flex-row sm:justify-center">
          <p>© {new Date().getFullYear()} LBG Express Colis. {t({ fr: "Tous droits réservés.", en: "All rights reserved." })}</p>
        </div>
      </div>
    </footer>
  );
}
