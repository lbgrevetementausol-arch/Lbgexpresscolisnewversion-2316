/**
 * Métadonnées SEO par page (title, description, canonical, Open Graph, Twitter)
 * et injection de données structurées JSON-LD (Organization, LocalBusiness, Service,
 * Article, FAQPage, BreadcrumbList).
 * Le site est une SPA : on met à jour le <head> à la volée côté client.
 */
import { useEffect } from "react";
import { CONTACT } from "./format";
import { COMPANY } from "./legal-content";

/** Domaine canonique du site en production. */
export const SITE_URL = "https://www.lbgexpresscolis.fr";

export type SeoInput = {
  title: string;
  description: string;
  /** Chemin absolu de la page, ex "/blog/mon-article". */
  path: string;
  /** Chemin ou URL de l'image de partage. */
  image?: string;
  /** "website" par défaut, "article" pour un billet de blog. */
  type?: "website" | "article";
  /** Page à exclure de l'index (404, pages de transaction). */
  noindex?: boolean;
  keywords?: string[];
};

function setMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

const absolute = (value: string) => (value.startsWith("http") ? value : `${SITE_URL}${value}`);

/** Applique les métadonnées de la page courante. */
export function useSeo(seo: SeoInput | null) {
  const key = seo ? JSON.stringify(seo) : "";

  useEffect(() => {
    if (!seo) return;
    const url = absolute(seo.path);
    const image = absolute(seo.image ?? "/images/hero.jpg");

    document.title = seo.title;
    setMeta('meta[name="description"]', "name", "description", seo.description);
    setMeta(
      'meta[name="robots"]',
      "name",
      "robots",
      seo.noindex ? "noindex, follow" : "index, follow",
    );
    if (seo.keywords?.length) {
      setMeta('meta[name="keywords"]', "name", "keywords", seo.keywords.join(", "));
    }
    setLink("canonical", url);

    setMeta('meta[property="og:type"]', "property", "og:type", seo.type ?? "website");
    setMeta('meta[property="og:title"]', "property", "og:title", seo.title);
    setMeta('meta[property="og:description"]', "property", "og:description", seo.description);
    setMeta('meta[property="og:url"]', "property", "og:url", url);
    setMeta('meta[property="og:image"]', "property", "og:image", image);

    setMeta('meta[name="twitter:card"]', "name", "twitter:card", "summary_large_image");
    setMeta('meta[name="twitter:title"]', "name", "twitter:title", seo.title);
    setMeta('meta[name="twitter:description"]', "name", "twitter:description", seo.description);
    setMeta('meta[name="twitter:image"]', "name", "twitter:image", image);
    // key sérialise l'objet seo : dépendance volontairement stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

/** Injecte un bloc <script type="application/ld+json"> retiré au démontage. */
export function useJsonLd(data: unknown | null, id: string) {
  const payload = data ? JSON.stringify(data) : "";

  useEffect(() => {
    if (!payload) return;
    const previous = document.getElementById(id);
    previous?.remove();
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    script.textContent = payload;
    document.head.appendChild(script);
    return () => script.remove();
  }, [payload, id]);
}

/**
 * Identité de l'entreprise pour Google : Organization + LocalBusiness + Service.
 * `sameAs` relie le site aux comptes sociaux et à la fiche Trustpilot (Knowledge Panel).
 * Volontairement sans AggregateRating ni Review : on ne fabrique pas de note.
 */
export function organizationJsonLd() {
  const orgId = `${SITE_URL}/#organization`;
  const areaServed = [
    { "@type": "AdministrativeArea", name: "Île-de-France" },
    { "@type": "Country", name: "France" },
    { "@type": "Country", name: "Bénin" },
    { "@type": "Country", name: "Togo" },
    { "@type": "Country", name: "Mali" },
  ];

  const service = (name: string, description: string, path: string, zones: unknown[]) => ({
    "@type": "Service",
    name,
    description,
    serviceType: name,
    provider: { "@id": orgId },
    areaServed: zones,
    url: absolute(path),
    availableChannel: {
      "@type": "ServiceChannel",
      serviceUrl: absolute("/devis"),
      servicePhone: { "@type": "ContactPoint", telephone: CONTACT.phone },
    },
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "LocalBusiness", "MovingCompany"],
        "@id": orgId,
        name: COMPANY.brand,
        legalName: COMPANY.legalName,
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: absolute("/images/logo.png") },
        image: absolute("/images/hero.jpg"),
        description:
          "Transport de colis, fret et déménagement en Île-de-France, partout en France et à l'international (Bénin, Togo, Mali). Enlèvement à domicile, suivi en temps réel, tarification transparente.",
        telephone: CONTACT.phone,
        email: CONTACT.email,
        vatID: COMPANY.vat,
        taxID: COMPANY.siret.replace(/\s/g, ""),
        identifier: [
          { "@type": "PropertyValue", propertyID: "SIRET", value: COMPANY.siret.replace(/\s/g, "") },
          { "@type": "PropertyValue", propertyID: "SIREN", value: COMPANY.siren.replace(/\s/g, "") },
        ],
        foundingDate: "2022-12-08",
        address: {
          "@type": "PostalAddress",
          streetAddress: COMPANY.addressLine,
          postalCode: "75008",
          addressLocality: "Paris",
          addressCountry: "FR",
        },
        areaServed,
        currenciesAccepted: "EUR",
        paymentAccepted: "Carte bancaire, Virement bancaire",
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
            opens: "08:00",
            closes: "20:00",
          },
        ],
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "customer service",
            telephone: CONTACT.phone,
            email: CONTACT.email,
            availableLanguage: ["fr", "en"],
            areaServed: ["FR", "BJ", "TG", "ML"],
          },
        ],
        sameAs: [
          CONTACT.instagram,
          CONTACT.facebook,
          CONTACT.tiktok,
          "https://fr.trustpilot.com/review/lbgexpresscolis.fr",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: COMPANY.brand,
        inLanguage: "fr-FR",
        publisher: { "@id": orgId },
      },
      service(
        "Livraison de colis en Île-de-France",
        "Enlèvement à domicile et livraison de colis dans les huit départements d'Île-de-France, avec suivi en temps réel.",
        "/services",
        [{ "@type": "AdministrativeArea", name: "Île-de-France" }],
      ),
      service(
        "Déménagement en Île-de-France",
        "Déménagement de particuliers et de professionnels en Île-de-France : chargement, transport et livraison avec équipe et véhicule adaptés.",
        "/demenagement",
        [{ "@type": "AdministrativeArea", name: "Île-de-France" }],
      ),
      service(
        "Envoi de colis vers l'Afrique de l'Ouest",
        "Expédition aérienne et maritime de colis et de fret vers le Bénin (Cotonou), le Togo (Lomé) et le Mali (Bamako), au départ de la France.",
        "/commande-internationale",
        [
          { "@type": "Country", name: "Bénin" },
          { "@type": "Country", name: "Togo" },
          { "@type": "Country", name: "Mali" },
        ],
      ),
    ],
  };
}

/** Données structurées d'un article de blog + FAQ associée. */
export function articleJsonLd(input: {
  title: string;
  description: string;
  path: string;
  image: string;
  publishedAt: string;
  faq?: { q: string; a: string }[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "Article",
      headline: input.title,
      description: input.description,
      image: absolute(input.image),
      datePublished: input.publishedAt,
      dateModified: input.publishedAt,
      inLanguage: "fr-FR",
      mainEntityOfPage: { "@type": "WebPage", "@id": absolute(input.path) },
      author: { "@type": "Organization", name: "LBG Express Colis", url: SITE_URL },
      publisher: {
        "@type": "Organization",
        name: "LBG Express Colis",
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: absolute("/images/logo.png") },
      },
    },
  ];

  if (input.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: input.faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
