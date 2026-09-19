import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ChevronDown,
  Globe2,
  Languages,
  Menu,
  Moon,
  Package,
  Phone,
  Sofa,
  Sun,
  Users,
  X,
} from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { useTheme } from "../../lib/theme";
import { CONTACT } from "../../lib/format";
import { cn } from "@/lib/utils";

/**
 * Arborescence des services : une seule entrée « Nos Services » dans la barre, qui ouvre
 * les trois offres. Les anciennes entrées plates /demenagement et /commande-internationale
 * ont été retirées de la barre — elles vivent désormais dans ce menu.
 */
export const SERVICES = [
  {
    href: "/covoiturage-colis",
    icon: Users,
    fr: "Covoiturage de colis en France",
    en: "Parcel ride-sharing in France",
    descFr: "Votre colis voyage sur un trajet déjà prévu par un transporteur professionnel.",
    descEn: "Your parcel rides along a route a licensed carrier is already driving.",
  },
  {
    href: "/demenagement",
    icon: Sofa,
    fr: "Déménagement en France",
    en: "Moving in France",
    descFr: "Studio, appartement ou maison : tarif au m³ ou à la tonne, formule au choix.",
    descEn: "Studio, flat or house: priced per m³ or per tonne, service level of your choice.",
  },
  {
    href: "/commande-internationale",
    icon: Globe2,
    fr: "Colis International — Bénin, Togo, Mali",
    en: "International parcels — Benin, Togo, Mali",
    descFr: "Envois depuis la France vers l'Afrique de l'Ouest, aérien ou maritime.",
    descEn: "Shipments from France to West Africa, by air or by sea.",
  },
];

const NAV = [
  { href: "/tarifs", fr: "Tarifs", en: "Pricing" },
  { href: "/zones", fr: "Zones", en: "Coverage" },
  { href: "/blog", fr: "Blog", en: "Blog" },
  { href: "/aide", fr: "Aide", en: "Help" },
];

export function Header() {
  const { lang, setLang, t } = useI18n();
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setServicesOpen(false);
  }, [location]);

  // Fermeture du menu déroulant au clic extérieur et à l'échappement.
  useEffect(() => {
    if (!servicesOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!servicesRef.current?.contains(e.target as Node)) setServicesOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setServicesOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [servicesOpen]);

  const servicesActive = SERVICES.some((s) => s.href === location) || location === "/services";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled ? "glass border-border" : "border-transparent bg-transparent",
      )}
    >
      <div className="container-lbg flex h-[72px] items-center gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <img src="/images/logo.png" alt="LBG Express Colis" className="size-10 rounded-lg" />
          <span className="hidden font-display text-[0.95rem] font-bold leading-tight sm:block">
            LBG<span className="text-primary">EXPRESS</span>
            <span className="block text-[0.62rem] font-medium uppercase tracking-[0.22em] text-muted">Colis</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          <div
            ref={servicesRef}
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              type="button"
              onClick={() => setServicesOpen((v) => !v)}
              aria-expanded={servicesOpen}
              aria-haspopup="true"
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                servicesActive || servicesOpen ? "text-primary" : "text-muted hover:text-foreground",
              )}
            >
              {t({ fr: "Nos Services", en: "Our services" })}
              <ChevronDown className={cn("size-4 transition-transform", servicesOpen && "rotate-180")} />
            </button>

            {servicesOpen ? (
              <div className="absolute left-0 top-full w-[26rem] pt-2">
                <div className="glass rounded-card border border-border p-2 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.65)]">
                  {SERVICES.map((item) => (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setServicesOpen(false)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-surface-2",
                        location === item.href && "bg-surface-2",
                      )}
                    >
                      <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
                        <item.icon className="size-[1.1rem]" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-foreground">{t(item)}</span>
                        <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                          {t({ fr: item.descFr, en: item.descEn })}
                        </span>
                      </span>
                    </Link>
                  ))}
                  <Link
                    to="/services"
                    onClick={() => setServicesOpen(false)}
                    className="mt-1 block rounded-xl px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary transition-colors hover:bg-surface-2"
                  >
                    {t({ fr: "Voir tous nos services →", en: "See all our services →" })}
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {NAV.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                location === item.href ? "text-primary" : "text-muted hover:text-foreground",
              )}
            >
              {t(item)}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-2 text-xs font-semibold uppercase text-muted transition hover:border-primary/50 hover:text-foreground"
            aria-label="Language"
          >
            <Languages className="size-4" />
            {lang}
          </button>
          <button
            type="button"
            onClick={toggle}
            className="rounded-lg border border-border p-2 text-muted transition hover:border-primary/50 hover:text-foreground"
            aria-label="Theme"
          >
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          <a
            href={CONTACT.phoneHref}
            className="hidden items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted transition hover:border-primary/50 hover:text-foreground xl:flex"
          >
            <Phone className="size-4" />
            {CONTACT.phone}
          </a>
          <Link
            to="/suivi"
            className="hidden items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 md:flex"
          >
            <Package className="size-4" />
            {t({ fr: "Suivre", en: "Track" })}
          </Link>
          <Link
            to="/devis"
            className="hidden rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong sm:block"
          >
            {t({ fr: "Devis gratuit", en: "Free quote" })}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg border border-border p-2 text-muted lg:hidden"
            aria-label="Menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="glass border-t border-border lg:hidden">
          <nav className="container-lbg grid gap-1 py-4">
            <Link
              to="/suivi"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              {t({ fr: "Suivi de colis", en: "Track parcel" })}
            </Link>

            <p className="mt-2 px-3 pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-primary">
              {t({ fr: "Nos Services", en: "Our services" })}
            </p>
            {SERVICES.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-foreground"
              >
                <item.icon className="size-4 shrink-0 text-primary" />
                {t(item)}
              </Link>
            ))}
            <Link
              to="/services"
              className="rounded-lg px-3 py-2.5 pl-10 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-foreground"
            >
              {t({ fr: "Tous nos services", en: "All services" })}
            </Link>

            <div className="mt-2 border-t border-border pt-2" />
            {NAV.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-foreground"
              >
                {t(item)}
              </Link>
            ))}
            <Link
              to="/devis"
              className="mt-2 rounded-lg bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              {t({ fr: "Obtenir un devis gratuit", en: "Get a free quote" })}
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
