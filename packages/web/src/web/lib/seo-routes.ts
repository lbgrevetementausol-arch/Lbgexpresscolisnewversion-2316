/**
 * Source unique des métadonnées SEO des routes statiques.
 *
 * Deux consommateurs :
 *  1. les pages, via `useSeo(SEO_ROUTES["/services"])` — mise à jour du <head> côté client ;
 *  2. `scripts/prerender.ts`, qui génère au build un `<head>` correct par route dans le HTML
 *     brut servi aux robots (le site est une SPA : sans ça toutes les URLs renvoient le même
 *     titre et la même description, d'où le motif « Explorée, actuellement non indexée »).
 *
 * ⚠️ Le type est redéclaré ici volontairement : ce fichier doit rester importable par Bun
 * hors de Vite, donc sans dépendance à React ni au reste de `src/web`.
 *
 * Les routes de transaction et d'espace privé sont marquées `noindex`, en cohérence avec
 * les `Disallow` de public/robots.txt.
 */

export type RouteSeo = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string[];
};

export const SEO_ROUTES: Record<string, RouteSeo> = {
  "/": {
    title: "Transport de colis & déménagement en France et à l'international | LBG Express Colis",
    description:
      "Envoi de colis, palettes, fret international et déménagement : devis en ligne en 60 secondes, enlèvement sous 24 h, suivi en temps réel et assurance incluse. Particuliers et entreprises.",
    path: "/",
    image: "/images/hero.jpg",
    keywords: [
      "envoyer un colis",
      "expédition de colis",
      "entreprise de déménagement",
      "devis déménagement en ligne",
      "envoi colis international",
      "suivre un colis",
    ],
  },
  "/devis": {
    title: "Devis transport et déménagement en ligne — prix en 60 secondes | LBG Express Colis",
    description:
      "Calculez le prix d'un envoi de colis, d'une palette ou d'un déménagement en ligne. Devis ferme immédiat, enlèvement sous 24 h, assurance et suivi inclus.",
    path: "/devis",
    image: "/images/livraison.jpg",
    keywords: [
      "devis déménagement en ligne",
      "devis transport colis",
      "calculateur volume déménagement",
      "tarif envoi colis",
    ],
  },
  "/suivi": {
    title: "Suivre un colis LBG Express Colis — suivi en temps réel",
    description:
      "Entrez votre numéro de suivi pour connaître la position de votre colis en temps réel : enlevé, en transit, en cours de livraison, livré. Assistance WhatsApp en cas de blocage.",
    path: "/suivi",
    image: "/images/livraison-2.jpg",
    keywords: ["suivre un colis", "suivi colis", "numéro de suivi", "où est mon colis"],
  },
  "/demenagement": {
    title: "Entreprise de déménagement — devis en ligne, tarif au m³ | LBG Express Colis",
    description:
      "Déménagement économique, standard ou confort : tarif au m³, déménagement groupé, cartons, monte-meuble et étages. Calculez votre volume et obtenez un devis de déménagement en ligne.",
    path: "/demenagement",
    image: "/images/demenagement.jpg",
    keywords: [
      "déménagement",
      "entreprise de déménagement",
      "déménageur",
      "tarif déménagement",
      "devis déménagement en ligne",
      "déménagement pas cher",
    ],
  },
  "/commande-internationale": {
    title: "Envoi de colis au Bénin, Togo et Mali depuis la France | LBG Express Colis",
    description:
      "Envoi de colis et de cartons vers le Bénin (Cotonou), le Togo (Lomé) et le Mali (Bamako) : aérien 5 à 10 jours, maritime 30 à 45 jours. Douane, documents, prix ferme et facture avec TVA.",
    path: "/commande-internationale",
    image: "/images/aerien.jpg",
    keywords: [
      "envoyer un colis au Bénin",
      "envoi colis Cotonou",
      "envoi colis Lomé",
      "envoi colis Bamako",
      "fret aérien colis Afrique",
      "envoi colis international",
    ],
  },
  "/services": {
    title: "Nos services de transport : colis, palettes, fret et déménagement | LBG Express Colis",
    description:
      "Livraison de colis en 24 à 72 h, palettes et messagerie, fret aérien et maritime, déménagement et stockage. Enlèvement à domicile ou en entreprise, preuve de livraison photo et signature.",
    path: "/services",
    image: "/images/livraison.jpg",
    keywords: [
      "services de livraison",
      "société de livraison",
      "livraison express Paris",
      "transport de palettes",
      "livraison e-commerce",
    ],
  },
  "/zones": {
    title: "Zones desservies : Paris, Île-de-France et grandes villes | LBG Express Colis",
    description:
      "Nous livrons Paris et les huit départements d'Île-de-France (75, 77, 78, 91, 92, 93, 94, 95), les grandes villes françaises, et expédions vers le Bénin, le Togo et le Mali.",
    path: "/zones",
    image: "/images/van-night.jpg",
    keywords: [
      "livraison colis Paris",
      "livraison Île-de-France",
      "coursier Paris",
      "zones de livraison",
    ],
  },
  "/tarifs": {
    title: "Tarifs transport de colis et déménagement 2026 — grille de prix | LBG Express Colis",
    description:
      "Grille tarifaire complète : envoi de colis en Île-de-France et en France, palettes, fret vers le Bénin, le Togo et le Mali, et déménagement au m³. Prix au kilo, options et suppléments détaillés.",
    path: "/tarifs",
    image: "/images/palette.jpg",
    keywords: [
      "tarif envoi colis",
      "tarif déménagement",
      "prix envoi colis",
      "envoi colis pas cher",
      "grille tarifaire transport",
    ],
  },
  "/faq": {
    title: "Questions fréquentes : prix, délais, assurance et douane | LBG Express Colis",
    description:
      "Comment le prix est-il calculé ? Quel est le poids taxable ? Que couvre l'assurance ? Quels documents pour la douane ? Les réponses aux questions les plus posées sur nos envois et déménagements.",
    path: "/faq",
    image: "/images/entrepot.jpg",
    keywords: [
      "poids taxable colis",
      "assurance colis",
      "douane envoi colis",
      "délai livraison colis",
    ],
  },
  "/aide": {
    title: "Contact et assistance — téléphone, WhatsApp, e-mail | LBG Express Colis",
    description:
      "Une question sur un devis, un colis en cours ou une réclamation ? Joignez-nous par téléphone, WhatsApp ou e-mail du lundi au samedi de 8 h à 20 h, ou écrivez-nous via le formulaire.",
    path: "/aide",
    image: "/images/livraison-2.jpg",
    keywords: ["contact LBG Express Colis", "assistance colis", "réclamation colis"],
  },
  "/blog": {
    title: "Blog déménagement & envoi de colis — conseils, tarifs, volumes | LBG Express Colis",
    description:
      "Calculer son volume de déménagement, comparer les tarifs d'envoi de colis, choisir un déménageur, envoyer un gros colis ou un colis à l'international : nos guides pratiques, chiffres à l'appui.",
    path: "/blog",
    image: "/images/livraison.jpg",
    keywords: [
      "déménagement",
      "tarif déménagement",
      "calculateur de volume déménagement",
      "envoyer un colis",
      "envoi colis pas cher",
      "tarif envoi colis",
      "envoi colis international",
      "suivre un colis",
    ],
  },
  "/devenir-transporteur": {
    title: "Devenir transporteur partenaire — courses payées sous 7 jours | LBG Express Colis",
    description:
      "Vous êtes transporteur ou livreur indépendant en Île-de-France ? Rejoignez notre réseau : vous choisissez vos zones et vos créneaux, facturation automatique et virement hebdomadaire.",
    path: "/devenir-transporteur",
    image: "/images/van-night.jpg",
    keywords: [
      "devenir transporteur partenaire",
      "livreur indépendant Île-de-France",
      "sous-traitance transport",
      "emploi livreur Paris",
    ],
  },

  // ---- Routes exclues de l'index (cohérent avec les Disallow de robots.txt) ----
  "/livreur": {
    title: "Espace livreur — LBG Express Colis",
    description: "Accès réservé aux livreurs partenaires : tournées du jour, mises à jour de statut et historique.",
    path: "/livreur",
    noindex: true,
  },
  "/connexion": {
    title: "Connexion — LBG Express Colis",
    description: "Connectez-vous à votre espace client LBG Express Colis.",
    path: "/connexion",
    noindex: true,
  },
  "/inscription": {
    title: "Créer un compte — LBG Express Colis",
    description: "Créez votre compte pour suivre vos envois et retrouver vos devis et factures.",
    path: "/inscription",
    noindex: true,
  },
  "/espace-client": {
    title: "Espace client — LBG Express Colis",
    description: "Vos devis, vos envois, vos suivis et vos factures.",
    path: "/espace-client",
    noindex: true,
  },
};

/** Routes à pré-rendre côté statique (les `noindex` en font partie : le robots meta doit être dans le HTML brut). */
export const PRERENDER_ROUTES = Object.keys(SEO_ROUTES);
