# LBG Express Colis — reconstruction du site

Stack managée : Bun + Vite + React 19 + Wouter + Tailwind 4 + Hono/oRPC + Drizzle/Turso.
App : `/home/user/lbg-express`, port web **4200** (jamais changer).

## Fait
- [x] `app_init`, logo + favicon dans `public/`
- [x] `design.md` (palette cyan/slate, Poppins+Inter, 18 routes)
- [x] `styles.css` (tokens dark/light, utilities glass/glow/grid, reveal, .pac-container)
- [x] `api/lib/pricing.ts` (zones, services, computePrice, TRK-YYYYMMDD-XXXXXX)
- [x] `api/lib/posts.ts` (6 articles bilingues)
- [x] `api/database/schema.ts` (11 tables) + `db:push` OK
- [x] routes API : quotes, tracking, drivers, pro, content
- [x] `api/index.ts` router composé
- [x] `api/database/seed.ts` exécuté
- [x] images dans `public/images/` + `public/images/blog/`

## Données de démo
- Suivis : TRK-20260824-DEMO01 (en livraison + GPS), TRK-20260820-DEMO02 (international),
  TRK-20260812-DEMO03 (livré), TRK-20260826-DEMO04 (déménagement)
- Livreurs : moussa@lbgexpresscolis.fr / LBG001 — sophie@lbgexpresscolis.fr / LBG002
- Code pro : LBG-PRO-2026

## Fait (front)
- [x] `web/lib/i18n.tsx` (FR/EN), `web/lib/theme.tsx`, `web/lib/format.ts`
- [x] `web/hooks/use-google-maps.ts`, `components/site/address-input.tsx`
- [x] `components/site/`: header, footer, whatsapp-button, reveal, section, field,
      price-calculator, quote-form, tracking-timeline, layout
- [x] `web/queries/`: quotes, tracking, drivers, pro, content, ping
- [x] 18 pages + routes dans `app.tsx` (dont transporteur, livreur, pro, paiement)
- [x] `index.html` : lang=fr, SEO complet, Google Fonts Poppins/Inter
- [x] `bun run lint` (0 erreur) + `bun run build` (OK) + `bun run dev` sur 4200

## Contrôle visuel (Chrome/Playwright, 1440x900 + 390x844)
- [x] Accueil, tarifs, suivi, devis, services, zones, blog, article, pro, livreur,
      transporteur, mentions légales, 404 — desktop + mobile
- [x] Parcours devis → `/paiement/DEV-XXXX` → paiement carte → « Commande enregistrée »
      + numéro TRK + lien suivi
- [x] Suivi démo TRK-20260824-DEMO01 : timeline, historique, carte position GPS
- [x] Espace livreur (moussa@lbgexpresscolis.fr / LBG001) : 2 courses, statuts, GPS, itinéraire
- [x] Dashboard pro (LBG-PRO-2026) : KPI, graphe 14 j, onglets devis/colis/livreurs/messages/API
- [x] Switch FR/EN et dark/light sur toutes les pages testées
- [x] Aucune erreur console relevée

## Reste côté client (hors périmètre technique)
- [ ] PSP réel (Stripe/PayPal) : clés marchand à fournir, `quotes.pay` à brancher
- [ ] Pixels pub Meta/TikTok/Google Ads : IDs réels à fournir
- [ ] Emails transactionnels (confirmation devis / suivi) : à activer via le module email

## Décisions
- Pas de Supabase (remplacé par oRPC/Drizzle) ; pas de PayPal réel (flux enregistré en base,
  `virement` → en_attente, autres → confirme) ; pixels pub non réintégrés (IDs placeholders).
- Auth simple : livreur email+code en base, pro = code d'accès `PRO_ACCESS_CODE`.
- Coordonnées réelles : +33 6 95 09 86 88 (tel + WhatsApp), contact@lbgexpresscolis.fr.

