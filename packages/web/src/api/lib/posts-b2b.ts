/**
 * Articles SEO — intention B2B et services de livraison (gestion des colis en entreprise,
 * choix d'un prestataire, livraison de courses). Chaque article cible des requêtes
 * réellement affichées pour lbgexpresscolis.fr dans la Search Console.
 */

import type { Post } from "./posts";

export const POSTS_B2B: Post[] = [
  {
    slug: "gestion-colis-entreprise",
    tag: "Colis entreprise",
    image: "/images/entrepot.jpg",
    publishedAt: "2026-09-04",
    keywords: [
      "gestion colis entreprise",
      "gestion des colis en entreprise",
      "expédition colis entreprise",
      "externaliser ses expéditions",
      "transporteur entreprise Île-de-France",
    ],
    title: {
      fr: "Gestion des colis en entreprise : organiser la réception et l'expédition sans y passer ses journées",
      en: "Parcel management for businesses: organising receiving and shipping without losing your days",
    },
    excerpt: {
      fr: "Registre, zone de réception, préparation, choix du transporteur : la méthode pour reprendre le contrôle de vos flux de colis, et le moment où l'externalisation devient plus rentable qu'un logiciel.",
      en: "Log, receiving area, packing, carrier choice: a method to regain control of your parcel flows, and the point where outsourcing beats buying software.",
    },
    body: {
      fr: `Dans la plupart des PME, personne n'est officiellement responsable des colis. L'assistante signe les livraisons, un commercial dépose ses envois en point relais entre deux rendez-vous, l'atelier emballe comme il peut. Tant que le volume reste faible, ça tient. À partir d'une dizaine de mouvements par semaine, le désordre coûte cher : colis introuvables, réexpéditions, clients qui rappellent, heures de bureau consommées par du suivi.

La bonne nouvelle, c'est que la gestion des colis en entreprise se structure en quelques décisions simples. Elle ne demande pas forcément un logiciel dédié.

## Étape 1 : nommer un responsable et un seul point d'entrée

Le premier gain vient de la centralisation. Un colis qui arrive ne doit pas pouvoir être posé à trois endroits différents. Définissez une zone de réception unique, identifiée, avec de la place pour poser un palette ou quelques cartons volumineux sans bloquer un couloir.

Nommez ensuite un référent, même à temps très partiel. Son rôle n'est pas de tout porter mais d'être le point de contact : c'est lui qui sait ce qui est arrivé, ce qui est parti, et ce qui est en litige. Prévoyez un suppléant pour les congés, sinon le système s'effondre à la première absence.

## Étape 2 : tenir un registre, même minimal

Un tableau partagé suffit largement pour démarrer. Cinq colonnes font le travail :

- date et heure du mouvement
- entrant ou sortant
- expéditeur ou destinataire
- numéro de suivi du transporteur
- service ou personne concernée dans l'entreprise

Ce registre règle 90 % des conflits internes. Quand un client affirme n'avoir rien reçu, vous avez une date, un numéro et un nom en trente secondes au lieu d'une demi-journée d'enquête. Il vous donne aussi, au bout de deux mois, la donnée dont vous manquez aujourd'hui : combien de colis vous traitez réellement, vers où, et à quel poids moyen. C'est cette donnée qui permet de négocier.

## Étape 3 : standardiser l'emballage avant de standardiser le transport

Beaucoup d'entreprises négocient un tarif de transport avant d'avoir normalisé leurs cartons. C'est l'inverse qu'il faut faire. Trois formats de cartons couvrent la grande majorité des besoins d'une PME, plus un format hors gabarit pour les pièces longues. En figeant les formats, vous rendez vos poids et vos volumes prévisibles, donc vos coûts calculables.

Attention au poids volumétrique : un colis léger mais encombrant est facturé sur son volume, pas sur la balance. Un carton trop grand pour son contenu se paie deux fois, en carton et en transport. Nous détaillons le calcul dans notre article sur le [poids volumétrique](/blog/poids-volumetrique-colis-explication), et la méthode de calage dans celui sur [comment bien emballer son colis](/blog/bien-emballer-son-colis).

## Étape 4 : choisir entre logiciel et prestataire

Quand la question de l'outil arrive, deux voies s'ouvrent.

Un logiciel de gestion de colis a du sens si votre problème est la **traçabilité interne** : beaucoup de réceptions, de nombreux destinataires dans le bâtiment, des sites multiples, une obligation de preuve de remise. C'est le cas typique d'un siège social, d'un campus ou d'une copropriété d'entreprises.

Un prestataire de transport a du sens si votre problème est l'**exécution** : ce sont vos envois sortants qui coûtent du temps, vos équipes font des allers-retours en point relais, vos livraisons locales sont urgentes et mal servies par les réseaux standards. Là, aucun logiciel ne réglera quoi que ce soit — il faut quelqu'un qui vienne enlever les colis.

La plupart des PME d'Île-de-France que nous accompagnons sont dans le second cas. Elles n'ont pas un problème de données, elles ont un problème de kilomètres.

## Étape 5 : mettre en place l'enlèvement sur site

Le passage à l'enlèvement programmé est le changement qui se remarque le plus vite. Le principe : vous préparez vos colis, un transporteur passe à une plage horaire convenue, repart avec l'ensemble, et vous recevez les numéros de suivi. Personne ne quitte les locaux.

Chez LBG Express Colis, nous travaillons avec des entreprises sur ce mode dans les huit départements d'Île-de-France, avec un délai cible de 24 à 48 heures sur les livraisons régionales. Nous couvrons aussi les envois de cartons vers le Bénin, le Togo et le Mali, ce qui concerne beaucoup de sociétés ayant des relations commerciales ou familiales en Afrique de l'Ouest. Vous pouvez consulter le détail de nos [services de transport](/services) et les [zones desservies](/zones).

## Étape 6 : suivre trois indicateurs, pas quinze

Une fois le flux stabilisé, pilotez-le avec le minimum d'indicateurs utiles :

- le nombre de colis par semaine, entrants et sortants
- le coût moyen par colis, transport et emballage confondus
- le nombre d'incidents (retard, avarie, colis introuvable) sur le mois

Trois chiffres, relevés une fois par mois, suffisent à voir venir les dérives et à savoir si un changement de prestataire vous a réellement fait gagner quelque chose.

## Combien de temps ça prend à mettre en place

Comptez deux semaines : une pour la zone de réception, le référent et le registre, une pour les formats d'emballage et le premier enlèvement test. Le retour sur investissement se mesure en heures de bureau récupérées, pas en pourcentage sur le prix du transport.

**Vous voulez savoir ce que coûterait l'externalisation de vos envois ?** Indiquez vos volumes et vos destinations sur notre [page de devis](/devis), ou regardez d'abord nos [tarifs](/tarifs) pour situer l'ordre de grandeur. Nous revenons vers vous avec une proposition adaptée à votre fréquence réelle.`,
      en: `In most small and mid-sized companies, nobody officially owns parcels. The office manager signs for deliveries, a sales rep drops shipments at a pickup point between meetings, the workshop packs however it can. While volumes stay low, it holds. Past roughly ten movements a week, the mess gets expensive: lost parcels, reshipments, customers chasing you, office hours burned on tracking.

The good news is that parcel management in a business comes down to a few simple decisions. It does not necessarily require dedicated software.

## Step 1: appoint an owner and a single entry point

The first gain comes from centralising. An incoming parcel must not be able to land in three different places. Define one identified receiving area, with enough room to set down a pallet or a few bulky boxes without blocking a corridor.

Then appoint a referent, even part-time. Their job is not to carry everything but to be the contact point: they know what arrived, what left, and what is disputed. Plan a backup for holidays, otherwise the system collapses at the first absence.

## Step 2: keep a log, however minimal

A shared spreadsheet is more than enough to start. Five columns do the job:

- date and time of the movement
- inbound or outbound
- sender or recipient
- carrier tracking number
- department or person concerned

This log settles 90% of internal disputes. When a customer claims nothing arrived, you have a date, a number and a name in thirty seconds instead of half a day of investigation. After two months it also gives you the data you currently lack: how many parcels you really handle, to where, and at what average weight. That data is what lets you negotiate.

## Step 3: standardise packaging before standardising transport

Many companies negotiate a shipping rate before normalising their boxes. It should be the other way round. Three box formats cover the vast majority of an SME's needs, plus one oversized format for long parts. By fixing formats, you make weights and volumes predictable, and therefore your costs calculable.

Watch out for volumetric weight: a light but bulky parcel is billed on its volume, not on the scale. A box too large for its contents is paid for twice, in cardboard and in transport. We break down the calculation in our article on [volumetric weight](/blog/poids-volumetrique-colis-explication), and the padding method in the one on [packing a parcel properly](/blog/bien-emballer-son-colis).

## Step 4: choosing between software and a provider

When the tooling question arrives, two paths open up.

Parcel management software makes sense if your problem is **internal traceability**: many receipts, numerous recipients inside the building, multiple sites, a need for proof of handover. That is the typical case of a head office, a campus or a business park.

A transport provider makes sense if your problem is **execution**: outbound shipments eat your time, your teams shuttle to pickup points, your local deliveries are urgent and poorly served by standard networks. No software will fix any of that — you need someone to come and collect.

Most Île-de-France SMEs we work with are in the second case. They do not have a data problem, they have a mileage problem.

## Step 5: set up on-site collection

Switching to scheduled collection is the change people notice fastest. The principle: you prepare your parcels, a carrier comes within an agreed time window, leaves with the batch, and you receive the tracking numbers. Nobody leaves the premises.

At LBG Express Colis we work this way with companies across the eight Île-de-France departments, with a target time of 24 to 48 hours on regional deliveries. We also handle box shipments to Benin, Togo and Mali, which matters to many businesses with commercial or family ties in West Africa. You can review our [transport services](/services) and the [areas we cover](/zones).

## Step 6: track three indicators, not fifteen

Once the flow is stable, steer it with the minimum of useful indicators:

- parcels per week, inbound and outbound
- average cost per parcel, transport and packaging combined
- number of incidents (delay, damage, missing parcel) in the month

Three figures, read once a month, are enough to spot drift and to know whether changing provider actually gained you anything.

## How long it takes to set up

Allow two weeks: one for the receiving area, the referent and the log, one for packaging formats and a first test collection. The return shows up in office hours recovered, not in a percentage off the shipping price.

**Want to know what outsourcing your shipments would cost?** Enter your volumes and destinations on our [quote page](/devis), or first look at our [rates](/tarifs) to get the order of magnitude. We come back with a proposal matched to your real frequency.`,
    },
    faq: [
      {
        q: {
          fr: "Faut-il un logiciel pour gérer les colis d'une entreprise ?",
          en: "Do you need software to manage a company's parcels?",
        },
        a: {
          fr: "Pas en dessous d'une centaine de mouvements par mois. Un tableau partagé à cinq colonnes (date, sens, tiers, numéro de suivi, service concerné) règle l'essentiel. Le logiciel devient utile quand vous devez prouver la remise interne à de nombreux destinataires sur plusieurs sites.",
          en: "Not below around a hundred movements a month. A five-column shared spreadsheet (date, direction, third party, tracking number, department) covers the essentials. Software becomes useful when you must prove internal handover to many recipients across several sites.",
        },
      },
      {
        q: {
          fr: "À partir de quel volume l'enlèvement sur site devient-il intéressant ?",
          en: "From what volume does on-site collection become worthwhile?",
        },
        a: {
          fr: "En pratique, dès que quelqu'un dans l'entreprise fait un déplacement hebdomadaire pour déposer des colis. Le calcul se fait en heures de travail économisées, pas seulement sur le prix au colis.",
          en: "In practice, as soon as someone in the company makes a weekly trip to drop off parcels. The calculation is in working hours saved, not only in price per parcel.",
        },
      },
      {
        q: {
          fr: "LBG Express Colis travaille-t-il avec les entreprises ?",
          en: "Does LBG Express Colis work with businesses?",
        },
        a: {
          fr: "Oui. Nous organisons des enlèvements programmés en Île-de-France (75, 77, 78, 91, 92, 93, 94, 95) et des envois de cartons vers le Bénin, le Togo et le Mali. Les délais annoncés sont des délais cibles, précisés au devis selon vos volumes.",
          en: "Yes. We arrange scheduled collections across Île-de-France (75, 77, 78, 91, 92, 93, 94, 95) and box shipments to Benin, Togo and Mali. Stated times are target times, confirmed in the quote based on your volumes.",
        },
      },
    ],
  },
  {
    slug: "choisir-une-societe-de-livraison",
    tag: "Services de livraison",
    image: "/images/van-night.jpg",
    publishedAt: "2026-09-04",
    keywords: [
      "services de livraison",
      "service de livraison",
      "société de livraison",
      "société de livraison Paris",
      "entreprise de livraison Île-de-France",
    ],
    title: {
      fr: "Choisir une société de livraison : les 7 critères qui comptent vraiment",
      en: "Choosing a delivery company: the 7 criteria that actually matter",
    },
    excerpt: {
      fr: "Assurance, zone réelle, mode de tarification, interlocuteur, preuve de livraison : la grille de lecture pour comparer des services de livraison sans se faire piéger par le prix affiché.",
      en: "Insurance, real coverage, pricing model, single contact, proof of delivery: how to compare delivery services without being trapped by the headline price.",
    },
    body: {
      fr: `Tous les services de livraison se ressemblent sur une page d'accueil. Ils annoncent la rapidité, le sérieux, le suivi en temps réel. La différence se voit ailleurs : dans ce qui se passe le jour où un colis casse, où le destinataire est absent, où votre volume double d'un coup.

Voici la grille que nous conseillons d'utiliser, dans l'ordre où les critères comptent réellement.

## 1. L'assurance, avant le prix

C'est le point que presque personne ne vérifie et le seul qui peut vous coûter très cher. Deux questions à poser à toute société de livraison :

- quel est le plafond d'indemnisation par envoi, et par sinistre ?
- quelle est la franchise ?

Un transport standard indemnise souvent au poids, avec des plafonds très bas — quelques dizaines d'euros pour un colis de 10 kg. Si vous expédiez du matériel professionnel, de l'électronique ou du mobilier, l'écart entre la valeur réelle et le plafond est le vrai risque.

Demandez le nom de l'assureur et une attestation de responsabilité civile professionnelle. Une société qui ne peut pas produire ce document en deux jours ne devrait pas transporter vos marchandises. De notre côté, nous sommes couverts par Simplis pour les biens confiés jusqu'à 100 000 euros par sinistre, avec une franchise de 200 euros.

## 2. La zone réellement desservie, pas la zone affichée

« Toute la France », « toute l'Europe », « le monde entier » : ces mentions ne veulent rien dire tant que vous n'avez pas demandé qui exécute la livraison au bout de la chaîne. Beaucoup de prestataires sous-traitent tout ce qui sort de leur périmètre naturel. Vous héritez alors d'un intermédiaire de plus, sans gagner en fiabilité.

Posez la question directement : quelles zones traitez-vous vous-mêmes, et lesquelles sont confiées à un partenaire ? Une société qui assume franchement une zone restreinte et maîtrisée vaut mieux qu'une couverture mondiale théorique.

Nous couvrons l'Île-de-France en propre — 75, 77, 78, 91, 92, 93, 94 et 95 — et nous organisons les envois de colis vers le Bénin, le Togo et le Mali. Le détail est sur notre page [zones desservies](/zones).

## 3. Le mode de tarification

Trois modèles cohabitent, et ils ne se comparent pas directement :

- **au colis**, selon poids et dimensions : lisible, adapté aux envois ponctuels
- **à la course ou à la tournée** : pertinent pour des livraisons locales groupées dans la journée
- **au véhicule et à l'heure** : le bon modèle pour un déménagement, un transfert de bureaux ou une livraison volumineuse

Le piège classique consiste à comparer un prix au colis avec un prix à la course. Ramenez tout au coût par livraison effectuée, en incluant les frais qui n'apparaissent pas dans le tarif de base : deuxième présentation, attente sur site, étage sans ascenseur, retour d'un colis refusé, palette non déchargeable. Notre page [tarifs](/tarifs) présente nos ordres de grandeur, mais un devis reste toujours plus juste que n'importe quelle grille générale.

## 4. La preuve de livraison

Sans preuve, un litige est perdu d'avance. Vérifiez ce que le service produit à la remise : signature du destinataire, horodatage, photo du colis déposé, nom de la personne qui a réceptionné. Ces éléments doivent être accessibles sans avoir à écrire un e-mail.

Vérifiez aussi la lisibilité du suivi. Un statut compréhensible évite la moitié des appels clients. Nous expliquons ce que chaque statut signifie dans notre article sur les [statuts de suivi d'un colis](/blog/suivre-un-colis-comprendre-les-statuts).

## 5. L'interlocuteur

C'est le critère le plus sous-estimé et celui que les clients citent le plus souvent après six mois. Sur un incident, la question n'est pas « y a-t-il un service client » mais « est-ce que j'atteins quelqu'un qui peut décider quelque chose ».

Un numéro direct, une réponse par messagerie dans la journée, une même personne qui connaît votre dossier : sur des flux locaux, cela pèse plus lourd qu'un portail en ligne très complet. Testez-le avant de signer, avec une question précise, et regardez le délai de réponse.

## 6. Le comportement en cas d'aléa

Demandez ce qui se passe concrètement dans quatre situations classiques : le destinataire est absent, l'adresse est incomplète, le colis est refusé, le colis arrive endommagé. Les réponses vous en apprendront plus que la plaquette commerciale.

Méfiez-vous des engagements chiffrés trop nets. Aucun transporteur routier ne maîtrise le trafic parisien un jour de grève. Un prestataire honnête parle de délais cibles et de ce qu'il fait quand ils ne sont pas tenus. Nos délais cibles : 24 à 48 heures sur l'Île-de-France, sous trois jours pour un déménagement, 5 à 10 jours en aérien et 30 à 45 jours en maritime vers l'Afrique de l'Ouest.

## 7. Les moyens et la réalité de l'entreprise

Dernier passage : vérifiez l'existence juridique. SIRET actif, numéro de TVA, inscription au registre des transporteurs pour le transport de marchandises, attestation d'assurance à jour. Trente secondes de vérification sur les registres publics éliminent les intermédiaires improvisés.

Regardez ensuite si le parc correspond à vos besoins réels. Un véhicule léger ne charge pas un salon complet ; un poids lourd ne circule pas dans certaines rues parisiennes. La flotte doit coller à votre marchandise, pas à une plaquette.

## Comment décider en pratique

Retenez trois candidats, faites-les chiffrer exactement le même envoi, et testez-les sur un vrai colis non critique. Comparez ensuite quatre choses : le prix final tous frais inclus, le délai constaté, la qualité de la preuve de livraison, et le temps de réponse humaine.

**Vous voulez nous mettre à l'épreuve sur ces critères ?** Décrivez votre besoin sur notre [page de devis](/devis) ou parcourez nos [services](/services). Nous répondons avec un prix ferme et des délais présentés comme des cibles, pas comme des promesses.`,
      en: `Every delivery service looks alike on a homepage. They all promise speed, reliability, real-time tracking. The difference shows elsewhere: in what happens the day a parcel breaks, the recipient is out, or your volume suddenly doubles.

Here is the checklist we recommend, in the order the criteria actually matter.

## 1. Insurance, before price

This is the point almost nobody checks and the only one that can cost you dearly. Two questions to ask any delivery company:

- what is the compensation ceiling per shipment, and per claim?
- what is the deductible?

Standard transport often compensates by weight, with very low ceilings — a few tens of euros for a 10 kg parcel. If you ship professional equipment, electronics or furniture, the gap between real value and the ceiling is the true risk.

Ask for the insurer's name and a professional liability certificate. A company that cannot produce that document within two days should not be carrying your goods. On our side, we are covered by Simplis for goods entrusted to us up to 100,000 euros per claim, with a 200 euro deductible.

## 2. The area actually covered, not the area advertised

"All of France", "all of Europe", "worldwide": these claims mean nothing until you ask who performs the delivery at the end of the chain. Many providers subcontract everything outside their natural footprint. You then inherit one more intermediary without gaining reliability.

Ask directly: which areas do you handle yourselves, and which go to a partner? A company that openly owns a narrow, mastered area is worth more than theoretical global coverage.

We cover Île-de-France ourselves — 75, 77, 78, 91, 92, 93, 94 and 95 — and we arrange parcel shipments to Benin, Togo and Mali. Details are on our [coverage](/zones) page.

## 3. The pricing model

Three models coexist, and they do not compare directly:

- **per parcel**, by weight and dimensions: readable, suited to one-off shipments
- **per run or per round**: relevant for local deliveries grouped within the day
- **per vehicle and per hour**: the right model for a move, an office relocation or a bulky delivery

The classic trap is comparing a per-parcel price with a per-run price. Bring everything back to cost per completed delivery, including the fees that never appear in the headline rate: second attempt, waiting time on site, floor without a lift, return of a refused parcel, pallet that cannot be unloaded. Our [rates](/tarifs) page shows our orders of magnitude, but a quote is always more accurate than any general grid.

## 4. Proof of delivery

Without proof, a dispute is lost before it starts. Check what the service produces at handover: recipient signature, timestamp, photo of the parcel left, name of the person who took it. These must be accessible without writing an email.

Check tracking readability too. A clear status prevents half the customer calls. We explain what each status means in our article on [parcel tracking statuses](/blog/suivre-un-colis-comprendre-les-statuts).

## 5. The contact

This is the most underrated criterion and the one clients mention most after six months. During an incident, the question is not "is there a customer service" but "can I reach someone able to decide something".

A direct number, an answer by message within the day, the same person who knows your file: on local flows that weighs more than a very complete online portal. Test it before signing, with a precise question, and watch the response time.

## 6. Behaviour when things go wrong

Ask what concretely happens in four classic situations: the recipient is absent, the address is incomplete, the parcel is refused, the parcel arrives damaged. The answers will teach you more than the sales brochure.

Be wary of overly crisp numeric commitments. No road carrier controls Paris traffic on a strike day. An honest provider talks about target times and about what they do when those are missed. Our target times: 24 to 48 hours across Île-de-France, within three days for a move, 5 to 10 days by air and 30 to 45 days by sea to West Africa.

## 7. The company's real means

Last pass: check legal existence. Active company registration, VAT number, registration on the carriers' register for goods transport, a current insurance certificate. Thirty seconds of checking on public registers eliminates improvised middlemen.

Then look at whether the fleet matches your real needs. A light van will not load a full living room; a heavy truck cannot enter certain Paris streets. The fleet must match your goods, not a brochure.

## How to decide in practice

Shortlist three candidates, have them price the exact same shipment, and test them on a real, non-critical parcel. Then compare four things: final all-in price, observed transit time, quality of the proof of delivery, and human response time.

**Want to test us on those criteria?** Describe your need on our [quote page](/devis) or browse our [services](/services). We answer with a firm price and with transit times presented as targets, not as promises.`,
    },
    faq: [
      {
        q: {
          fr: "Quelle est la différence entre une société de livraison et un transporteur ?",
          en: "What is the difference between a delivery company and a carrier?",
        },
        a: {
          fr: "Dans le langage courant, aucune. Juridiquement, le transport de marchandises pour compte d'autrui exige une inscription au registre des transporteurs et une assurance adaptée. C'est ce statut qu'il faut vérifier, quel que soit le nom commercial employé.",
          en: "In everyday language, none. Legally, carrying goods for third parties requires registration on the carriers' register and suitable insurance. That status is what to check, whatever the commercial name used.",
        },
      },
      {
        q: {
          fr: "Comment vérifier l'assurance d'un service de livraison ?",
          en: "How do you check a delivery service's insurance?",
        },
        a: {
          fr: "Demandez l'attestation de responsabilité civile professionnelle, avec le nom de l'assureur, le plafond par sinistre et la franchise. Une société sérieuse la transmet sans difficulté.",
          en: "Ask for the professional liability certificate, with the insurer's name, the ceiling per claim and the deductible. A serious company sends it without difficulty.",
        },
      },
      {
        q: {
          fr: "Un prestataire local est-il préférable à un grand réseau ?",
          en: "Is a local provider better than a large network?",
        },
        a: {
          fr: "Cela dépend du flux. Pour des livraisons urgentes, volumineuses ou avec contrainte d'accès en Île-de-France, un acteur local avec un interlocuteur joignable est souvent plus efficace. Pour des envois nationaux très nombreux et standardisés, un réseau dense a l'avantage.",
          en: "It depends on the flow. For urgent, bulky or access-constrained deliveries in Île-de-France, a local player with a reachable contact is often more effective. For very high volumes of standardised national shipments, a dense network has the edge.",
        },
      },
    ],
  },
  {
    slug: "livraison-de-courses-a-paris",
    tag: "Livraison à domicile",
    image: "/images/livraison-2.jpg",
    publishedAt: "2026-09-04",
    keywords: [
      "livraison courses paris",
      "livraison courses domicile",
      "livraison de courses à domicile",
      "coursier courses Paris",
      "livraison express paris",
    ],
    title: {
      fr: "Livraison de courses à Paris et à domicile : comment ça marche vraiment",
      en: "Grocery and shopping delivery in Paris: how it actually works",
    },
    excerpt: {
      fr: "Coursier à la demande, livraison de gros volumes, courses pour un parent âgé, réassort de commerce : les quatre situations, ce qu'elles coûtent et comment préparer la course pour éviter les mauvaises surprises.",
      en: "On-demand courier, bulky loads, shopping for an elderly relative, shop restocking: the four situations, what they cost and how to prepare so nothing goes wrong.",
    },
    body: {
      fr: `« Livraison de courses à Paris » recouvre quatre besoins très différents, et c'est pour cela que les prix trouvés en ligne semblent incohérents. Avant de comparer quoi que ce soit, il faut savoir dans quelle situation on se trouve.

## Les quatre situations

**Le panier alimentaire du quotidien.** Une commande passée sur le site d'une enseigne, livrée dans un créneau. Le transport est vendu par l'enseigne, vous ne choisissez pas le livreur. C'est simple et peu cher, mais rigide : pas de manutention, pas d'étage, pas de gros volume.

**Le gros volume et l'encombrant.** Un plein de courses pour la semaine, des packs d'eau, un carton de vin, du matériel acheté en grande surface de bricolage. Là, ce n'est plus un panier, c'est du transport avec manutention. Il faut un véhicule et quelqu'un qui porte.

**Les courses pour un proche.** Un parent âgé, une personne à mobilité réduite, quelqu'un d'hospitalisé. Le besoin réel n'est pas la vitesse mais la régularité et la confiance : le même passage, aux mêmes horaires, avec quelqu'un d'identifiable.

**Le réassort professionnel.** Un restaurant qui manque d'un produit en pleine journée, une boutique qui doit récupérer du stock dans un autre arrondissement, un traiteur qui livre des plateaux. Le critère est la réactivité dans la journée.

## Ce qui fait le prix

Quatre paramètres, dans cet ordre :

- **la distance et le nombre d'arrêts** : deux adresses coûtent moins cher que deux courses séparées
- **le volume et le poids** : un coursier deux-roues ne charge pas six packs d'eau, il faut un utilitaire
- **la manutention** : un quatrième étage sans ascenseur, ce n'est pas la même prestation qu'un dépôt en pied d'immeuble
- **le créneau** : une course dans l'heure, en soirée ou le samedi coûte plus qu'un créneau souple en journée

À cela s'ajoutent des frais que les clients découvrent souvent trop tard : le temps d'attente si personne n'ouvre, un stationnement impossible, une deuxième présentation. Demandez ces conditions avant, pas après. Nos ordres de grandeur figurent sur la page [tarifs](/tarifs), et un [devis](/devis) reste toujours plus précis.

## Le point que tout le monde oublie : la chaîne du froid

Dès qu'il y a du frais ou du surgelé, la durée devient un enjeu sanitaire et pas seulement un confort. Quelques règles simples :

- annoncez le frais et le surgelé au moment de la commande, pas à l'arrivée du livreur
- prévoyez des sacs isothermes ou des blocs réfrigérants pour les trajets longs
- soyez présent à la livraison, ou prévoyez un point de dépôt réfrigéré : un colis frais laissé chez un voisin absent est perdu
- pour les produits alimentaires, un transport en caisse isotherme est indispensable au-delà d'une trentaine de minutes

Un prestataire qui accepte du surgelé sans poser une seule question sur le conditionnement n'est pas le bon prestataire.

## Comment préparer une course pour qu'elle se passe bien

La majorité des incidents viennent d'informations manquantes, pas du transport lui-même. Donnez systématiquement :

- l'adresse complète avec le code d'accès, le bâtiment, l'étage et la présence ou non d'un ascenseur
- un numéro de téléphone joignable pendant le créneau
- la nature de la marchandise, en signalant le fragile, le frais et le lourd
- une instruction claire en cas d'absence : voisin, gardien, ou nouveau passage

Pour les achats volumineux, précisez le nombre de colis et leurs dimensions approximatives. C'est ce qui détermine le véhicule envoyé, et donc le fait que la course soit possible ou non.

## Livraison de courses ou coursier : que choisir

Si votre besoin est un panier alimentaire standard, passez par le service de livraison de l'enseigne, c'est plus économique.

Si votre besoin sort du cadre — volume important, manutention, plusieurs adresses, horaire précis, marchandise fragile ou de valeur, achat récupéré dans un magasin qui ne livre pas — un service de coursier ou de transport léger est plus adapté. Vous payez une course, pas un panier, et vous obtenez de la manutention et de la souplesse.

C'est ce que nous faisons chez LBG Express Colis : du transport léger et de la livraison à domicile en Île-de-France, sur les huit départements (75, 77, 78, 91, 92, 93, 94, 95), avec enlèvement à l'adresse de votre choix. Nous prenons aussi les besoins réguliers, par exemple un passage hebdomadaire à jour fixe. Le détail de nos prestations est sur la page [services](/services), la couverture sur la page [zones](/zones).

## Et pour l'envoi de colis plutôt que la course

Si votre besoin n'est pas une course dans la journée mais un envoi vers une autre adresse, ce n'est plus le même service ni le même tarif. Nos articles sur [l'envoi de colis pas cher en France](/blog/envoyer-un-colis-pas-cher-en-france) et sur le choix entre [point relais et enlèvement à domicile](/blog/point-relais-ou-enlevement-a-domicile) traitent ce cas.

## Délais : ce qu'on peut annoncer honnêtement

Sur Paris intra-muros, une course préparée et accessible se traite en général dans la journée. En proche banlieue, comptez la demi-journée à la journée selon le créneau. Sur les livraisons régionales, notre délai cible est de 24 à 48 heures. Ce sont des cibles, pas des garanties : trafic, chantiers et accès immeuble pèsent plus que la distance dans Paris.

**Un besoin ponctuel ou régulier à Paris ou en Île-de-France ?** Décrivez la course sur notre [page de devis](/devis) — adresses, volume, créneau souhaité — et nous vous répondons avec un prix ferme.`,
      en: `"Grocery delivery in Paris" covers four very different needs, which is why the prices you find online look inconsistent. Before comparing anything, you need to know which situation you are in.

## The four situations

**The everyday grocery basket.** An order placed on a retailer's website, delivered within a slot. The transport is sold by the retailer, you do not choose the driver. It is simple and cheap, but rigid: no handling, no upper floor, no bulky load.

**Bulky and heavy loads.** A full week's shopping, packs of water, a case of wine, materials bought at a DIY store. That is no longer a basket, it is transport with handling. You need a vehicle and someone to carry.

**Shopping for a relative.** An elderly parent, someone with reduced mobility, someone in hospital. The real need is not speed but regularity and trust: the same visit, at the same times, with someone identifiable.

**Professional restocking.** A restaurant short of an item mid-service, a shop that must collect stock from another district, a caterer delivering platters. The criterion is same-day responsiveness.

## What drives the price

Four parameters, in this order:

- **distance and number of stops**: two addresses cost less than two separate runs
- **volume and weight**: a two-wheeler courier cannot load six packs of water, you need a van
- **handling**: a fourth floor without a lift is not the same service as a drop at the entrance
- **the slot**: a run within the hour, in the evening or on Saturday costs more than a flexible daytime slot

On top of that come fees customers often discover too late: waiting time if nobody answers, impossible parking, a second attempt. Ask about those conditions before, not after. Our orders of magnitude are on the [rates](/tarifs) page, and a [quote](/devis) is always more precise.

## The point everyone forgets: the cold chain

As soon as chilled or frozen goods are involved, duration becomes a food safety issue, not just a comfort matter. A few simple rules:

- declare chilled and frozen items when ordering, not when the driver arrives
- provide insulated bags or ice packs for long trips
- be present at delivery, or arrange a refrigerated drop point: chilled goods left with an absent neighbour are lost
- for food products, insulated container transport is essential beyond about thirty minutes

A provider who accepts frozen goods without a single question about packaging is not the right provider.

## How to prepare a run so it goes well

Most incidents come from missing information, not from the transport itself. Always give:

- the full address with door code, building, floor and whether there is a lift
- a phone number reachable during the slot
- the nature of the goods, flagging anything fragile, chilled or heavy
- a clear instruction if you are absent: neighbour, concierge, or a new attempt

For bulky purchases, state the number of items and their approximate dimensions. That determines which vehicle is sent, and therefore whether the run is feasible at all.

## Grocery delivery or courier: which to choose

If your need is a standard food basket, use the retailer's own delivery service, it is cheaper.

If your need falls outside that frame — large volume, handling, several addresses, a precise time, fragile or valuable goods, a purchase to collect from a shop that does not deliver — a courier or light transport service fits better. You pay for a run, not a basket, and you get handling and flexibility.

That is what we do at LBG Express Colis: light transport and home delivery across Île-de-France, over the eight departments (75, 77, 78, 91, 92, 93, 94, 95), with collection at the address of your choice. We also take on recurring needs, such as a weekly visit on a fixed day. Details of our services are on the [services](/services) page, coverage on the [areas](/zones) page.

## And if you need to send a parcel rather than a run

If your need is not a same-day run but a shipment to another address, that is a different service and a different rate. Our articles on [sending a parcel cheaply in France](/blog/envoyer-un-colis-pas-cher-en-france) and on choosing between [a pickup point and home collection](/blog/point-relais-ou-enlevement-a-domicile) cover that case.

## Transit times: what can honestly be stated

Within Paris, a prepared and accessible run is generally handled the same day. In the inner suburbs, allow half a day to a day depending on the slot. On regional deliveries, our target time is 24 to 48 hours. These are targets, not guarantees: traffic, roadworks and building access weigh more than distance inside Paris.

**A one-off or recurring need in Paris or Île-de-France?** Describe the run on our [quote page](/devis) — addresses, volume, preferred slot — and we come back with a firm price.`,
    },
    faq: [
      {
        q: {
          fr: "Peut-on faire livrer ses courses à domicile à Paris avec des produits frais ?",
          en: "Can you have groceries delivered at home in Paris with chilled products?",
        },
        a: {
          fr: "Oui, à condition de l'annoncer à la commande et de prévoir un conditionnement isotherme pour les trajets de plus d'une trentaine de minutes. Une présence à la livraison est fortement recommandée pour le frais et le surgelé.",
          en: "Yes, provided you declare it when ordering and provide insulated packaging for trips over about thirty minutes. Being present at delivery is strongly recommended for chilled and frozen goods.",
        },
      },
      {
        q: {
          fr: "Quel est le délai pour une livraison de courses à Paris ?",
          en: "How long does a grocery delivery in Paris take?",
        },
        a: {
          fr: "Sur Paris intra-muros, une course préparée et accessible se traite généralement dans la journée. En Île-de-France, notre délai cible est de 24 à 48 heures. Ce sont des délais cibles, confirmés au devis.",
          en: "Within Paris, a prepared and accessible run is generally handled the same day. Across Île-de-France, our target time is 24 to 48 hours. These are target times, confirmed in the quote.",
        },
      },
      {
        q: {
          fr: "Livrez-vous les courses d'un proche à une autre adresse que la mienne ?",
          en: "Can you deliver a relative's shopping to an address other than mine?",
        },
        a: {
          fr: "Oui. Indiquez l'adresse d'enlèvement, l'adresse de livraison, le créneau souhaité et un numéro joignable pour le destinataire. Les passages réguliers à jour et heure fixes sont possibles en Île-de-France.",
          en: "Yes. Provide the collection address, the delivery address, the preferred slot and a reachable number for the recipient. Recurring visits on a fixed day and time are possible across Île-de-France.",
        },
      },
    ],
  },
];
