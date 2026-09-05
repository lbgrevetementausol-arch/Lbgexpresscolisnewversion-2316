import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Languages, Menu, Moon, Package, Phone, Sun, X } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { useTheme } from "../../lib/theme";
import { CONTACT } from "../../lib/format";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/services", fr: "Services", en: "Services" },
  { href: "/tarifs", fr: "Tarifs", en: "Pricing" },
  { href: "/zones", fr: "Zones", en: "Coverage" },
  { href: "/demenagement", fr: "Déménagement", en: "Moving" },
  { href: "/commande-internationale", fr: "International", en: "International" },
  { href: "/blog", fr: "Blog", en: "Blog" },
  { href: "/aide", fr: "Aide", en: "Help" },
];

export function Header() {
  const { lang, setLang, t } = useI18n();
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location]);

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
            {[{ href: "/suivi", fr: "Suivi de colis", en: "Track parcel" }, ...NAV].map((item) => (
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