## V2 — back-office sécurisé, factures MyPOS, chatbot, export (en cours)
### Lot 1 — badge
- [x] `RunableBadge` retiré de `app.tsx` (import + rendu). AgentFeedback + analytics conservés.
### Lot 3 — auth + back-office
- [x] `better-auth@1.6.19` installé, `src/api/auth.ts` (email+mdp, champs role/accountStatus/phone/company/mustChangePassword)
- [x] `database/auth-schema.ts` généré + réexporté, tables `invoices`, `invoice_items`, `site_settings`, `audit_log`, `chat_leads`, colonnes `quotes.user_id/invoice_id/decision*`
- [x] `bun run db:push` OK ; `database/seed-admin.ts` exécuté (admin + client démo + réglages + 2 factures + leads)
- [x] `middleware/auth.ts` (withUser / authed / adminOnly), routes `admin.ts`, `invoices.ts`, `support.ts`, handler Better Auth + webhook WhatsApp montés dans `index.ts`
- [x] front : `lib/auth.ts`, bearer dans `lib/api.ts`, queries admin/invoices/support
- [ ] pages admin + espace client + protected-route + routes app.tsx
### Lot 4 — factures + MyPOS
- [x] `lib/invoicing.ts` (numérotation FA-AAAA-NNNN, totaux HT/TVA/TTC, lien MyPOS)
- [x] `components/site/pay-button.tsx` (PayButton + TransferNotice)
- [ ] page `/facture/:numero`, page retour, remplacement de tous les boutons de paiement
### Lot 2 — chatbot
- [x] `routes/support.ts` (FAQ bilingue, lookup TRK, lead + webhook optionnel)
- [ ] `components/site/support-chat.tsx` + intégration layout
### Lot 5 — export Hostinger
- [ ] ZIP source, schema.sql / schema.mysql.sql, .env.example, DEPLOIEMENT-HOSTINGER.md, deploy/
### Identifiants
- admin@lbgexpresscolis.fr / LbgAdmin2026! (mustChangePassword)
- client.demo@lbgexpresscolis.fr / LbgClient2026!


## V2 — état final (28/08/2026)
- Lot 1 badge Runable : supprimé. FAIT
- Lot 2 chat/WhatsApp auto-répondeur (+ webhook optionnel) : FAIT
- Lot 3 back-office sécurisé (auth email/mot de passe, rôles, 6 panneaux, /admin, /espace-client, /pro migré) : FAIT
- Lot 4 tunnel MyPOS unique (PayButton -> facture pro -> mypos.com/@lbgrevetement) + TransferNotice virement : FAIT
- Lot 5 export : /home/user/lbg-export (zip source, db/schema.sql, schema.mysql.sql, seed.sql, .env.example, deploy/, DEPLOIEMENT-HOSTINGER.md) : FAIT
- Vérifs : bun run lint 0 erreur, bun run build OK, toutes les routes 200.

## V3 — état final (28/08/2026)
- Moteur tarifaire réel (grille PDF client) : `lib/pricing.ts` réécrit — poids volumétrique L×l×H/5000, zones IDF/France/Corse/Europe/Maghreb/Afrique/Monde (base ≤5 kg + €/kg 5-30 + €/kg >30), palette Europe 65→240 € HT selon distance, déménagement €/m³ Éco/Standard/Confort. FAIT
- Réglages pilotables depuis /admin : `lib/settings.ts` (12 clés dans `site_settings`, groupe « tarifs », cache 30 s, invalidation à la sauvegarde). FAIT
- E-mails transactionnels Resend : `services/email.ts` (6 modèles) câblés sur devis, contact, transporteur, facture, suivi. FAIT — bloqué côté DNS uniquement (domaine lbgexpresscolis.fr non vérifié chez Resend).
- Pixels : GTM GTM-T4SBXXMF + Meta Pixel 1186689563634885 dans `index.html`, helpers `lib/pixels.ts` (Lead, InitiateCheckout, CompleteRegistration, Contact). FAIT
- Front : champs cartons / monte-meuble / distance dans le formulaire de devis, page /tarifs alignée sur la vraie grille, lien Instagram en pied de page. FAIT

