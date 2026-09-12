
## V10 — Positionnement « solution » (1er septembre 2026)

- Créé `packages/web/src/web/components/site/solution.tsx` : `ProblemSolution` (6 douleurs client → réponse LBG) + `ComparisonTable` (8 critères × 3 catégories d'acteurs, aucun concurrent nommé).
- Inséré sur `/` (après les services + avant les garanties) et sur `/commande-internationale`.
- Alignement du contenu sur la réalité de l'activité :
  - STATS accueil : chiffres invérifiables (12 000 colis, 98,4 %, 40+ pays) remplacés par des faits (8 départements IDF, 24-48 h, 100 000 € Simplis, 1 interlocuteur).
  - Assurance : 50 000 € → Simplis, biens confiés 100 000 €, franchise 200 € (accueil + FAQ courte).
  - Zones accueil : Europe/Maghreb/monde → IDF (8 départements), déménagement IDF, Cotonou / Lomé / Bamako (aérien 5-10 j, maritime 30-45 j).
  - `/commande-internationale` : 15 pays → 3 destinations réelles, suppression du « plus de 40 pays », délais corrigés (aérien 5-10 j, maritime 30-45 j).
  - Témoignages hors territoire (Dakar, Lyon → Bordeaux) recalés sur Cotonou et l'IDF.
- lint 35 fichiers OK, build OK, déployé en production, 200 sur `/`, `/commande-internationale`, `/mentions-legales`.

### Reste dû
- [ ] Mot de passe admin temporaire `LbgAdmin2026` à changer par l'utilisateur
- [ ] Vérifier les chiffres Simplis (100 000 € / franchise 200 €)
- [ ] Message myPOS à envoyer (conformité + relance E_IPC_ERROR)
- [ ] 5 demandes d'indexation Search Console
- [ ] UptimeRobot + sauvegardes hors serveur + snapshot hPanel

## V11 — Cohérence destinations (01/09/2026)
Adresse confirmée par le client : **1 rue de Stockholm, 75008 Paris** (celle du SIRET et du site). Le compte myPOS (Sartrouville) est à corriger côté myPOS.

Suppression des destinations non desservies (Côte d'Ivoire, Sénégal, Cameroun, Maghreb « hebdomadaire ») :
- `web/pages/zones.tsx` : carte Afrique → Cotonou / Lomé / Bamako avec délais 5-10 j aérien, 30-45 j maritime ; titre et lead du hero réécrits (« plus de 40 pays » supprimé) ; cartes Maghreb et Reste du monde passées en « sur devis via nos partenaires ».
- `api/routes/support.ts` : réponse « délais » du chat réécrite sur les délais cibles réels.
- `api/lib/posts.ts` : article Afrique — excerpt + délais FR/EN alignés sur les 3 destinations.
- `api/lib/posts-colis.ts` : article international — titre, mots-clés, grille tarifaire, exemples et délais FR/EN alignés ; article gros colis idem.

Le moteur de prix (`api/lib/pricing.ts`) reste inchangé : les zones larges servent encore aux devis sur demande.

Vérifs : lint 35 fichiers 0 erreur, build OK, déploiement OK, prod 200 sur `/`, `/zones`, `/blog/...`.

## V12 — Assistant IA, popup newsletter, consentement cookies (01/09/2026)
Chatbot LLM en streaming à la place de l'arbre de boutons :
- `api/agent/gateway.ts`, `api/agent/index.ts` (ToolLoopAgent, `anthropic/claude-sonnet-4.6`, stopWhen 6 étapes), `api/agent/tools.ts` (2 outils : `trackParcel` sur la base réelle, `requestHuman` → `chatLeads` + webhook optionnel).
- Route streaming `POST /api/agent/messages` dans `api/index.ts` (pas oRPC).
- `web/components/site/support-chat.tsx` réécrit avec `useChat` + `DefaultChatTransport` ; bandeau d'escalade WhatsApp + e-mail + téléphone dès qu'une part `tool-requestHuman` apparaît.
- Prompt système : aucun prix chiffré (renvoi vers `/devis`), aucun délai garanti, aucun geste commercial, aucune invention d'état de colis.
- Bug corrigé : `trackParcel` renvoyait `row.eta` en objet `Date` → prompt invalide au 2e tour (ZodError). Sérialisé en ISO.
- Nginx : `proxy_buffering off` + `proxy_cache off` + `proxy_read_timeout 300s` pour le SSE.

Popup newsletter + cookies :
- Table `newsletter_subscribers`, `api/routes/newsletter.ts` (`subscribe`, `unsubscribe`, `list` adminOnly), `web/queries/newsletter.ts`.
- `web/components/site/newsletter-popup.tsx` : ouverture à 10 s, une fois par visiteur (réarmée à 60 j si fermée sans inscription).
- `web/lib/consent.ts` + `web/components/site/cookie-banner.tsx` : Accepter / Refuser, mémorisé 6 mois, Consent Mode dans `dataLayer`, purge des cookies non essentiels au refus.
- Les deux composants montés dans `web/components/site/layout.tsx`.
- Section « Cookies et consentement » réécrite dans `web/lib/legal-content.ts` (essentiels vs mesure d'audience, choix révocable, 6 mois).

Vérifs prod (curl --noproxy) : question tarif → renvoi `/devis` sans chiffre ✅ ; `TRK-20260824-DEMO01` → statut réel En transit / Hub Paris ✅ ; demande d'humain → `requestHuman` déclenché + WhatsApp/mail affichés ✅ ; 0 événement `error` dans le flux.

Reste ouvert : onglet Newsletter dans `/admin` (hooks prêts) ; `support.lead` doublonne `requestHuman` (non supprimé).

## V13 — Onglet Newsletter admin + avis Trustpilot réels (01/09/2026)
Back-office :
- `web/components/admin/newsletter-panel.tsx` : 3 cartes de stats (actifs / désinscrits / 30 derniers jours), recherche e-mail ou nom, export CSV, tableau (date, e-mail, nom, source, langue, statut), bouton Désinscrire par ligne.
- `web/pages/admin.tsx` : onglet `newsletter` (icône MailPlus) inséré avant `utilisateurs` → 11 onglets.
- Vérif : `POST /api/rpc/newsletter/list` sans session → 401 « Connexion requise ».

Avis clients :
- Page Trustpilot consultée : https://fr.trustpilot.com/review/lbgexpresscolis.fr → **3 avis, note 4,0/5, tous du 20 novembre 2025**, textes très courts, mention « Aucun historique récent de demande d'avis ».
- Les 3 anciens témoignages inventés (Awa D., Julien M., Fatou & Marc) sont **supprimés** de `web/pages/index.tsx`.
- Nouvelle section « Ce que nos clients écrivent » : bloc note 4,0/5 + « 3 avis sur Trustpilot » cliquable, les 3 avis repris **mot pour mot** avec prénom réel et date réelle, CTA « Laissez votre avis sur Trustpilot ».
- Pas de widget TrustBox pour l'instant : il faut le Business Unit ID du compte Trustpilot Business, et le script tiers devra être conditionné à `getConsent() === "granted"`.
- Pas de balisage `AggregateRating` maison : Google interdit les extraits d'avis auto-déclarés ; le balisage doit venir du widget Trustpilot.

Reste ouvert : volume d'avis trop faible (3) → collecte à lancer (mail post-livraison via Resend) ; `support.lead` doublonne toujours `requestHuman`.

## V14 — Relance d'avis automatique après livraison (01/09/2026)
- Schéma : colonne `trackings.review_requested_at` (null = demande jamais envoyée) — `db:push` fait en local et en prod.
- `api/services/email.ts` : gabarit `mailReviewRequest` (objet « <n° colis> — votre avis sur LBG Express Colis », bouton Trustpilot, `replyTo` vers contact@ pour capter les mécontents avant qu'ils publient).
- `api/services/review-requests.ts` : `runReviewRequests({ dryRun, limit })` — sélectionne les colis au statut `livre`, sans demande déjà envoyée, livrés depuis ≥ `REVIEW_DELAY_DAYS` (2 j, vérifié sur le dernier événement `livre`), récupère l'e-mail client via `quotes.customer_email`, envoie puis écrit `review_requested_at`. Aucun doublon possible.
- Route `POST /api/cron/review-requests` dans `api/index.ts` : protégée par l'en-tête `x-lbg-cron-key` = `CRON_SECRET`, `?dry=1` pour simuler. 401 sans clé (vérifié), 503 si `CRON_SECRET` absent.
- `.env` (local + prod) : `CRON_SECRET`, `REVIEW_URL`, `REVIEW_DELAY_DAYS="2"`.
- VPS : `/usr/local/bin/lbg-reviews.sh` + `lbg-reviews.service` + `lbg-reviews.timer` (tous les jours à 09:00 UTC, `Persistent=true`), journal `/var/log/lbg-reviews.log`.
- Test prod : sans clé → 401 ✅ ; `?dry=1` → 1 colis éligible détecté (TRK-20260812-DEMO03) ✅. Le colis de démo a été marqué comme déjà relancé pour ne pas envoyer d'e-mail à une adresse `example.com`.

## V15 — myPOS : nouveau pack de clés (2 sept. 2026)

- Pack de configuration reçu (store **1465081**, wallet 40077113658, **key index 2**).
  ⚠️ myPOS avait demandé de régénérer depuis le store **1462282** : le pack vient d'un autre store.
- Variables réécrites dans `.env` local **et** `/var/www/lbg-express/.env` :
  `MYPOS_STORE_ID`, `MYPOS_CLIENT_NUMBER`, `MYPOS_KEY_INDEX`,
  `MYPOS_PRIVATE_KEY_B64`, `MYPOS_CERT_B64`, `MYPOS_PACK_B64`.
- Test réel contre `https://mypos.com/vmp/checkout` (script jetable, supprimé) :
  - **Error Code 3 (E_IPC_ERROR) → disparu.** La signature RSA est donc acceptée : le code
    `api/lib/mypos.ts` est correct, rien à corriger côté développement.
  - Nouveau retour : **Error Code 25 = `E_STORE_RESTRICTED`** → configuration du store
    incomplète côté myPOS (URL du site non approuvée, devise EUR absente, ou store en
    attente de vérification).
- `MYPOS_CHECKOUT_ENABLED` remis à **`"false"`** : le site continue de servir le lien de
  paiement manuel tant que le store n'est pas débloqué. À repasser à `"true"` dès que
  l'erreur 25 disparaît.
- Sauvegarde de l'ancien `.env` de prod : `/root/env-backup-<timestamp>.txt` sur le VPS.

### V15 (suite) — pack du store 1462282 testé
- Deuxième pack reçu, cette fois du bon store : **sid 1462282, key index 1**, wallet inchangé.
  Installé dans `.env` local + prod, service redémarré (HTTP 200).
- Test réel contre `https://mypos.com/vmp/checkout` : **Error Code 25 à nouveau**, pas d'Error Code 3.
  → Conclusion ferme : clés valides, signature acceptée, code correct. Le blocage est
  uniquement la configuration du store côté myPOS (devise EUR, URL du site approuvée,
  vérification du store). Réactiver le store ne suffit pas.
- `MYPOS_CHECKOUT_ENABLED` remis à `"false"` en attendant la levée de la restriction.
- Config en place à repasser à `"true"` sans rien d'autre à changer : store 1462282, index 1.

## V16 — Request URLs myPOS sans query string (Error Code 25)

Constat : myPOS refuse d'approuver toute Request URL contenant un `?`
(la première entrée de la liste du store était encadrée en rouge). Nos URLs de
retour portaient `?statut=` et `?facture=` → jamais dans la liste blanche →
`Error Code 25 (E_STORE_RESTRICTED)`.

Corrections :
- `api/routes/invoices.ts` (myposSession) : `ok` → `${base_url}/paiement/retour`,
  `cancel` → `${base_url}/paiement/annule`. Plus aucun paramètre. `notify` inchangé.
  (Bug annexe corrigé au passage : l'ancien `ok` pointait sur `/paiement-retour`,
  qui ne correspondait à aucune route Wouter → page 404 après paiement.)
- `web/lib/mypos.ts` : `MYPOS_INVOICE_KEY`, `rememberMyposInvoice()`,
  `rememberedMyposInvoice()`. `startMyposPayment(session, invoiceNumber?)` mémorise
  la facture en sessionStorage avant de quitter le site.
- `web/components/site/pay-button.tsx` : passe `result.number` à `startMyposPayment`.
- `web/app.tsx` : route `/paiement/annule` → `PaiementRetourPage` (avant `/paiement/:ref`).
  Hors sitemap : page de transaction.
- `web/pages/paiement-retour.tsx` : facture reprise du sessionStorage quand l'URL n'a
  pas de paramètre ; variante « Paiement interrompu » sur `/paiement/annule`
  (titre, chapeau, prochaine étape, CTA « Reprendre le paiement », message WhatsApp).

Le webhook `POST /api/webhooks/mypos` reste la seule source de vérité pour passer
une facture en `payee` — la page de retour n'affiche rien de décisif.

Vérifié : lint OK, build OK, déployé. `https://www.lbgexpresscolis.fr/paiement/retour`
et `/paiement/annule` → 200. `invoices.myposSession` renvoie encore `mode: "link"`
(normal, `MYPOS_CHECKOUT_ENABLED="false"` en attendant la levée du 25).

Request URLs à faire enregistrer côté myPOS (exactement ces trois, sans `?`) :
- https://www.lbgexpresscolis.fr/paiement/retour
- https://www.lbgexpresscolis.fr/paiement/annule
- https://www.lbgexpresscolis.fr/api/webhooks/mypos

## V17 — Indexation : canonical global cassé + duplication www/non-www

Constat Search Console (2 sept. 2026) : 38 URLs envoyées, **2 indexées**, 23 non
indexées sur 4 motifs — Introuvable 404 (14), Explorée non indexée (6),
Erreur de redirection (2), Soft 404 (1).

Causes trouvées et corrigées :
1. **`index.html` portait `<link rel="canonical" href="https://lbgexpresscolis.fr/">`**
   → le HTML brut de *toutes* les URLs déclarait l'accueil non-www comme page
   canonique, en contradiction avec le sitemap (www). Canonical retiré du HTML
   statique : chaque page pose le sien via `useSeo` (`SITE_URL` = www). `og:url`
   par défaut passé en www.
2. **`https://lbgexpresscolis.fr/` répondait 200** au lieu de rediriger.
   nginx : `if ($host != "www.lbgexpresscolis.fr") return 301 https://www…$request_uri;`
3. **`/devis/` (slash final) répondait 200** → doublon. nginx : `rewrite ^/(.+?)/+$ /$1 permanent;`
4. **Chaîne de redirection à deux sauts** (http non-www → https non-www → https www),
   probable origine des 2 « Erreur liée à des redirections ». Bloc port 80 corrigé :
   un seul saut vers `https://www…`.
5. **Soft 404** : le serveur SPA renvoie 200 pour toute URL inconnue
   (`/wp-login.php` → 200). `web/lib/seo.ts` accepte désormais `noindex`, et
   `pages/not-found.tsx` pose `noindex, follow`.

Vérifié en prod : `https://lbgexpresscolis.fr/devis` → 301 www ; `/devis/` → 301 `/devis` ;
`http://lbgexpresscolis.fr/tarifs` → 301 direct vers `https://www…/tarifs` (un seul saut) ;
plus aucun canonical figé dans le HTML brut. Lint OK, build OK, nginx -t OK.

Reste à traiter : le site est rendu côté client, le HTML brut est identique pour
toutes les routes (title/description génériques). C'est la cause structurelle du
motif « Explorée, actuellement non indexée ». Prochaine étape possible : prérendu
du `<head>` par route au build + `try_files` nginx.

À obtenir de l'utilisateur : export des 14 URLs « Introuvable (404) » — le serveur
actuel ne renvoie jamais 404, donc ces URLs viennent d'avant la migration.

## V17 (suite) — anciennes URLs redirigées en 301

Les 6 URLs « Explorée, actuellement non indexée » (export GSC) :
- https://www.lbgexpresscolis.fr/            29 août 2026
- https://lbgexpresscolis.fr/devis-complet   11 juil. 2026  ← n'existe plus
- https://www.lbgexpresscolis.fr/aide        21 mai 2026
- https://www.lbgexpresscolis.fr/suivi-livraison   3 avr. 2026  ← n'existe plus
- https://www.lbgexpresscolis.fr/devis-demenagement 3 avr. 2026 ← n'existe plus
- https://www.lbgexpresscolis.fr/services    6 janv. 2026

Trois sont des URLs du site d'avant refonte : le serveur SPA leur répondait 200
avec la page 404, donc Google les gardait en « explorée non indexée ». nginx :
`location =` + `return 301` vers la page équivalente. Vérifié en prod :
/devis-complet → /devis, /devis-demenagement → /demenagement, /suivi-livraison → /suivi.

Noter les dates de dernière exploration (janvier à août 2026) : Google ne repasse
quasiment pas sur ce site. C'est un problème de budget d'exploration, pas seulement
de balises — d'où l'intérêt des demandes d'indexation manuelles.

Sitemap relu le 02/09/2026, 38 pages découvertes, traitement réussi.
Validation des correctifs lancée par l'utilisateur le 03/09/2026.

Toujours attendu : export des 14 URLs « Introuvable (404) » pour compléter les 301.

## V18 — vérification du déploiement V17 (03/09/2026)

Tout contrôlé en prod avec `curl --noproxy '*'` :

- Sitemap : 38 entrées, toutes en `<lastmod>2026-09-03</lastmod>`. Aucune URL du
  sitemap ne renvoie de 301 (testées une par une → 200).
- HTML brut de /devis : plus aucun `<link rel="canonical">` figé (remplacé par un
  commentaire), `robots: index, follow` présent. Le canonical est posé par `useSeo`.
- Redirections 301 confirmées (un seul saut) :
  - /international        → /commande-internationale
  - /devis-complet        → /devis
  - /devis-demenagement   → /demenagement
  - /suivi-livraison      → /suivi
  - https://lbgexpresscolis.fr/devis (non-www) → https://www.lbgexpresscolis.fr/devis
  - /devis/ (slash final) → /devis
  - http://lbgexpresscolis.fr/tarifs → https://www.lbgexpresscolis.fr/tarifs (1 saut)

Le sitemap n'avait pas besoin d'être refait sur le fond : il était déjà cohérent
(www, sans slash, toutes en 200). Seul le `lastmod` a été rafraîchi, ce qui se
justifie par la réécriture du `<head>` de toutes les pages. Ne pas gonfler le
`lastmod` à chaque déploiement.

À faire côté utilisateur : renvoyer le sitemap dans GSC pour forcer une relecture,
et fournir l'export des 14 URLs « Introuvable (404) ».

### Soft 404 traité (03/09/2026)

Export GSC de la ligne « Soft 404 » : une seule URL,
`https://www.lbgexpresscolis.fr/maps/embed/upgrade204`, explorée le 09/04/2026.
Elle vient de l'iframe Google Maps (tracking-timeline.tsx, `maps.google.com/...&output=embed`) :
quand l'embed ne peut pas se charger, Maps renvoie un chemin relatif `/maps/embed/upgrade204`
que Googlebot a résolu sur notre domaine. Le serveur SPA lui répondait 200 avec la page 404.

nginx, bloc 443, avant `location /` : retour **410 Gone** sur les chemins qui ne nous
appartiennent pas — `/maps/`, `/wp-admin`, `/wp-content`, `/wp-includes`,
`/wp-login.php`, `/xmlrpc.php`.

Vérifié en prod : /maps/embed/upgrade204 → 410, /wp-login.php → 410, /xmlrpc.php → 410,
et aucune page réelle touchée (/devis, /suivi, /commande-internationale, /aide, /blog → 200,
/international et /devis-complet toujours en 301).

410 plutôt que 404 : c'est un signal définitif, Google retire la page plus vite.

### Export GSC « Introuvable (404) » traité (03/09/2026)

Export reçu : 14 URLs déclarées 404 par Search Console, dernière exploration mars-juin 2026.
Contrôle prod au moment du traitement : 11 URLs répondent déjà 200, 2 répondent 301 depuis les
correctifs V17 (`/devis-complet`, non-www `/faq`). Il restait surtout deux anciennes URLs légales :

- /politique-remboursement     → /annulation-remboursement
- /politique-confidentialite   → /confidentialite

Ajoutées en 301 dans nginx (bloc 443, avant les règles 410 et `location /`).
`nginx -t` OK, reload OK. Vérifié en prod : les deux anciennes URLs → 301, leurs cibles → 200,
et toutes les autres URLs de l'export → 200 ou 301 correct.

Conclusion : le motif GSC « Introuvable (404) » est un reliquat historique. La correction est prête :
l'utilisateur peut cliquer « Valider la correction » sur ce motif.

### Validation GSC lancée sur les 4 motifs (03/09/2026)

Capture utilisateur : les 4 lignes de « Pourquoi des pages ne sont pas indexées » sont
passées en « Commencé » — Introuvable (404) 14, Erreur liée à des redirections 2,
Soft 404 1, Explorée actuellement non indexée 6.

Contrôle des chaînes de redirection (curl -L, comptage des sauts) : tous les points
d'entrée résolvent en **1 seul saut** vers https://www.lbgexpresscolis.fr/... —
http non-www, http www, https non-www, avec ou sans chemin.
Seule exception : http://lbgexpresscolis.fr/devis-complet = 2 sauts
(http non-www -> https www -> /devis). Acceptable : Google tolère jusqu'à ~5 sauts,
et il s'agit d'une ancienne URL morte attaquée en http. Pas de règle nginx en plus.

Le motif « Erreur liée à des redirections » venait de l'ancienne chaîne à 2 sauts
(corrigée en V17 dans le bloc 80). Cause traitée, en attente du verdict de Google.

Prochain jalon : attendre 3 à 10 jours le résultat des validations, puis mesurer.
Ensuite seulement, ouvrir le chantier prérendu du <head> par route + JSON-LD
LocalBusiness / Service.

### Pages légales (V18 suite)

Refonte des pages légales pour réduire l'exposition inutile des données personnelles tout en gardant les mentions obligatoires :
- `legal-content.ts` : page Mentions légales réécrite en 6 blocs, avec introduction juridique narrative, paiement myPOS, médiation/litiges, signalement, puis bloc discret « Éditeur et hébergement » en bas.
- Nom public raccourci en `M. B. Koussala Wola` sur les pages légales et dans le prompt de l'assistant IA ; le nom complet reste uniquement dans la constante interne quand nécessaire aux documents obligatoires/factures.
- Suppression des données non nécessaires de la page Mentions légales : code APE, date d'immatriculation, responsable de publication, horaires service client, assureur, plafonds et franchise.
- `legal.tsx` : suppression du grand bloc d'identité qui exposait les coordonnées en haut des 5 pages légales ; ajout `noindex, follow` sur `/mentions-legales`, `/cgv`, `/livraison-delais`, `/annulation-remboursement`, `/confidentialite`.
- `footer.tsx` : suppression du nom complet et de l'adresse postale affichés sur toutes les pages ; pied de page réduit à LBG EXPRESS + SIRET + TVA.
- `sitemap.xml` : retrait volontaire des 5 pages légales, désormais accessibles mais hors sitemap et hors index Google.
- Cohérence commerciale : `solution.tsx` ne dit plus que l'assureur et les garanties sont publiés sur la page Mentions légales.

Vérifs : lint OK, build OK. Capture `/mentions-legales` OK. Déployé en production. Contrôles prod : sitemap 33 URLs, `/mentions-legales` 200, meta robots `noindex, follow`, nom complet absent du rendu, nom abrégé présent, Simplis absent des Mentions légales.

À rappeler au client : vider les mentions légales ne stoppe pas le démarchage ; le vrai levier est la demande INSEE de statut non-diffusible + Bloctel pour la ligne téléphonique. Renvoyer aussi le sitemap dans GSC car il est passé de 38 à 33 URLs.

### Réseaux sociaux

Ajout des liens Facebook et TikTok fournis par le client, et centralisation d'Instagram (l'URL était en dur dans le pied de page).

- `web/lib/format.ts` : trois clés ajoutées dans `CONTACT` — `facebook`, `tiktok`, `instagram`. URLs recopiées telles que fournies, avec leurs paramètres (`?id=…&locale=fr_FR`, `?_r=1&_t=…`) : le `_t` de TikTok est un jeton de partage, le retirer peut casser le lien.
- `components/site/footer.tsx` : deux composants SVG maison `FacebookIcon` et `TikTokIcon` (lucide-react ne fournit ni l'un ni l'autre dans la version installée ; l'icône `Instagram` de lucide est conservée). Trois liens dans la 4e colonne : `Instagram @lbgexpresscolis`, `Facebook LBG Express Colis`, `TikTok @lbgexpresscolis`. Libellés non traduits : noms propres de plateformes.
- `pages/aide.tsx` : bloc « Nous suivre / Follow us » dans la carte Contact direct, entre l'e-mail et les horaires — trois pastilles Instagram / Facebook / TikTok.

Vérifs : lint OK, build OK, capture `/aide` OK. Déployé. Contrôle prod (`mb js` sur `/aide`) : les 6 liens (3 dans la carte, 3 dans le pied de page) pointent aux bonnes URLs.

Reste à faire : ajouter un tableau `sameAs` (Instagram, Facebook, TikTok, Trustpilot) dans les données structurées — à faire dans la même passe que le bloc `Organization` / `LocalBusiness`, qui n'existe pas encore dans `web/lib/seo.ts`.

### Données structurées (Organization / LocalBusiness / Service + sameAs)

`web/lib/seo.ts` : nouvelle fonction `organizationJsonLd()` qui produit un `@graph` de 5 nœuds — un nœud `["Organization","LocalBusiness","MovingCompany"]` (`@id` `${SITE_URL}/#organization`), un nœud `WebSite`, et trois nœuds `Service` (colis IDF, déménagement IDF, envoi Bénin/Togo/Mali) rattachés au premier par `provider`.

Contenu du nœud principal : nom commercial et raison sociale, logo, adresse postale 75008 Paris, téléphone, e-mail, `vatID`, `taxID` + `identifier` (SIRET et SIREN), `foundingDate` 2022-12-08, `areaServed` (Île-de-France, France, Bénin, Togo, Mali), horaires Lu-Sa 08:00-20:00, `paymentAccepted` carte + virement, `currenciesAccepted` EUR, et surtout **`sameAs`** : Instagram, Facebook, TikTok, Trustpilot.

⚠️ Volontairement **aucun `AggregateRating` ni `Review`** : on ne fabrique pas de note. Aucun prix chiffré ni délai garanti non plus.

Injection : `components/site/layout.tsx` appelle `useJsonLd(organizationJsonLd(), "ld-organization")` — le bloc est donc présent sur **toutes** les pages. `useJsonLd` sérialise la donnée en dépendance, l'objet recréé à chaque rendu ne provoque pas de réinjection.

Vérifs : lint OK, build OK. Contrôle local puis **prod** (`mb js` sur l'accueil) : le script `#ld-organization` est présent, le JSON parse, les 3 types et les 4 URLs `sameAs` sont corrects. Sitemap prod : HTTP 200, `application/xml`, 33 URLs.

### Nettoyage du pied de page (mentions légales retirées)

Demande : supprimer du pied de page le bloc « LBG EXPRESS · SIRET 893 700 336 00025 · TVA FR68893700336 / Prix en euros (EUR), TVA 20 % incluse pour les particuliers. » ainsi que la ligne « Suivi au format TRK-AAAAMMJJ-XXXXXX ».

`components/site/footer.tsx` (168 → ~155 lignes) :
- bloc `<p className="text-xs leading-relaxed text-muted">` (SIRET + TVA + mention des prix) supprimé ;
- `<p>` « Suivi au format TRK-AAAAMMJJ-XXXXXX » supprimé de la barre du bas ;
- `import { COMPANY } from "../../lib/legal-content";` retiré — devenu mort, et le lint rejette les imports inutilisés ;
- barre du bas : `justify-between` → `sm:justify-center`, il ne reste que le copyright.

⚠️ SIRET et TVA restent obligatoires quelque part (art. 19 LCEN) : ils sont toujours affichés sur la page Mentions légales et portés sur les factures (`api/lib/invoicing.ts`, `ISSUER`). Seul l'affichage permanent en pied de page est retiré. **Ne pas vider `legal-content.ts` ni `ISSUER`.**

Vérifs : lint OK, build OK (~1 450 kB, gzip ~368 kB). Déployé. Contrôle prod (`mb js`) : `siret:false, tva:false, prixEuros:false, trk:false`, dernière ligne = « © 2026 LBG Express Colis. Tous droits réservés. »

### Stratégie SEO (rapport, hors code)

Rapport livré dans `/home/user/strategie-seo.report/content.md` (4 graphiques matplotlib). Diagnostic à partir de l'export Search Console (3 mois : 6 clics, 1 170 impressions, CTR 0,5 %, position moyenne 8, 137 requêtes, 21 pays).

Conclusions qui engagent le code à venir :
- 53 % des impressions viennent de « gestion colis entreprise » (431) et « services de livraison » (195) — intentions non convertibles, à abandonner.
- Le Bénin convertit à 21,4 % de CTR contre 0,09 % pour la France → priorité aux **pages diaspora** (Cotonou, Lomé, Bamako), 8-10 pages de destination.
- Puis 15-25 **pages locales × service** réellement différenciées (pas de pages creuses en série).
- Le **blog n'est pas un moteur d'acquisition** en 2026 (AI Overviews : −58 à −61 % de clics sur les requêtes info). Les 21 articles servent le maillage interne et la crédibilité : réécrire leurs titres, ajouter les liens vers les pages commerciales, puis 1-2 articles/mois sur des angles à donnée propre uniquement.
- Chantier technique prioritaire, préalable au reste : **pré-rendu du `<head>` par route** (cf. section indexation) — sans lui chaque nouvelle page rend moitié moins.
- Côté utilisateur, toujours en attente : ouverture de la fiche Google Business Profile, renvoi du sitemap, 5 demandes d'indexation.

### Passe métadonnées SEO par route (fait)

Découverte en cours de route : **6 pages indexables n'avaient aucun appel à `useSeo`** (`/services`, `/zones`, `/faq`, `/aide`, `/devenir-transporteur`, `/livreur`). Elles héritaient du `<title>` et de la description par défaut de `index.html` → doublons de l'accueil pour Google. Plus grave que le défaut de pré-rendu.

- Nouveau fichier **`src/web/lib/seo-routes.ts`** : source unique de vérité. Exporte `RouteSeo` (type redéclaré localement, volontairement **sans dépendance React** pour rester importable par Bun hors Vite), `SEO_ROUTES` (12 routes indexables + 4 en `noindex`) et `PRERENDER_ROUTES`. ⚠️ Les routes `noindex` doivent rester dans la table : le futur pré-rendu doit poser le `<meta robots>` dans le HTML brut.
- 6 pages orphelines : ajout d'un `useSeo(SEO_ROUTES[...])`.
- 6 pages qui avaient un bloc `useSeo({...})` en dur (`index`, `devis`, `suivi`, `demenagement`, `international`, `tarifs`) : bascule sur la table, pour supprimer tout risque de divergence entre le runtime et le pré-rendu.
- Non touchées : `blog.tsx`, `blog-post.tsx`, `legal.tsx`, `not-found.tsx` (titres bilingues via `t()`). ⚠️ `blog.tsx` duplique donc la métadonnée de `/blog` — divergence possible avec `SEO_ROUTES["/blog"]`.
- Restent volontairement sans `useSeo` : pages privées et de transaction, déjà en `Disallow` dans robots.txt.
- Titres réécrits : `/commande-internationale` passe de « Europe, Maghreb, Afrique » à **« Envoi de colis au Bénin, Togo et Mali depuis la France »** ; mention Maghreb retirée de `/tarifs`. (Corrige une partie du point « résidus Maghreb ».)

Lint 0/0, build OK, déployé et vérifié en prod.

### Articles de blog B2B (3 premiers, fait)

Écrits à partir des requêtes réellement affichées dans la Search Console, avec un angle **commercial + CTA devis**, pas informationnel.

- Nouveau fichier **`src/api/lib/posts-b2b.ts`** exportant `POSTS_B2B`, agrégé dans `posts.ts` (`[...POSTS_LEGACY, ...POSTS_DEMENAGEMENT, ...POSTS_COLIS, ...POSTS_B2B]`). `posts.ts` n'est pas regonflé (limite template 2000 l./fichier).
- `gestion-colis-entreprise` — cible « gestion colis entreprise » (431 impr.). Angle : organisation **et** externalisation, pour faire le pont entre l'intention logicielle et le besoin de transporteur.
- `choisir-une-societe-de-livraison` — cible « services de livraison » + « service de livraison » + « société de livraison » (221 impr.).
- `livraison-de-courses-a-paris` — cible « livraison courses paris » + « livraison courses domicile » (45 impr.).
- Total couvert : **697 des 1 170 impressions** du site.
- Chacun : bilingue FR/EN, `keywords` reprenant les requêtes GSC exactes, 3 `faq` (alimentent `articleJsonLd()` → balisage `FAQPage`), maillage interne vers `/devis`, `/tarifs`, `/services`, `/zones` + articles connexes.
- Images réutilisées (`/images/entrepot.jpg`, `/images/van-night.jpg`, `/images/livraison-2.jpg`) — aucune génération d'image.
- Contraintes respectées : aucun délai garanti (délais présentés comme cibles), aucun prix ferme, aucun geste commercial, aucun concurrent nommé.

**Effet de bord nécessaire** : le rendu markdown de `blog-post.tsx` ne gérait pas les liens — `[texte](/chemin)` s'affichait en texte brut. `Inline` a été étendu (regex `LINK_RE`) : chemin interne → `<Link>` Wouter, URL externe → `<a target="_blank" rel="noreferrer">`. Sans ça, le maillage interne, seule fonction SEO réelle du blog, était impossible.

Sitemap : 33 → **36 `<url>`**, `<lastmod>` `2026-09-04` sur les 3 nouvelles seulement (les existants restent figés à `2026-09-03`).

Lint 0/0, build OK, déployé. Vérifié en prod sur `mb` : les 3 articles rendent, les liens internes sont bien des ancres, zéro markdown brut. ⚠️ Le contenu des articles est servi par l'API, pas embarqué dans le bundle client — le grep sur l'asset JS n'est pas un test valable pour eux.

Reste à écrire (3 suivants) : `livraison e-commerce` (23 impr.), `livraison express paris` (8), `société transport alimentaire paris` (8).

### myPOS Checkout — débloqué et activé (fait)

L'`Error Code 25` (`E_STORE_RESTRICTED`) est tombé après que l'utilisateur a corrigé son back-office myPOS : adresse remise au 1 rue de Stockholm 75008 (elle était encore à Sartrouville), délai de traitement 30 jours → 2, devise USD supprimée, Request URLs limitées aux 3 chemins exacts sans query string. Le compte est passé en statut « vérifié ».

C'était donc bien administratif, pas technique : `src/api/lib/mypos.ts` était correct depuis la résolution de l'`Error Code 3` (signature RSA). Aucune clé n'a été régénérée — store `1462282`, key index `1`.

- Test direct sur `https://mypos.com/vmp/checkout` : HTTP 200, redirection vers `/vmp/checkout/pmnt?requestID=...`, **formulaire de carte présent, aucun code d'erreur**.
- `MYPOS_CHECKOUT_ENABLED` passé de `"false"` à `"true"` dans le `.env` local **et** dans `/var/www/lbg-express/.env` (sauvegarde `/root/env-lbg-*.bak`), puis `systemctl restart lbg-express` → `active`.
- Vérifié en prod : `POST /api/rpc/invoices/myposSession` sur `FA-2026-0001` renvoie `mode: "form"` avec les champs signés et les 3 URLs correctes. Le repli `mode: "link"` (lien myPOS manuel) n'est plus servi.

⚠️ **Non vérifié : le webhook de notification.** `POST /api/webhooks/mypos` n'a jamais reçu d'appel réel de myPOS. Il faut un vrai paiement carte de bout en bout, à petit montant, pour confirmer que la facture bascule automatiquement en `payee`. Tant que ce test n'est pas fait, considérer le passage au statut payé comme non prouvé.

Le repli Stripe n'est plus d'actualité.

### Facture PDF brandée + collecte e-mail après paiement (fait)

Demande : après un paiement myPOS, le client reçoit sa facture en PDF brandé par mail, et son adresse entre dans la base emailing.

**PDF en JavaScript pur (`pdf-lib`), pas de headless Chrome** — le VPS n'a pas Chrome et l'y installer pour générer des factures serait lourd et fragile. Rendu identique en local et en prod.

- **`src/api/lib/invoice-pdf.ts` (nouveau)** — `buildInvoicePdf(invoice, items)` → `Uint8Array`. En-tête sombre avec logo (`public/images/logo.png`, repli texte si absent), bandeau **PAYÉE** cyan (date, moyen, référence), blocs Émetteur / Facturé à, objet, tableau des prestations (repli sur une ligne unique si `invoiceItems` est vide), totaux HT / TVA / TTC, pied de page légal avec la mention art. L441-10 du code de commerce.
  - ⚠️ **`safe()` est indispensable** : les polices standard PDF sont en WinAnsi. La fonction normalise apostrophes typographiques, guillemets courbes, tirets cadratins, `…`, espace insécable, puis filtre `[^\x20-\xFF€]`. Les accents latins passent, le reste ferait échouer le rendu.
  - `fit(text, font, size, maxWidth)` tronque le libellé de prestation en mesurant la largeur réelle, sinon il débordait sur la colonne QTÉ.
- **`src/api/lib/invoicing.ts`** — `ISSUER` complété : `address`, `postalCity`, `siret`, `vat`, `ape` (mentions obligatoires sur une facture).
- **`src/api/services/email.ts`** — `SendEmailOptions` accepte désormais `attachments: { filename, content }[]` (contenu base64, passé tel quel à Resend). Nouveau **`mailInvoicePaid()`** : confirme le paiement, **pas de CTA de paiement** (contrairement à `mailInvoice`, qui reste le mail de facture impayée), pièce jointe `Facture-<number>.pdf`, et mention de l'inscription aux actualités + lien de désinscription.
- **`src/api/lib/unsubscribe-token.ts` (nouveau)** — `signUnsubscribe` / `verifyUnsubscribe` / `unsubscribeUrl`, HMAC-SHA256 sur `BETTER_AUTH_SECRET`, modèle repris de `driver-token.ts`. **Sans expiration volontairement** : un lien reçu par mail doit rester valable. Sans jeton, n'importe qui pourrait désinscrire l'adresse d'un tiers.
- **`src/api/index.ts`** — `GET /api/newsletter/unsubscribe` : route HTTP simple (les mutations oRPC ne sont pas cliquables depuis une boîte mail), vérifie le HMAC, met `active: false`, renvoie une page HTML brandée en `noindex`. Vérifié : jeton valide → 200 « Désinscription confirmée », jeton bidon → 400 « Lien invalide », en local **et** en prod.
- **`src/api/services/mypos-settlement.ts`** — après l'`auditLog`, remplace l'appel à `mailInvoice` : lecture des `invoiceItems` triés par `position` → `buildInvoicePdf` → `mailInvoicePaid` avec le PDF en base64 → `addToNewsletter(invoice)`.
  - ⚠️ **PDF/mail et insertion newsletter sont chacun dans leur try/catch** : un échec ne doit jamais empêcher la facture de passer en `payee`. Le paiement prime, l'erreur part en `console.error` (visible dans `journalctl -u lbg-express`).
  - L'idempotence est déjà garantie en amont (`if (invoice.status === "payee") return`) : une notification myPOS rejouée ne renvoie pas le mail et ne réinsère pas l'abonné.

**Base emailing — soft opt-in client.** Insertion avec **`source: "achat"`**, jamais `"popup"`, pour rester séparable du consentement explicite. Licite au titre de l'**art. L34-5 CPCE** (prospection vers un client existant sur des services analogues) à deux conditions, toutes deux remplies : information au moment de la collecte et lien de désinscription dans chaque message. Un e-mail déjà présent en base n'est **pas réactivé** — un désabonné le reste, même s'il repasse commande.

Test de rendu : PDF généré depuis `FA-2026-0001` en local, converti en PNG et contrôlé visuellement (logo, accents, alignement des colonnes, totaux 97,50 / 19,50 / 117,00). Lint 0/0, build OK, déployé.

⚠️ **Toujours non prouvé de bout en bout** : il faut un vrai paiement carte à petit montant pour confirmer d'un coup que myPOS appelle bien le webhook, que la facture bascule en `payee`, que le PDF arrive par mail et que l'adresse entre en base.

### Tracking publicitaire : GTM remplace + conversion Purchase (fait, 5 sept. 2026)
- `index.html` : conteneur GTM `GTM-T4SBXXMF` -> **`GTM-PXWLPNZF`** (les 2 emplacements : script `<head>` + `<noscript>` `<body>`). Pixel Meta `1186689563634885` inchange.
- `src/web/lib/pixels.ts` : ajout de `trackPurchase()` (event `Purchase`, devise EUR).
- `src/web/pages/paiement-retour.tsx` : charge la facture via `useInvoice()` et envoie `Purchase` avec `value` (totalCents/100) + `transaction_id` (numero de facture). Dedoublonnage par cle localStorage `lbg-purchase-<ref>` : un rechargement de la page ne recompte pas la vente.
- Evenements desormais couverts : `Lead` (devis), `InitiateCheckout` (clic paiement), `Purchase` (retour myPOS), `CompleteRegistration` (inscription), `Contact` (aide + transporteur).
- Zones tarifaires `europe`/`maghreb`/`monde` : **conservees** sur decision de l'utilisateur (il livre ailleurs sur devis). Consequence pub : cibler geographiquement les campagnes.
- Lint 0/0, build OK, deploye en prod. Verifie : `curl https://www.lbgexpresscolis.fr/` renvoie bien `GTM-PXWLPNZF`.
- Reste a faire cote interfaces (pas de code) : tag GA4 dans GTM, verification du domaine dans Meta Business Manager, compte Google Ads + import de la conversion.

## 2026-09-12 — Espace livreur : vérification complète
- Lint 0 erreur, tsc OK, build OK.
- Bug corrigé : route GET /api/driver/document utilisait `Bun.file` (crash 500 en dev Vite/node) → remplacé par `node:fs/promises.readFile`.
- Bug corrigé : driverAdmin.setActive passait `available: undefined` → `.set()` conditionnel.
- Testé en navigateur sur /admin (onglet Livreurs) : Dossiers livreurs + Courses proposées s'affichent ;
  boutons Valider / Refuser / Désactiver / Réactiver / Renvoyer / Annuler testés en conditions réelles → OK.
- Lecture d'un document : 200 + image/png avec Bearer admin, 403 sans auth.
- Données de test supprimées de local.db (driver 3, offre 1, job 4).
- BLOQUANT externe : Resend refuse tous les envois — "lbgexpresscolis.fr domain is not verified" (403),
  présent aussi en prod (/var/log/lbg-express.log). La clé API est "restricted to only send emails"
  donc impossible de diagnostiquer le domaine depuis le sandbox. Affecte TOUS les emails du site.
- Reste : déploiement prod (schéma DB + UPLOADS_DIR + code), commit git.

## 2026-09-12 (suite) — Resend vérifié + déploiement prod
- DNS Hostinger corrigés : TXT resend._domainkey (DKIM), CNAME send -> send.forge.rmta.net,
  CNAME rsend -> rsend-euw1.forge.rmta.net. Anciens enregistrements Amazon SES sur "send"
  (TXT spf + MX feedback-smtp) supprimés car ils bloquaient le CNAME.
- Domaine lbgexpresscolis.fr : status "verified" chez Resend. Envoi réel testé OK (id retourné).
- Part livreur désormais réglable au back-office : clé site_settings "driver_share_percent" (défaut 70).
- /devenir-transporteur redirige vers /livreur (Redirect wouter + sitemap mis à jour).
- Déployé en prod : schéma DB appliqué, UPLOADS_DIR=/var/lib/lbg-express/uploads (700).
- Parcours testé EN PRODUCTION : upload 2 docs, inscription, renvoi de code, vérification e-mail,
  mot de passe oublié -> tous OK, aucune erreur e-mail dans /var/log/lbg-express.log.
- Données de test supprimées de la base prod (0 driver, 0 upload).
- Clé API Resend full access révoquée après diagnostic ; .env.resend supprimé.
- Reste : commit git.
