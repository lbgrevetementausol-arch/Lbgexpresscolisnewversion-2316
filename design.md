# LBG Express Colis — Design

Site complet (web) de la société de transport et déménagement **LBG Express Colis** : livraison express, fret aérien/maritime, déménagement, France ↔ international. Le site vend un devis en 30 secondes et rassure par le suivi temps réel. Bilingue FR/EN. Direction visuelle : logistique nocturne premium — fond slate profond, accents cyan lumineux, cartes vitrées, hero asymétrique inspiré des sites logistiques modernes (référence fournie par le client) mais en version dark/glow.

## Brand & Colors

Tokens CSS dans `packages/web/src/web/styles.css` (`:root` = dark par défaut, `.light` = variante clair).

| Token | Dark (défaut) | Light | Usage |
|-------|---------------|-------|-------|
| primary | #39D5FF | #0891B2 | CTA, liens actifs, glow |
| primary-strong | #06B6D4 | #0E7490 | Hover CTA |
| background | #0A1220 | #F8FAFC | Fond de page |
| surface | #0F172A | #FFFFFF | Cartes, panneaux |
| surface-2 | #16213A | #F1F5F9 | Cartes imbriquées, inputs |
| foreground | #F8FAFC | #0F172A | Texte principal |
| muted | #94A3B8 | #475569 | Texte secondaire |
| border | rgba(148,163,184,.16) | #E2E8F0 | Hairlines |
| success | #34D399 | #059669 | Colis livré |
| warning | #FBBF24 | #D97706 | En transit / attente |
| danger | #F87171 | #DC2626 | Erreurs, annulation |

Effets signature : `--glow: 0 0 40px rgba(57,213,255,.28)`, cartes `backdrop-blur` + bordure 1px cyan à 18 %, grille radiale en fond de hero, dégradés `linear-gradient(135deg,#39D5FF,#0891B2)` sur les chiffres clés et badges.

## Typography

- **Display** : Poppins (600/700/800) — titres, chiffres, boutons. `--font-display`.
- **Body** : Inter (300/400/500/600) — paragraphes, formulaires, tableaux. `--font-body`.
- Hero h1 `clamp(2.4rem, 5vw, 4.2rem)`, letter-spacing -0.02em, line-height 1.05. Corps 1.0625rem / 1.7.
- Sur-titres : uppercase, 0.75rem, letter-spacing 0.18em, couleur primary.

## Pages (routes dans `packages/web/src/web/app.tsx`)

| Route | Fichier | Contenu |
|-------|---------|---------|
| `/` | `pages/index.tsx` | Hero + calculateur de prix instantané, chiffres clés, services, process 4 étapes, zones, témoignages, FAQ courte, CTA |
| `/suivi` | `pages/suivi.tsx` | Recherche `TRK-…`, timeline d'événements, carte position, partage WhatsApp |
| `/devis` | `pages/devis.tsx` | Devis colis détaillé (adresses Google Places, dimensions, options) → prix + enregistrement |
| `/demenagement` | `pages/demenagement.tsx` | Devis déménagement (volume m³, étages, ascenseur, formule) |
| `/commande-internationale` | `pages/international.tsx` | Achat/expédition depuis l'étranger, aérien/maritime, incoterms simples |
| `/services` | `pages/services.tsx` | 6 services détaillés |
| `/tarifs` | `pages/tarifs.tsx` | Grille tarifaire + simulateur |
| `/zones` | `pages/zones.tsx` | Zones France + international, délais |
| `/faq` | `pages/faq.tsx` | FAQ accordéon par thème |
| `/aide` | `pages/aide.tsx` | Contact (formulaire + WhatsApp + tel) |
| `/blog`, `/blog/:slug` | `pages/blog.tsx`, `pages/blog-post.tsx` | Articles conseils transport |
| `/devenir-transporteur` | `pages/transporteur.tsx` | Recrutement partenaires + formulaire candidature |
| `/livreur` | `pages/livreur.tsx` | Espace livreur : login (email + code), courses du jour, statut, envoi position GPS |
| `/pro` | `pages/pro.tsx` | Dashboard pro : accès par code, stats, suivis, devis, clés API, webhooks, export CSV |
| `/paiement/:ref` | `pages/paiement.tsx` | Récapitulatif devis + paiement (enregistrement de la transaction) |
| `/mentions-legales`, `/cgv` | `pages/legal.tsx` | Pages légales |
| 404 | `pages/not-found.tsx` | Erreur |

Composants partagés : `components/site/header.tsx` (nav sticky + switch langue + switch thème), `footer.tsx`, `section.tsx`, `card.tsx`, `address-input.tsx` (Google Places Autocomplete), `price-calculator.tsx`, `tracking-timeline.tsx`, `whatsapp-button.tsx`, `reveal.tsx` (animation d'apparition).

## Key User Flows

1. **Devis → paiement → suivi** : calculateur (poids/dimensions/villes) → prix instantané → formulaire → `quotes` + numéro `TRK-YYYYMMDD-XXXXXX` → page paiement → événements de suivi visibles sur `/suivi`.
2. **Suivi public** : saisie du numéro → timeline + dernière position GPS → partage WhatsApp.
3. **Livreur** : login email + code → liste des courses → changement de statut (récupéré / en transit / livré) → position GPS envoyée (géolocalisation navigateur) → événement ajouté au suivi.
4. **Pro** : code d'accès → stats (devis, CA, colis en cours, livrés) → table des suivis + devis → création/révocation de clés API → webhooks.

## Architecture

- API oRPC : `routes/quotes.ts` (estimation + devis), `routes/tracking.ts` (suivi, événements, positions), `routes/drivers.ts` (espace livreur), `routes/pro.ts` (stats, clés API, webhooks), `routes/content.ts` (contact, candidatures, blog).
- Tarification centralisée dans `src/api/lib/pricing.ts` (grille poids × distance zone × service × options) — même fonction utilisée par le calculateur public et le devis.
- i18n maison FR/EN : `src/web/lib/i18n.tsx` (contexte + dictionnaire, persistance `localStorage`).
- Thème : classe `light` sur `<html>`, persistée, dark par défaut.
- Autocomplétion d'adresses open source : `hooks/use-address-search.ts` (debounce 300 ms) -> route serveur `geo.search` (`api/routes/geo.ts`) qui interroge Photon puis Nominatim en repli, avec cache 15 min et limite 1 req/s sur Nominatim. Aucune clé API, chaque suggestion renvoie lat/lng pour le calcul de distance.
