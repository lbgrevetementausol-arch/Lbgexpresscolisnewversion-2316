import { useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "./header";
import { Footer } from "./footer";
import { WhatsAppButton } from "./whatsapp-button";
import { SupportChat } from "./support-chat";
import { CookieBanner } from "./cookie-banner";
import { NewsletterPopup } from "./newsletter-popup";
import { useJsonLd, organizationJsonLd } from "../../lib/seo";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Identité de l'entreprise (Organization + LocalBusiness + Service + sameAs) : présente sur
  // toutes les pages du site, c'est ce que Google lit pour relier le domaine aux comptes sociaux.
  useJsonLd(organizationJsonLd(), "ld-organization");

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
      <SupportChat />
      <NewsletterPopup />
      <CookieBanner />
    </div>
  );
}

/** En-tête de page interne (hero compact réutilisé par toutes les pages secondaires). */
export function PageHero({
  eyebrow,
  title,
  lead,
  image,
  children,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  image?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {image ? (
        <>
          <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        </>
      ) : (
        <div className="grid-bg absolute inset-0 opacity-70" />
      )}
      <div
        className="absolute -left-24 top-[-8rem] size-[26rem] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(57,213,255,0.22), transparent 70%)" }}
      />
      <div className="container-lbg relative py-16 md:py-24">
        {eyebrow ? (
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="max-w-4xl text-4xl font-extrabold leading-[1.05] md:text-[3.25rem]">{title}</h1>
        {lead ? <p className="mt-6 max-w-2xl text-[1.0625rem] leading-relaxed text-muted">{lead}</p> : null}
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
