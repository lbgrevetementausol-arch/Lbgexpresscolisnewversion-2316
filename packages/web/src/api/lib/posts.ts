import { POSTS_B2B } from "./posts-b2b";
import { POSTS_COLIS } from "./posts-colis";
import { POSTS_DEMENAGEMENT } from "./posts-demenagement";

/**
 * Contenu éditorial du blog — versionné avec le code (pas de CMS en v1).
 * Chaque article est bilingue FR/EN. Les images vivent dans packages/web/public/images/blog/.
 */

export interface Post {
  slug: string;
  title: { fr: string; en: string };
  excerpt: { fr: string; en: string };
  body: { fr: string; en: string };
  image: string;
  publishedAt: string;
  tag: string;
  /** Mots-clés SEO ciblés par l'article */
  keywords?: string[];
  /** Questions/réponses balisées en JSON-LD FAQPage */
  faq?: { q: { fr: string; en: string }; a: { fr: string; en: string } }[];
}

const POSTS_LEGACY: Post[] = [
  {
    slug: "bien-emballer-son-colis",
    tag: "Conseils colis",
    image: "/images/blog/emballage.jpg",
    publishedAt: "2026-08-12",
    title: {
      fr: "Bien emballer son colis : la méthode des pros en 7 étapes",
      en: "Packing a parcel properly: the pro method in 7 steps",
    },
    excerpt: {
      fr: "90 % des avaries de transport viennent d'un emballage inadapté, pas du transporteur. Voici comment protéger votre envoi comme un professionnel.",
      en: "90% of transport damage comes from poor packaging, not the carrier. Here is how to protect your shipment like a pro.",
    },
    body: {
      fr: `Un colis voyage rarement seul : il est trié, empilé, chargé, déchargé et parfois transbordé plusieurs fois. Chaque manipulation est une occasion de choc. L'emballage n'est donc pas un détail de finition, c'est la première assurance de votre envoi.

## 1. Choisir le bon carton
Prenez un carton double cannelure dès que le contenu dépasse 5 kg ou coûte plus de 150 €. Un carton déjà utilisé perd jusqu'à 50 % de sa résistance : ne réutilisez jamais un carton mou, humide ou déformé.

## 2. Respecter la règle des 5 cm
Laissez au moins 5 cm de calage entre l'objet et chaque paroi. C'est cet espace qui absorbe les chocs. Un objet collé contre le carton reçoit l'intégralité de l'impact.

## 3. Caler, pas remplir
Papier kraft froissé, mousse, coussins d'air : le calage doit empêcher tout mouvement. Secouez le colis fermé — si vous entendez quelque chose bouger, ce n'est pas fini.

## 4. Emballer chaque pièce séparément
Deux objets fragiles qui se touchent finiront par se casser mutuellement. Papier bulle individuel, puis séparateurs en carton.

## 5. Fermer en H
Trois bandes d'adhésif : la jointure centrale et les deux bords, sur le dessus comme sur le dessous. L'adhésif d'emballage large (48 mm minimum) uniquement — jamais de scotch de bureau ni de ficelle.

## 6. Une seule étiquette lisible
Retirez toutes les anciennes étiquettes et codes-barres. Ajoutez une étiquette de secours à l'intérieur du colis avec les coordonnées de l'expéditeur et du destinataire : c'est ce qui sauve un colis dont l'étiquette extérieure a été arrachée.

## 7. Déclarer la valeur réelle
L'indemnisation au forfait couvre rarement la valeur d'un objet de valeur. Déclarez et assurez : sur un envoi à 800 €, l'assurance ad valorem coûte quelques euros et change tout en cas de litige.

**Envois fragiles ou hors format ?** Nous proposons un emballage professionnel réalisé par nos équipes au moment de l'enlèvement. Ajoutez simplement l'option « Emballage » à votre devis.`,
      en: `A parcel rarely travels alone: it gets sorted, stacked, loaded, unloaded and sometimes transferred several times. Every handling step is a chance for impact. Packaging is not a finishing detail — it is your shipment's first insurance policy.

## 1. Pick the right box
Use double-wall cardboard as soon as the content exceeds 5 kg or is worth more than €150. A previously used box loses up to 50% of its strength: never reuse a soft, damp or deformed box.

## 2. Follow the 5 cm rule
Leave at least 5 cm of cushioning between the item and each wall. That space absorbs shocks. An item touching the box takes the full impact.

## 3. Cushion, don't just fill
Crumpled kraft paper, foam, air pillows: cushioning must prevent any movement. Shake the closed parcel — if you hear something move, you are not done.

## 4. Wrap each item separately
Two fragile items touching each other will eventually break each other. Individual bubble wrap, then cardboard dividers.

## 5. Tape in an H pattern
Three strips of tape: the central seam and both edges, top and bottom. Use wide packing tape (48 mm minimum) only — never office tape or string.

## 6. One single readable label
Remove every old label and barcode. Add a backup label inside the parcel with sender and recipient details: that is what saves a parcel whose outer label has been torn off.

## 7. Declare the real value
Flat-rate compensation rarely covers the value of a valuable item. Declare and insure it: on an €800 shipment, ad valorem insurance costs a few euros and changes everything in a dispute.

**Fragile or oversized shipments?** We offer professional packing by our teams at pickup. Just add the "Packing" option to your quote.`,
    },
  },
  {
    slug: "envoyer-un-colis-en-afrique",
    tag: "International",
    image: "/images/blog/afrique.jpg",
    publishedAt: "2026-07-28",
    title: {
      fr: "Envoyer un colis en Afrique depuis la France : le guide complet 2026",
      en: "Sending a parcel to Africa from France: the complete 2026 guide",
    },
    excerpt: {
      fr: "Documents, délais, douane, produits interdits, coûts réels : tout ce qu'il faut savoir avant d'expédier vers le Bénin, le Togo ou le Mali.",
      en: "Documents, lead times, customs, prohibited goods, real costs: everything to know before shipping to Benin, Togo or Mali.",
    },
    body: {
      fr: `L'envoi vers l'Afrique n'a rien de compliqué — à condition de préparer les documents avant l'enlèvement. Un colis bloqué en douane l'est presque toujours pour un papier manquant, jamais pour le transport lui-même.

## Les documents indispensables
- **Facture commerciale ou proforma** en trois exemplaires, avec la description précise et la valeur de chaque article. « Cadeaux » ou « effets personnels » sans détail = contrôle systématique.
- **Liste de colisage** si vous expédiez plusieurs cartons : contenu et poids par carton.
- **Pièce d'identité** de l'expéditeur et du destinataire (numéro de téléphone local obligatoire).
- **Certificat d'origine** pour les envois commerciaux vers certains pays de la CEDEAO.

## Délais réalistes
Nous desservons trois destinations, celles que nous maîtrisons : **Cotonou (Bénin), Lomé (Togo) et Bamako (Mali)**. Comptez 5 à 10 jours en aérien et 30 à 45 jours en groupage maritime. Ce sont des délais cibles, pas des garanties. Le maritime devient rentable au-delà de 1 m³ ou 150 kg.

## Ce qui est systématiquement interdit
Batteries lithium seules, aérosols, parfums en aérien, liquides inflammables, médicaments sans ordonnance traduite, denrées périssables non conditionnées, contrefaçons. Un seul article interdit peut faire saisir l'ensemble du carton.

## Aérien ou maritime ?
L'aérien se facture au poids taxable (le plus élevé entre le poids réel et le poids volumétrique, avec 1 m³ = 200 kg). Le maritime se facture au volume. Concrètement : des cartons légers mais volumineux (textile, literie, vêtements) partent en maritime ; l'électronique et l'urgent partent en aérien.

## Droits et taxes à destination
Ils sont dus par le destinataire, calculés sur la valeur déclarée. Sous-déclarer pour payer moins est un faux calcul : en cas de contrôle, le colis est réévalué d'office, avec pénalité et immobilisation.

**Notre accompagnement :** nous préparons la liasse documentaire avec vous, nous vous donnons le régime douanier applicable, et vous suivez le colis de bout en bout avec un numéro unique.`,
      en: `Shipping to Africa is not complicated — as long as the paperwork is ready before pickup. A parcel stuck in customs is almost always missing a document, never a transport issue.

## Mandatory documents
- **Commercial or proforma invoice** in triplicate, with a precise description and value for each item. "Gifts" or "personal effects" without detail means a systematic inspection.
- **Packing list** if you ship several boxes: content and weight per box.
- **ID documents** for sender and recipient (a local phone number is mandatory).
- **Certificate of origin** for commercial shipments to certain ECOWAS countries.

## Realistic lead times
We serve three destinations, the ones we know inside out: **Cotonou (Benin), Lomé (Togo) and Bamako (Mali)**. Allow 5 to 10 days by air and 30 to 45 days by sea groupage. These are target lead times, not guarantees. Sea freight becomes worthwhile beyond 1 m³ or 150 kg.

## Always prohibited
Standalone lithium batteries, aerosols, perfumes by air, flammable liquids, medication without a translated prescription, unpackaged perishables, counterfeit goods. A single prohibited item can get the whole box seized.

## Air or sea?
Air freight is billed on chargeable weight (the higher of actual and volumetric weight, with 1 m³ = 200 kg). Sea freight is billed on volume. In practice: light but bulky boxes (textiles, bedding, clothes) go by sea; electronics and urgent goods go by air.

## Duties and taxes at destination
They are payable by the recipient, based on the declared value. Under-declaring to pay less is a false economy: on inspection the parcel is revalued anyway, with penalties and delays.

**How we help:** we prepare the document set with you, tell you the applicable customs regime, and you track the parcel end to end with a single number.`,
    },
  },
  {
    slug: "reussir-son-demenagement",
    tag: "Déménagement",
    image: "/images/blog/demenagement.jpg",
    publishedAt: "2026-07-09",
    title: {
      fr: "Déménagement : le rétroplanning de 8 semaines qui évite le chaos",
      en: "Moving house: the 8-week countdown that avoids chaos",
    },
    excerpt: {
      fr: "Un déménagement raté se joue trois semaines avant le camion. Voici le calendrier que nos équipes appliquent avec leurs clients.",
      en: "A failed move is decided three weeks before the truck arrives. Here is the timeline our teams use with clients.",
    },
    body: {
      fr: `## S-8 : estimer le volume
Le volume, pas le nombre de cartons, détermine le prix et le véhicule. Comptez environ 0,5 m³ par mètre carré habitable meublé normalement : un T3 de 65 m² représente 30 à 35 m³. Notre calculateur en ligne convertit directement ce volume en tarif.

## S-6 : trier sans pitié
Chaque m³ transporté coûte de l'argent. Vendre, donner ou jeter 10 % du volume est le levier d'économie le plus rentable d'un déménagement.

## S-4 : les démarches
Résiliations et transferts (énergie, internet, assurance habitation), réexpédition du courrier, école des enfants, changement d'adresse auprès des administrations. C'est aussi le moment de demander l'autorisation de stationnement en mairie pour le camion — obligatoire dans la plupart des centres-villes.

## S-3 : réserver le monte-meubles
Au-delà du 3ᵉ étage sans ascenseur, ou pour un canapé et une armoire qui ne passent pas dans la cage d'escalier, le monte-meubles n'est pas un luxe : c'est ce qui évite la casse et les heures de main-d'œuvre supplémentaires.

## S-2 : emballer par pièce
Un carton = une pièce, jamais deux. Étiquetez sur le dessus **et** sur un côté (une fois empilés, le dessus n'est plus lisible). Livres dans des petits cartons, linge dans les grands.

## S-1 : le carton de survie
Chargeur, papiers, médicaments, produits d'hygiène, une tenue, café, outils de base, rideaux de douche. Il voyage avec vous, pas dans le camion.

## Jour J
État des lieux avant chargement, photos des meubles de valeur, inventaire signé, relevé des compteurs. À l'arrivée : vérification avant le départ de l'équipe, réserves écrites immédiatement si nécessaire.

**Formule clé en main :** emballage, démontage, portage, transport, remontage et évacuation des cartons vides. Devis gratuit sous 24 h après visite ou visio.`,
      en: `## W-8: estimate the volume
Volume, not the number of boxes, determines price and vehicle. Count roughly 0.5 m³ per normally furnished square metre: a 65 m² three-room flat is 30 to 35 m³. Our online calculator turns that volume straight into a price.

## W-6: sort ruthlessly
Every cubic metre moved costs money. Selling, giving away or discarding 10% of the volume is the most profitable saving in any move.

## W-4: administrative tasks
Cancellations and transfers (energy, internet, home insurance), mail forwarding, children's school, address changes with authorities. This is also the moment to request a parking permit from the town hall for the truck — mandatory in most city centres.

## W-3: book the furniture lift
Above the 3rd floor without an elevator, or for a sofa and wardrobe that will not fit the stairwell, a furniture lift is not a luxury: it prevents damage and extra labour hours.

## W-2: pack room by room
One box = one room, never two. Label the top **and** one side (once stacked, the top is unreadable). Books in small boxes, linen in large ones.

## W-1: the survival box
Charger, documents, medication, toiletries, one outfit, coffee, basic tools, shower curtain. It travels with you, not in the truck.

## Moving day
Condition report before loading, photos of valuable furniture, signed inventory, meter readings. On arrival: check everything before the crew leaves, and file written reservations immediately if needed.

**Turnkey package:** packing, dismantling, carrying, transport, reassembly and removal of empty boxes. Free quote within 24 h after a site or video visit.`,
    },
  },
  {
    slug: "delais-transport-france",
    tag: "Livraison",
    image: "/images/blog/delais.jpg",
    publishedAt: "2026-06-24",
    title: {
      fr: "Économique, standard, express : quel service choisir vraiment ?",
      en: "Economy, standard, express: which service should you actually pick?",
    },
    excerpt: {
      fr: "Payer l'express pour un colis qui n'est pas urgent est la première source de surcoût. Comparatif honnête des quatre niveaux de service.",
      en: "Paying for express on a non-urgent parcel is the number one source of overspending. An honest comparison of the four service levels.",
    },
    body: {
      fr: `## Économique
Groupage, départs regroupés, délai allongé de 50 à 60 %. Pertinent pour tout ce qui n'a pas de date : stock, mobilier, cartons de déménagement, réassort non urgent. C'est le meilleur rapport prix/kg de la grille.

## Standard
Le compromis par défaut : 1 à 3 jours ouvrés en France métropolitaine, suivi complet, enlèvement possible à domicile. Couvre 80 % des besoins réels.

## Express 24-48 h
Départ prioritaire, délai réduit d'environ 40 %. Justifié pour les pièces de rechange, les documents contractuels, l'événementiel et le e-commerce premium. Coût : environ +45 % sur le standard.

## Premium sur-mesure
Véhicule dédié, créneau horaire, deux personnes au chargement, livraison en étage, appel avant présentation. Pour l'œuvre d'art, l'équipement médical, le matériel professionnel sensible et le hors-format.

## Comment décider en 15 secondes
1. Une date ferme est-elle imposée par le destinataire ? Sinon → économique ou standard.
2. Le retard coûte-t-il plus cher que le surcoût express ? Si oui → express.
3. Le colis nécessite-t-il une manipulation particulière (poids, valeur, fragilité, étage) ? Si oui → premium.

## Ce qui allonge réellement les délais
Adresse incomplète (première cause), destinataire absent sans instruction, colis mal emballé refusé au chargement, documents douaniers incomplets à l'international. Aucun niveau de service ne rattrape ces quatre points : ils se règlent avant l'enlèvement.

**À savoir :** notre calculateur affiche le délai estimé de chaque service avant que vous validiez. Comparez les quatre lignes, la différence de prix est souvent plus faible que prévu.`,
      en: `## Economy
Groupage, consolidated departures, lead time extended by 50 to 60%. Ideal for anything without a deadline: stock, furniture, moving boxes, non-urgent restocking. Best price per kg in the grid.

## Standard
The default compromise: 1 to 3 business days in mainland France, full tracking, optional home pickup. Covers 80% of real needs.

## Express 24-48h
Priority departure, lead time cut by around 40%. Justified for spare parts, contractual documents, events and premium e-commerce. Cost: roughly +45% over standard.

## Bespoke premium
Dedicated vehicle, time slot, two-person loading, delivery to the floor, call before arrival. For artwork, medical equipment, sensitive professional gear and oversized items.

## How to decide in 15 seconds
1. Has the recipient imposed a firm date? If not → economy or standard.
2. Does a delay cost more than the express premium? If yes → express.
3. Does the shipment need special handling (weight, value, fragility, floor)? If yes → premium.

## What actually causes delays
Incomplete address (the number one cause), recipient absent with no instructions, badly packed parcel refused at loading, incomplete customs documents internationally. No service level fixes those four things: they are settled before pickup.

**Good to know:** our calculator shows the estimated lead time for each service before you confirm. Compare all four lines — the price gap is often smaller than expected.`,
    },
  },
  {
    slug: "api-suivi-ecommerce",
    tag: "Pro & e-commerce",
    image: "/images/blog/api.jpg",
    publishedAt: "2026-06-05",
    title: {
      fr: "Brancher le suivi LBG sur votre boutique : API, webhooks et bonnes pratiques",
      en: "Connecting LBG tracking to your store: API, webhooks and best practices",
    },
    excerpt: {
      fr: "Créer des expéditions, recevoir les changements de statut en temps réel et afficher le suivi dans votre propre interface. Guide technique.",
      en: "Create shipments, receive status changes in real time and display tracking in your own interface. A technical guide.",
    },
    body: {
      fr: `Le compte Pro donne accès à une API REST simple et à des webhooks signés. L'objectif : que vos clients suivent leur colis **chez vous**, sans jamais quitter votre boutique.

## Authentification
Chaque clé est générée depuis votre tableau de bord Pro et s'envoie en en-tête :

\`\`\`
Authorization: Bearer lbg_live_xxxxxxxxxxxx
\`\`\`

Une clé compromise se révoque en un clic, sans impacter les autres intégrations.

## Créer une expédition
Vous envoyez l'origine, la destination, le service et le poids ; l'API retourne un numéro au format \`TRK-YYYYMMDD-XXXXXX\`. Stockez ce numéro sur la commande : c'est la clé de toutes les requêtes suivantes.

## Lire le suivi
Un appel retourne le statut courant, la timeline complète des événements horodatés et la position GPS la plus récente quand le livreur est en course. Les libellés sont fournis en français et en anglais : affichez celui de la langue de votre client.

## Webhooks : arrêter de faire du polling
Déclarez une URL HTTPS et un secret. À chaque changement de statut, nous envoyons un POST JSON avec l'en-tête \`x-lbg-signature\` (HMAC SHA-256 du corps brut). Vérifiez toujours cette signature avant de traiter l'événement.

Trois règles pour une intégration fiable :
1. **Répondez 200 immédiatement**, puis traitez en tâche de fond. Un traitement lent provoque des tentatives en double.
2. **Soyez idempotent** : un même événement peut arriver deux fois.
3. **Journalisez le corps brut** : sans lui, aucun litige n'est vérifiable.

## Ce que ça change côté client
Statut à jour dans l'espace commande, e-mail automatique à chaque étape, moins de tickets « où est mon colis ? ». C'est la question numéro un du support e-commerce, et elle disparaît presque entièrement.

**Pour démarrer :** créez votre clé dans le tableau de bord Pro, testez sur un numéro de suivi de démonstration, puis passez en production. Notre équipe technique vous accompagne sur l'intégration.`,
      en: `A Pro account gives you a simple REST API and signed webhooks. The goal: your customers track their parcel **on your site**, without ever leaving your store.

## Authentication
Each key is generated from your Pro dashboard and sent as a header:

\`\`\`
Authorization: Bearer lbg_live_xxxxxxxxxxxx
\`\`\`

A compromised key is revoked in one click, without affecting other integrations.

## Creating a shipment
You send origin, destination, service and weight; the API returns a number formatted as \`TRK-YYYYMMDD-XXXXXX\`. Store it on the order: it is the key to every later request.

## Reading tracking
One call returns the current status, the full timeline of timestamped events and the latest GPS position while the driver is on the road. Labels come in both French and English: display the one matching your customer's language.

## Webhooks: stop polling
Register an HTTPS URL and a secret. On every status change we send a JSON POST with an \`x-lbg-signature\` header (HMAC SHA-256 of the raw body). Always verify that signature before processing the event.

Three rules for a reliable integration:
1. **Return 200 immediately**, then process in the background. Slow processing triggers duplicate retries.
2. **Be idempotent**: the same event can arrive twice.
3. **Log the raw body**: without it, no dispute can be verified.

## What it changes for your customers
Up-to-date status in the order area, an automatic email at every step, far fewer "where is my parcel?" tickets. That is the number one e-commerce support question, and it almost entirely disappears.

**Getting started:** create your key in the Pro dashboard, test against a demo tracking number, then go live. Our technical team supports you through the integration.`,
    },
  },
  {
    slug: "devenir-transporteur-partenaire",
    tag: "Partenaires",
    image: "/images/blog/transporteur.jpg",
    publishedAt: "2026-05-19",
    title: {
      fr: "Devenir transporteur partenaire : conditions, revenus et démarrage",
      en: "Becoming a partner carrier: requirements, income and getting started",
    },
    excerpt: {
      fr: "Vous avez un véhicule et un statut d'indépendant ? Voici concrètement comment remplir vos tournées avec nos courses.",
      en: "Got a vehicle and a self-employed status? Here is exactly how to fill your routes with our jobs.",
    },
    body: {
      fr: `Nous travaillons avec un réseau de transporteurs indépendants plutôt qu'avec une flotte unique. L'intérêt est mutuel : vous remplissez vos retours à vide, nous couvrons plus de destinations sans immobiliser de capital.

## Conditions d'entrée
- Statut d'entreprise valide (auto-entrepreneur accepté) et numéro SIRET.
- Assurance RC professionnelle **et** marchandises transportées à jour.
- Véhicule utilitaire en bon état, du fourgon 3 m³ au 20 m³.
- Licence de transport intérieur pour les véhicules de plus de 3,5 t.
- Smartphone : le suivi GPS et les preuves de livraison passent par l'espace livreur.

## Comment ça marche
Vous recevez les courses correspondant à votre zone et à votre capacité. Vous acceptez ce qui vous arrange. Vous mettez à jour chaque étape depuis l'espace livreur — enlevé, en transit, en cours de livraison, livré — et le client voit la progression en temps réel.

## Rémunération
Paiement à la course, avec un montant connu **avant** acceptation. Facturation mensuelle, règlement à 30 jours. Les courses longue distance et les créneaux contraints sont mieux rémunérés ; les retours à vide comblés sont le vrai gain de marge pour un indépendant.

## Ce qui fait la différence entre partenaires
Trois choses, dans l'ordre : la ponctualité sur le créneau annoncé, la qualité des preuves de livraison (photo + nom du réceptionnaire), et la mise à jour des statuts en temps réel. Les partenaires les plus fiables reçoivent les courses en priorité.

## Démarrage
Candidature en ligne, vérification des pièces sous 48 h, création de votre accès à l'espace livreur, première course dans la semaine.

**Prêt ?** Remplissez le formulaire « Devenir transporteur » avec votre ville, votre véhicule et votre capacité en m³.`,
      en: `We work with a network of independent carriers rather than a single fleet. The interest is mutual: you fill your empty return trips, we cover more destinations without tying up capital.

## Entry requirements
- Valid business status (sole trader accepted) and company registration number.
- Up-to-date professional liability **and** goods-in-transit insurance.
- Van or truck in good condition, from 3 m³ to 20 m³.
- Domestic transport licence for vehicles above 3.5 t.
- A smartphone: GPS tracking and proof of delivery go through the driver area.

## How it works
You receive jobs matching your area and capacity. You accept what suits you. You update every step from the driver area — picked up, in transit, out for delivery, delivered — and the customer sees progress in real time.

## Pay
Paid per job, with the amount known **before** you accept. Monthly invoicing, 30-day payment. Long-distance jobs and constrained time slots pay more; filled empty returns are the real margin gain for an independent driver.

## What sets partners apart
Three things, in order: punctuality within the announced slot, quality of proof of delivery (photo + recipient name), and real-time status updates. The most reliable partners get first pick of jobs.

## Getting started
Apply online, documents verified within 48 h, driver area access created, first job within the week.

**Ready?** Fill in the "Become a carrier" form with your city, vehicle and capacity in m³.`,
    },
  },
];

/** Tous les articles, du plus récent au plus ancien. */
export const POSTS: Post[] = [
  ...POSTS_LEGACY,
  ...POSTS_DEMENAGEMENT,
  ...POSTS_COLIS,
  ...POSTS_B2B,
].sort((a, b) =>
  a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0,
);