## V4 — myPOS Checkout (28/08/2026)
- `lib/mypos.ts` : config depuis .env, signature RSA-SHA256 (base64 des valeurs jointes par « - »), vérification des callbacks avec le certificat myPOS, construction du formulaire IPCPurchase v1.4. FAIT
- `invoices.myposSession` : renvoie action + champs signés (montant TTC et référence pré-remplis) à partir du numéro de facture. FAIT
- Webhook `POST /api/webhooks/mypos` (`services/mypos-settlement.ts`) : signature vérifiée, montant contrôlé, facture → payee, paiement enregistré, commande → paye, e-mail de confirmation, réponse « OK » en texte brut, idempotent. FAIT
- Front : `lib/mypos.ts` (auto-submit POST), `pay-button.tsx` et page facture branchés sur la session signée, repli sur le lien myPOS générique. FAIT
- .env : MYPOS_STORE_ID=1462282, MYPOS_CLIENT_NUMBER=40077113658, MYPOS_KEY_INDEX=4, clé privée + certificat en base64, MYPOS_SANDBOX=false (les clés du pack sont des clés de production ; checkout-test renvoie E_INVALID_PARAMS: KeyIndex).
- Vérifs : lint 0 erreur, build OK, session réelle générée pour FA-2026-0001 (117,00 €) vers https://mypos.com/vmp/checkout, webhook 401 sur signature invalide.
- À FAIRE : paiement réel de bout en bout pour valider le webhook ; régénérer le pack myPOS (clé privée passée en clair dans le chat) ; vérifier les DNS Resend (send MX + SPF + resend._domainkey).

## V5 — SEO : 15 nouveaux articles de blog + balisage

### Articles (21 au total sur /blog)
Déménagement (`packages/web/src/api/lib/posts-demenagement.ts`) :
- comment-calculer-le-volume-de-son-demenagement
- tarif-demenagement-prix-2026
- demenagement-pas-cher-groupage
- demenageur-paris-lyon-marseille-comment-choisir
- aides-au-demenagement-2026
- location-camion-ou-demenageur-le-vrai-calcul
- combien-de-cartons-pour-un-demenagement
- checklist-demenagement-8-semaines

Colis / international (`packages/web/src/api/lib/posts-colis.ts`) :
- envoyer-un-colis-pas-cher-en-france
- prix-envoi-colis-10-kg
- envoyer-un-gros-colis-hors-format
- envoi-colis-international-europe-maghreb-afrique
- suivre-un-colis-comprendre-les-statuts
- point-relais-ou-enlevement-a-domicile
- poids-volumetrique-colis-explication

### Technique
- `Post` étendu : `keywords?: string[]`, `faq?: {q,a}[]` (FR/EN). `POSTS` = legacy + déménagement + colis, trié par date décroissante.
- `blog-post.tsx` : rendu du gras `**...**`, bloc FAQ dépliable, liste des mots-clés liés.
- `lib/seo.ts` : `useSeo()` (title, description, canonical, og:*, twitter:*), `useJsonLd()`, `articleJsonLd()` (Article + FAQPage). Domaine canonique `https://www.lbgexpresscolis.fr`.
- Métadonnées câblées : `/`, `/devis`, `/tarifs`, `/demenagement`, `/commande-internationale`, `/suivi`, `/blog`, `/blog/:slug`.
- `public/sitemap.xml` (38 URLs) + `public/robots.txt` (admin/espace client/paiement exclus).
- `components/site/guides.tsx` : maillage interne — blocs de guides sur /tarifs, /demenagement, /commande-internationale, /suivi.
- Chiffres alignés sur `lib/pricing.ts` (aucun tarif inventé).

### Reste à faire côté client (hors code)
- Publier le site sur `lbgexpresscolis.fr` (aujourd'hui en preview `*.runable.site`).
- Déclarer `https://www.lbgexpresscolis.fr/sitemap.xml` dans Google Search Console.

## V6 — sécurisation des écritures de suivi (31/08/2026)

### Problème
`tracking.create`, `tracking.addEvent`, `tracking.pushLocation` et `tracking.search` étaient en `base` : n'importe qui pouvait injecter un événement sur un colis ou lister tous les colis de la base.

### Correctif
- Nouveau `packages/web/src/api/middleware/api-key.ts` → middleware `partnerOrAdmin` :
  - en-tête `x-lbg-api-key` présent → clé cherchée dans `api_keys`, refusée si trop courte ou révoquée, `lastUsedAt` mis à jour ;
  - sinon → session Better Auth exigée avec `role === "admin"` ;
  - sinon 401 `UNAUTHORIZED`. Injecte `context.caller` (`{kind:"admin"|"api"}`) pour la traçabilité future.
- `routes/tracking.ts` : `create`, `addEvent`, `pushLocation`, `search` passent de `base` à `partnerOrAdmin`.
- Restent publics : `tracking.get` et `tracking.locations` (service client, protégés par la connaissance du numéro).
- `pages/pro.tsx` : bloc « Comment l'utiliser » sous les clés API (en-tête attendu + exemple curl).

### Vérifié au runtime (curl)
- addEvent sans en-tête → 401 ; avec clé démo → `{"ok":true}` ; avec fausse clé → 401 « Clé API invalide ou révoquée ».
- search sans en-tête → 401 ; avec clé → liste OK. `tracking.get` sans clé → 200.
- Aucun appel front impacté (`useCreateTracking`/`useAddTrackingEvent` inutilisés ; le back-office passe par `admin.addTrackingEvent`, le dashboard pro par `pro.trackings`).

### Faiblesse restante
`drivers.updateJob` et `drivers.pushLocation` sont toujours publics, protégés seulement par un `driverId` numérique devinable. Correctif proposé (non fait, en attente d'accord) : jeton signé émis par `drivers.login` et exigé sur ces deux procédures.

## V7 — session livreur signée (31/08/2026)

### Problème
`drivers.jobs`, `history`, `updateJob`, `pushLocation` n'exigeaient qu'un `driverId` numérique passé en clair : n'importe qui pouvait énumérer 1, 2, 3 et lire ou modifier les courses d'un livreur.

### Correctif
- Nouveau `packages/web/src/api/lib/driver-token.ts` : `signDriverToken(id)` / `verifyDriverToken(token)`.
  Jeton `driverId.expiration.signatureHMAC-SHA256`, secret = `BETTER_AUTH_SECRET`, durée de vie 12 h, comparaison en temps constant.
- `drivers.login` renvoie désormais `token` en plus du profil.
- `jobs`, `history`, `updateJob`, `pushLocation` prennent `token` à la place de `driverId` — l'identifiant est dérivé du jeton, plus jamais fourni par le client.
- `pushLocation` vérifie en plus que le colis est bien attribué à ce livreur (sinon 403).
- Front : `queries/drivers.ts` et `pages/livreur.tsx` passent le jeton ; `readSession()` rejette une session localStorage sans jeton (reconnexion forcée).

### Vérifié au runtime (curl)
- login → jeton ; `jobs` avec jeton → courses du livreur ; jeton falsifié → 401 « Session livreur invalide » ; ancien appel `driverId` → 400 validation ; `pushLocation` sur un colis d'un autre livreur → 403.

## V8 — back-office complété + mise en ligne VPS (31/08/2026)

### Back-office
- `/admin` → Suivis : carte « Créer un suivi » (départ, destination, destinataire, service, poids, transporteur), `source: "pro"`, numéro reporté dans le formulaire d'événement.
- `/admin` → Carte livreurs : `admin.driverPositions` (dernière position GPS par course, limite 400 lignes) + Leaflet/OSM, rafraîchissement 15 s, couleur par statut, indicateur de fraîcheur.
- Fusion `/pro` dans `/admin` : nouveaux panneaux `drivers-panel`, `integrations-panel`, `inbox-panel` ; code pro récupéré automatiquement via `admin.proToken` ; `/pro` redirige vers `/admin` ; 10 onglets.
- Statut `collecte` (inexistant) remplacé par `pris_en_charge` dans `admin.addTrackingEvent` et le panneau Suivis.

### Mise en ligne VPS Hostinger (187.7.18.167)
- Ubuntu 26.04.1 LTS, accès SSH par clé `/home/user/.ssh/lbg_vps`, mot de passe SSH désactivé, UFW (22/80/443) + fail2ban.
- Bun 1.4.0, code dans `/var/www/lbg-express`, build OK.
- SQLite local `/var/lib/lbg-express/lbg.db` (dialecte turso avec `DATABASE_AUTH_TOKEN="local"`), schéma poussé, données de production copiées depuis Turso (12 suivis, 18 devis, 6 factures, 2 comptes, 10 réglages).
- Service systemd `lbg-express` (port 4200) + nginx en reverse proxy, `http://187.7.18.167` répond 200 sur /, /suivi, /admin, /blog, /devis.
- Sauvegarde quotidienne 03h30 (`lbg-backup.timer` → `/var/backups/lbg-express/`, rotation 14 jours).
- `BETTER_AUTH_SECRET` régénéré côté VPS, `WEBSITE_URL="http://187.7.18.167"` en attendant la bascule DNS.
- Déploiement en une commande : `bash /home/user/lbg-deploy/deploy.sh`.

## V9 — Conformité myPOS (01/09/2026, déployé et vérifié en prod)

- [x] `lib/legal-content.ts` créé : COMPANY (identité légale réelle) + MENTIONS, LIVRAISON, ANNULATION, CONFIDENTIALITE, CGV
- [x] `pages/legal.tsx` réécrit : routeur 5 vues + encart identité + liens croisés
- [x] Routes ajoutées dans `app.tsx` : /livraison-delais, /annulation-remboursement, /confidentialite
- [x] Footer : nom + opérateur + adresse + SIRET + TVA + devise, colonne "Informations légales" (5 liens)
- [x] Tarifs : prix HT **et** TTC, devise EUR, note "le devis affiche le total tous frais compris"
- [x] Corrections de fond : paiement = carte myPOS + virement uniquement (espèces/PayPal/30j retirés)
- [x] Sitemap 35 → 38 URLs
- [x] lint + build OK, deploy.sh OK, 5 URLs vérifiées 200 en `curl --noproxy`
- [x] Message de retour myPOS rédigé (FR + EN) : `/home/user/reponse-mypos.report/content.md`

### Retard des tours précédents (toujours ouvert)
- [ ] Positionnement "solution" (volet 3 de la demande) — page d'accueil + pages services
- [ ] Il doit changer le mot de passe admin (LbgAdmin2026, temporaire, connu de l'agent)
- [ ] 5 demandes d'indexation Search Console (/devis /suivi /tarifs /demenagement /commande-internationale)
- [ ] UptimeRobot (surveillance externe), sauvegardes hors serveur, snapshot hPanel
- [ ] Dossier technique myPOS E_IPC_ERROR — 5e relance, sinon chiffrer la bascule Stripe
- [ ] Répercuter l'adresse 1 rue de Stockholm dans fiche-google-business.report/content.md

## Autonomie vis-a-vis de la plateforme (fait)
- Chat IA : OpenAI direct (OPENAI_API_KEY, modele via AI_MODEL, defaut gpt-5.4-mini). Plus de passerelle managee.
- Analytics : Google Analytics 4 (VITE_GA4_MEASUREMENT_ID) via packages/web/vite/plugins/ga4-plugin.ts, Consent Mode v2 branche sur le bandeau cookies existant.
- Bundle de production : @runablehq/website-runtime alias vers un stub vide (packages/web/vite/stubs/website-runtime.tsx). 0 occurrence de "runable" dans le JS publie.
- mobile/desktop : CONSERVES dans l'atelier (le lint runkit exige leur presence) mais exclus du deploiement (ops/deploy.sh) et effaces du serveur.
- .env de production nettoye des variables de la plateforme ; sauvegarde /root/env-avant-autonomie.bak.
- Sauvegardes : /usr/local/bin/lbg-backup.sh etendu (base + uploads livreurs + config), timer 03h30, retention 14 j, log /var/log/lbg-backup.log.
- Docs : GUIDE-EXPLOITATION.md + .env.example. Scripts versionnes dans ops/.
- Git : .env.bak retire du suivi ET de tout l'historique (filter-branch), force-push sur origin.
- A FAIRE PAR LE CLIENT : faire tourner les cles qui ont ete exposees dans l'ancien historique GitHub (Resend, myPOS, Google Maps, BETTER_AUTH_SECRET, CRON_SECRET, PRO_ACCESS_CODE).
