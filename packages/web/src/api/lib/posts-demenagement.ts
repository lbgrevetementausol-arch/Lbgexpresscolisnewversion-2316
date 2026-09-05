/**
 * Articles SEO — intention « déménagement » (volume, prix, ville, aides, cartons).
 * Chaque article cible une requête réelle tapée en France et positionne LBG Express Colis
 * comme la solution au problème posé. Contenu versionné avec le code (pas de CMS).
 */

import type { Post } from "./posts";

export const POSTS_DEMENAGEMENT: Post[] = [
  {
    slug: "comment-calculer-le-volume-de-son-demenagement",
    tag: "Déménagement",
    image: "/images/blog/demenagement.jpg",
    publishedAt: "2026-08-31",
    keywords: [
      "calculateur de volume déménagement",
      "comment calculer le volume de son déménagement",
      "volume déménagement m3",
      "combien de m3 pour un T2",
    ],
    title: {
      fr: "Comment calculer le volume de son déménagement en m³ (méthode + barème par surface)",
      en: "How to calculate your moving volume in m³ (method + size guide)",
    },
    excerpt: {
      fr: "Le volume en m³ décide de votre prix. Voici la méthode utilisée par les déménageurs, le barème pièce par pièce et les erreurs qui font exploser le devis.",
      en: "Volume in m³ drives your price. Here is the method movers use, a room-by-room guide and the mistakes that inflate quotes.",
    },
    faq: [
      {
        q: { fr: "Combien de m³ pour un T2 ?", en: "How many m³ for a 1-bedroom flat?" },
        a: {
          fr: "Comptez 18 à 25 m³ pour un T2 de 45 à 55 m² normalement meublé, cave et cartons inclus.",
          en: "Expect 18 to 25 m³ for a 45–55 m² one-bedroom flat, including boxes and storage.",
        },
      },
      {
        q: { fr: "Comment convertir des m² en m³ ?", en: "How do I convert m² to m³?" },
        a: {
          fr: "La règle terrain est de 0,45 à 0,55 m³ par m² habitable. 60 m² donnent donc environ 27 à 33 m³.",
          en: "The field rule is 0.45 to 0.55 m³ per m² of living space, so 60 m² gives roughly 27 to 33 m³.",
        },
      },
    ],
    body: {
      fr: `Tous les devis de déménagement partent du même chiffre : le volume à transporter, exprimé en mètres cubes. Un écart de 5 m³ sur une estimation, c'est 200 à 600 € d'écart sur la facture finale, et parfois un camion trop petit le jour J. Voici comment obtenir un chiffre fiable en vingt minutes.

## La méthode officielle : lister, pas estimer
Un déménageur ne regarde jamais la surface de votre logement, il compte les meubles. La formule est simple : longueur × largeur × hauteur de chaque meuble, en mètres, puis on additionne. Un canapé 3 places de 2,10 m × 0,90 m × 0,85 m fait 1,6 m³.

Faites-le pièce par pièce, en ouvrant chaque placard. Ce qui est oublié dans 90 % des auto-estimations : la cave, le garage, le balcon, le contenu du grenier, l'électroménager de la buanderie et les vélos.

## Le barème rapide par meuble
- Canapé 3 places : 1,6 m³
- Lit double avec sommier et matelas : 1,8 m³
- Armoire 2 portes : 1,2 m³
- Table à manger 6 personnes : 1 m³
- Réfrigérateur combiné : 0,6 m³
- Lave-linge : 0,4 m³
- Carton standard (55 × 35 × 30 cm) : 0,06 m³ — soit environ 17 cartons par m³
- Télévision 55 pouces emballée : 0,15 m³

## Le barème par surface (pour vérifier votre total)
- Studio 20-30 m² : 8 à 14 m³
- T2 45-55 m² : 18 à 25 m³
- T3 65-75 m² : 28 à 36 m³
- T4 90-100 m² : 38 à 48 m³
- Maison 120-140 m² : 50 à 65 m³
- Maison 160 m² et plus : 70 m³ et plus

Si votre liste détaillée s'écarte de plus de 20 % de ce barème, c'est qu'il manque une pièce dans votre inventaire.

## Les trois erreurs qui font exploser le devis
**Sous-estimer les cartons.** Un T3 génère 45 à 60 cartons, soit près de 3,5 m³ à lui seul. Beaucoup de particuliers les oublient totalement.

**Confondre volume utile et volume chargé.** Un matelas ne s'empile pas, une table ne se démonte pas toujours. Les professionnels ajoutent 10 à 15 % de « volume perdu » au chargement. Prévoyez-le.

**Oublier les contraintes d'accès.** Un 4ᵉ étage sans ascenseur, une rue piétonne ou 60 m de portage entre le camion et la porte changent le temps de main-d'œuvre, donc le prix — pas le volume.

## Ce que le volume change concrètement sur votre prix
Chez LBG Express Colis, le déménagement se facture au mètre cube selon la formule choisie : de 40 €/m³ en formule Économique sur courte distance à 165 €/m³ en formule Confort longue distance avec emballage complet. Un T3 de 32 m³ se situe donc entre 1 280 € et 5 280 € HT selon la distance et le niveau de service — l'écart se joue entièrement sur ce que vous faites vous-même.

## Faites vérifier votre volume gratuitement
Notre estimateur en ligne calcule votre volume à partir de votre surface et de vos meubles, puis affiche un prix immédiat sans engagement. Si votre déménagement dépasse 30 m³ ou comporte des objets lourds (piano, coffre-fort, machines), un de nos chargés d'affaires valide le volume par téléphone ou en visite : le devis devient alors ferme, sans supplément surprise le jour du chargement.

**Obtenez votre estimation en 2 minutes sur notre page devis, ou appelez-nous au 06 95 09 86 88 pour une validation par un professionnel.**`,
      en: `Every moving quote starts with one number: the volume to transport, in cubic metres. A 5 m³ error means €200 to €600 on the final invoice — and sometimes a van that is too small on the day.

## The professional method: list, don't guess
Movers never look at your floor area, they count furniture. Length × width × height in metres for each item, then add it up. A three-seater sofa at 2.10 × 0.90 × 0.85 m is 1.6 m³.

Do it room by room and open every cupboard. What most people forget: the cellar, the garage, the balcony, the attic, laundry appliances and bikes.

## Quick furniture guide
- Three-seater sofa: 1.6 m³
- Double bed with base and mattress: 1.8 m³
- Two-door wardrobe: 1.2 m³
- Six-seat dining table: 1 m³
- Fridge-freezer: 0.6 m³
- Washing machine: 0.4 m³
- Standard box (55 × 35 × 30 cm): 0.06 m³ — about 17 boxes per m³

## Guide by floor area
- Studio 20-30 m²: 8 to 14 m³
- 1-bed 45-55 m²: 18 to 25 m³
- 2-bed 65-75 m²: 28 to 36 m³
- 3-bed 90-100 m²: 38 to 48 m³
- House 120-140 m²: 50 to 65 m³

## Three mistakes that inflate the quote
Underestimating boxes (a 2-bed generates 45-60 boxes, nearly 3.5 m³), confusing usable volume with loaded volume (add 10-15% of lost space), and ignoring access constraints — a fourth floor without a lift changes labour time, not volume.

## What volume means for your price
At LBG Express Colis moving is priced per cubic metre, from €40/m³ on the Economy formula for short distances up to €165/m³ on the Comfort formula with full packing.

**Get your estimate in two minutes on our quote page, or call +33 6 95 09 86 88 for a professional validation.**`,
    },
  },
  {
    slug: "tarif-demenagement-prix-2026",
    tag: "Déménagement",
    image: "/images/demenagement-2.jpg",
    publishedAt: "2026-08-30",
    keywords: [
      "tarif déménagement",
      "prix déménagement 2026",
      "devis déménagement en ligne",
      "combien coûte un déménagement",
    ],
    title: {
      fr: "Tarif déménagement 2026 : prix réels par formule, par volume et par distance",
      en: "Moving costs in 2026: real prices by formula, volume and distance",
    },
    excerpt: {
      fr: "Combien coûte vraiment un déménagement en France en 2026 ? Prix au m³, exemples chiffrés du studio à la maison, et les suppléments qui n'apparaissent jamais dans les publicités.",
      en: "What does a move really cost in France in 2026? Price per m³, worked examples and the extras ads never mention.",
    },
    faq: [
      {
        q: { fr: "Quel est le prix moyen d'un déménagement ?", en: "What is the average moving cost?" },
        a: {
          fr: "En France, comptez 700 à 1 500 € pour un T2 et 1 800 à 4 000 € pour un T4, selon la distance et la formule choisie.",
          en: "In France, expect €700-1,500 for a one-bedroom and €1,800-4,000 for a three-bedroom, depending on distance and formula.",
        },
      },
      {
        q: { fr: "Le devis en ligne est-il ferme ?", en: "Is the online quote binding?" },
        a: {
          fr: "Notre estimation en ligne est immédiate et gratuite ; elle devient un devis ferme après validation du volume par un chargé d'affaires.",
          en: "Our online estimate is instant and free; it becomes a binding quote once volume is validated by an account manager.",
        },
      },
    ],
    body: {
      fr: `« Combien ça coûte ? » est la première question de tout déménagement, et la plus mal renseignée sur internet. Voici des chiffres réels, ceux de notre grille 2026, avec la logique qui les produit.

## Un prix se construit sur trois variables
**Le volume**, en m³, calculé sur votre inventaire. **La distance** entre les deux adresses. **La formule**, c'est-à-dire la part du travail que vous déléguez. Tout le reste (étage, portage, monte-meuble, emballage) vient s'ajouter en options clairement identifiées.

## Nos trois formules et leur prix au m³
- **Économique** — vous emballez, nous chargeons, transportons et livrons : 40 €/m³ en courte distance, jusqu'à 75 €/m³ en longue distance.
- **Standard** — nous démontons et remontons les meubles, vous faites les cartons : 65 à 125 €/m³.
- **Confort** — emballage complet, protection, démontage, remontage, déballage : 90 à 165 €/m³.

## Exemples chiffrés (HT, hors options)
- **Studio 12 m³, même ville, formule Économique** : environ 480 €
- **T2 22 m³, 150 km, formule Standard** : environ 1 800 €
- **T3 32 m³, 400 km, formule Standard** : environ 2 900 €
- **T4 45 m³, 700 km, formule Confort** : environ 6 300 €
- **Maison 60 m³, régionale, formule Économique** : environ 2 900 €

À ces montants s'ajoutent la TVA à 20 % et, sur les longues distances, une contribution carburant indexée (14,2 % en 2026) — nous l'affichons systématiquement au lieu de la cacher dans le prix au m³.

## Les suppléments à connaître avant de signer
- **Étage sans ascenseur** : 15 € HT par tranche de 10 m³ et par étage
- **Monte-meuble** : 180 € HT, obligatoire dès qu'un meuble ne passe ni par la cage ni par la porte
- **Portage long** (plus de 30 m entre le camion et la porte) : facturé au temps
- **Cartons fournis** : 4,50 € HT l'unité, livrés avant le déménagement
- **Créneau express ou week-end** : +35 € HT ou +30 % selon l'urgence
- **Assurance ad valorem** : 0,7 % de la valeur déclarée, minimum 8 € HT

## Les trois leviers qui font vraiment baisser la facture
**Le groupage.** Votre mobilier partage le camion avec d'autres clients sur le même axe : 25 à 40 % d'économie contre un délai de livraison élargi de quelques jours.

**La flexibilité de date.** Un déménagement en milieu de mois, hors juin-juillet-août et hors samedi, coûte structurellement moins cher.

**Le travail réparti.** Emballer vous-même vos cartons et vider vos meubles fait passer une formule Confort en Économique : c'est le poste le plus élastique de tout le devis.

## Ce qu'un devis honnête doit contenir
Volume retenu, adresses exactes, étages et accès, formule, liste des options, assurance, date d'enlèvement, plage de livraison, et le prix TTC. Si un de ces éléments manque, la facture finale sera différente du devis — c'est mathématique.

**Testez notre estimateur en ligne : prix immédiat, détail ligne par ligne, aucun engagement. Un doute sur votre volume ? Appelez le 06 95 09 86 88.**`,
      en: `"How much does it cost?" is the first question of any move, and the worst documented online. Here are real figures from our 2026 price grid.

## Three variables build a price
Volume in m³, distance between addresses, and the formula — how much of the work you delegate. Everything else (floors, carrying distance, furniture lift, packing) is a clearly identified option.

## Our three formulas, per m³
- **Economy** — you pack, we load, transport and deliver: €40/m³ short distance up to €75/m³ long distance.
- **Standard** — we dismantle and reassemble furniture: €65 to €125/m³.
- **Comfort** — full packing, protection, dismantling, reassembly, unpacking: €90 to €165/m³.

## Worked examples (excl. VAT)
- Studio 12 m³, same city, Economy: around €480
- 1-bed 22 m³, 150 km, Standard: around €1,800
- 2-bed 32 m³, 400 km, Standard: around €2,900
- 3-bed 45 m³, 700 km, Comfort: around €6,300

Add 20% VAT and, on long distances, an indexed fuel contribution (14.2% in 2026) which we always show instead of hiding it.

## Extras to know before signing
Floors without a lift (€15 excl. VAT per 10 m³ per floor), furniture lift (€180), long carrying distance, boxes supplied (€4.50 each), express or weekend slot (+€35 or +30%), ad valorem insurance (0.7% of declared value, €8 minimum).

## Three real ways to cut the bill
Groupage shipping (25-40% cheaper), flexible dates (avoid June-August and Saturdays), and doing your own packing.

**Try our online estimator: instant price, line-by-line detail, no commitment. Call +33 6 95 09 86 88 with any doubt.**`,
    },
  },
  {
    slug: "demenagement-pas-cher-groupage",
    tag: "Déménagement",
    image: "/images/entrepot.jpg",
    publishedAt: "2026-08-29",
    keywords: [
      "déménagement pas cher",
      "déménagement groupé",
      "déménagement économique",
      "déménagement groupage prix",
    ],
    title: {
      fr: "Déménagement pas cher : le groupage, la seule méthode qui fait vraiment baisser le prix de 40 %",
      en: "Cheap moving: groupage, the only method that really cuts the price by 40%",
    },
    excerpt: {
      fr: "Payer moins cher sans déménager soi-même, c'est possible : le groupage partage le camion entre plusieurs clients. Voici comment ça marche, pour qui, et à quel prix.",
      en: "Paying less without doing it yourself is possible: groupage shares the van between several customers. How it works, for whom, at what price.",
    },
    faq: [
      {
        q: { fr: "Le déménagement groupé est-il risqué ?", en: "Is groupage moving risky?" },
        a: {
          fr: "Non : chaque lot est inventorié, filmé et cerclé séparément, et couvert par la même assurance qu'un déménagement dédié.",
          en: "No: each lot is inventoried, wrapped and strapped separately, and covered by the same insurance as a dedicated move.",
        },
      },
      {
        q: { fr: "Combien de temps prend un déménagement groupé ?", en: "How long does a groupage move take?" },
        a: {
          fr: "Comptez 3 à 8 jours ouvrés selon l'axe, contre 24 à 48 h pour un camion dédié.",
          en: "Allow 3 to 8 working days depending on the route, versus 24 to 48 hours for a dedicated van.",
        },
      },
    ],
    body: {
      fr: `Un camion de déménagement qui roule à moitié vide, c'est vous qui le payez. Le groupage corrige exactement ce problème : plusieurs déménagements voyagent dans le même véhicule sur le même axe, et le coût du trajet est réparti.

## Comment fonctionne concrètement un déménagement groupé
Votre mobilier est chargé, inventorié, filmé et cerclé en lot identifié. Le camion complète son chargement avec d'autres clients allant dans la même direction, puis livre chaque lot dans l'ordre logique de la tournée. Vous ne payez que le volume que vous occupez, pas le camion entier.

## L'économie réelle
Sur un T2 de 22 m³ entre Paris et Toulouse, un camion dédié se situe autour de 2 200 € HT. En groupage, le même volume tombe entre 1 300 et 1 600 € HT. L'économie est de 25 à 40 %, et elle augmente avec la distance : plus le trajet est long, plus le partage est rentable.

## Ce que vous échangez contre ce prix
**Le délai.** La livraison n'est plus à date fixe mais dans une fenêtre de 3 à 8 jours ouvrés, le temps que la tournée se constitue et se déroule.

**La flexibilité de dernière minute.** Un groupage se planifie une à trois semaines à l'avance.

En revanche, vous n'échangez rien sur la protection : mêmes équipes, mêmes protections, même assurance, même responsabilité contractuelle.

## Pour qui c'est la bonne solution
- Les volumes de 8 à 30 m³ : studio, T2, T3 sans meubles hors gabarit
- Les longues distances : au-delà de 300 km, le gain est maximal
- Les déménagements sans contrainte de date d'arrivée : entrée dans un logement déjà disponible, étudiants, mobilité professionnelle avec hébergement transitoire
- Les envois de mobilier seul : succession, meuble hérité, vente en ligne

## Pour qui ce n'est pas adapté
Un déménagement avec remise des clés le jour même dans les deux logements, un volume supérieur à 40 m³, ou un mobilier nécessitant un camion à hayon dédié en continu. Dans ces cas, le camion dédié reste plus sûr et parfois moins cher au m³.

## Les autres leviers d'économie, classés par efficacité réelle
1. **Groupage** : -25 à -40 %
2. **Emballer soi-même** (passer de Confort à Économique) : -30 à -45 % sur la main-d'œuvre
3. **Décaler la date** hors haute saison et hors samedi : -10 à -15 %
4. **Réduire le volume** : vendre ou donner avant de partir, chaque m³ économisé se voit sur la facture
5. **Anticiper les aides** : CAF, Action Logement, employeur — jusqu'à plusieurs centaines d'euros

## Notre offre groupage
Nous opérons du groupage quotidien en Île-de-France, hebdomadaire sur les grands axes nationaux et régulier vers l'Europe, le Maghreb et l'Afrique. Vous recevez un inventaire signé au chargement, un suivi en ligne à chaque étape et une plage de livraison confirmée par SMS.

**Demandez un prix groupage sur notre page devis en précisant votre flexibilité de dates : c'est là que se gagnent les 40 %.**`,
      en: `A half-empty removal van is something you pay for. Groupage fixes exactly that: several moves travel in the same vehicle along the same route and the trip cost is shared.

## How it works
Your furniture is loaded, inventoried, wrapped and strapped as an identified lot. The van fills up with other customers heading the same way, then delivers each lot along the route. You only pay for the volume you occupy.

## The real saving
For a 22 m³ one-bedroom from Paris to Toulouse, a dedicated van costs around €2,200 excl. VAT. With groupage the same volume drops to €1,300-1,600 — a 25 to 40% saving that grows with distance.

## What you trade
Delivery moves from a fixed date to a 3-8 working day window, and groupage needs 1-3 weeks of notice. You trade nothing on protection: same teams, same wrapping, same insurance.

## Who it suits
Volumes of 8-30 m³, distances over 300 km, moves without a same-day key handover, and furniture-only shipments.

## Who it does not suit
Same-day handover in both homes, volumes above 40 m³, or furniture needing a dedicated tail-lift van throughout.

## Other savings, ranked
Groupage (-25 to -40%), self-packing (-30 to -45% on labour), off-peak dates (-10 to -15%), reducing volume, and claiming moving grants.

**Ask for a groupage price on our quote page and state your date flexibility — that is where the 40% is won.**`,
    },
  },
  {
    slug: "demenageur-paris-lyon-marseille-comment-choisir",
    tag: "Déménagement",
    image: "/images/van-night.jpg",
    publishedAt: "2026-08-28",
    keywords: [
      "déménageur Paris",
      "déménageur Lyon",
      "déménageur Marseille",
      "entreprise de déménagement",
      "déménagement Paris Lyon",
    ],
    title: {
      fr: "Déménageur à Paris, Lyon, Marseille : comment choisir sans se faire piéger (et les prix par ville)",
      en: "Movers in Paris, Lyon, Marseille: how to choose safely (with city prices)",
    },
    excerpt: {
      fr: "Les contraintes d'un déménagement ne sont pas les mêmes à Paris, à Lyon ou à Marseille. Les vérifications à faire, les pièges classiques et les prix constatés sur les grands axes.",
      en: "Moving constraints differ between Paris, Lyon and Marseille. The checks to run, the classic traps and observed prices on major routes.",
    },
    faq: [
      {
        q: { fr: "Comment vérifier qu'un déménageur est légal ?", en: "How do I check a mover is legitimate?" },
        a: {
          fr: "Exigez le numéro SIRET, l'inscription au registre des transporteurs, l'attestation d'assurance et un devis écrit détaillé avant tout acompte.",
          en: "Ask for the SIRET number, transport register listing, insurance certificate and a detailed written quote before any deposit.",
        },
      },
      {
        q: { fr: "Faut-il une autorisation de stationnement ?", en: "Do I need a parking permit?" },
        a: {
          fr: "Oui dans la plupart des grandes villes : la demande se fait en mairie 10 à 15 jours avant, nous nous en chargeons sur demande.",
          en: "Yes in most large cities: apply to the town hall 10-15 days ahead — we handle it on request.",
        },
      },
    ],
    body: {
      fr: `Choisir un déménageur, ce n'est pas comparer trois prix : c'est vérifier qu'une entreprise pourra réellement charger votre mobilier dans votre rue, à votre étage, à la date prévue. Les contraintes changent radicalement d'une ville à l'autre.

## Les cinq vérifications non négociables
1. **SIRET et inscription au registre des transporteurs** : un déménageur non inscrit n'a pas le droit d'exercer, et son assurance ne vous couvrira pas.
2. **Attestation d'assurance en cours de validité**, avec le plafond d'indemnisation par objet.
3. **Devis écrit et détaillé** : volume, adresses, étages, options, plage de livraison, prix TTC. Un prix donné au téléphone n'engage personne.
4. **Aucun acompte en espèces** et jamais plus de 30 % avant le chargement.
5. **Déclaration de valeur** signée : c'est elle qui détermine l'indemnisation en cas d'avarie, pas la facture d'achat.

## Paris et Île-de-France : le problème c'est la rue, pas le camion
Rues étroites, zones piétonnes, ZFE, immeubles haussmanniens sans ascenseur, cages d'escalier en colimaçon : à Paris, le coût réel se joue sur l'accès. Deux réflexes indispensables : demander l'autorisation de stationnement en mairie 10 à 15 jours avant, et faire évaluer la nécessité d'un monte-meuble avant la signature — le découvrir le matin du déménagement coûte 180 € HT en urgence et fait perdre deux heures.

Ordre de prix constaté en Île-de-France pour un T2 (22 m³) avec formule Standard : 950 à 1 400 € HT intra-muros.

## Lyon : les pentes, les couloirs de bus et les grandes distances de portage
Croix-Rousse, Vieux Lyon, Presqu'île : ruelles en pente, accès réglementés, stationnement contraint. Un portage de 40 à 80 m est fréquent et doit figurer sur le devis, sinon il apparaîtra en supplément. Prix constaté pour un T3 (32 m³), Standard, intra-Lyon : 1 300 à 1 800 € HT.

## Marseille : l'accès en collines et la saison
Quartiers en hauteur, escaliers extérieurs, voies sans issue pour un 20 tonnes : le véhicule doit être dimensionné à l'accès, souvent avec navette en camion 12 m³. Attention aussi à la saisonnalité, très marquée l'été. Prix constaté pour un T3, Standard : 1 200 à 1 700 € HT.

## Les grands axes interurbains, en groupage ou en dédié
- **Paris ↔ Lyon** (465 km) : T2 en groupage 1 100 à 1 400 € HT, camion dédié 1 700 à 2 200 €
- **Paris ↔ Marseille** (775 km) : T2 en groupage 1 300 à 1 700 € HT, dédié 2 100 à 2 700 €
- **Lyon ↔ Toulouse** (540 km) : T3 en groupage 1 700 à 2 200 € HT
- **Paris ↔ Bordeaux** (585 km) : T3 en groupage 1 800 à 2 300 € HT

## Les trois pièges les plus fréquents
**Le devis sans visite sur un gros volume.** Au-delà de 30 m³, une validation à distance sans inventaire précis finit presque toujours par un ajustement le jour J.

**Le prix « tout compris » qui ne l'est pas.** Vérifiez explicitement : étages, portage, monte-meuble, cartons, démontage, assurance.

**L'acompte élevé avant tout écrit.** C'est le marqueur numéro un des sociétés éphémères.

## Comment nous travaillons
LBG Express Colis intervient sur toute la France, avec un dimensionnement du véhicule à l'accès réel, la gestion des autorisations de stationnement, un inventaire signé au chargement et un suivi en ligne. Le devis mentionne chaque contrainte identifiée : ce qui est écrit est ce qui est facturé.

**Indiquez vos deux adresses avec l'étage et l'accès sur notre page devis, vous aurez un prix ferme et une plage de livraison, ville par ville.**`,
      en: `Choosing a mover is not comparing three prices: it is checking a company can actually load your furniture in your street, on your floor, on the planned date. Constraints change radically between cities.

## Five non-negotiable checks
SIRET and transport register listing, valid insurance certificate with per-item cap, a detailed written quote, no cash deposit and never more than 30% before loading, and a signed declaration of value.

## Paris: the street is the problem, not the van
Narrow streets, pedestrian zones, low-emission zones, Haussmann buildings without lifts. Apply for a parking permit 10-15 days ahead and assess the need for a furniture lift before signing. Observed price for a 22 m³ one-bedroom, Standard formula: €950-1,400 excl. VAT.

## Lyon: slopes, bus lanes and long carrying distances
Carrying distances of 40-80 m are common and must appear on the quote. Observed price for a 32 m³ two-bedroom: €1,300-1,800.

## Marseille: hillside access and seasonality
Vehicles must be sized to the access, often with a 12 m³ shuttle. Observed price for a two-bedroom: €1,200-1,700.

## Intercity routes
Paris-Lyon one-bedroom groupage €1,100-1,400; Paris-Marseille €1,300-1,700; Lyon-Toulouse two-bedroom €1,700-2,200.

## Three common traps
No survey on a large volume, "all-inclusive" prices that exclude floors and carrying, and a large deposit before anything is in writing.

**Enter both addresses with floor and access details on our quote page for a firm price and a delivery window.**`,
    },
  },
  {
    slug: "aides-au-demenagement-2026",
    tag: "Déménagement",
    image: "/images/blog/demenagement.jpg",
    publishedAt: "2026-08-27",
    keywords: [
      "aide au déménagement",
      "prime déménagement CAF",
      "aide déménagement Action Logement",
      "aide déménagement employeur",
    ],
    title: {
      fr: "Aides au déménagement 2026 : CAF, Action Logement, employeur — qui y a droit et combien",
      en: "Moving grants in 2026: who qualifies and how much",
    },
    excerpt: {
      fr: "Prime de déménagement CAF, aide Mobili-Pass, participation employeur, FSL : jusqu'à plusieurs centaines d'euros récupérables. Conditions, montants et pièces à fournir.",
      en: "Family allowance grants, Mobili-Pass, employer contributions: hundreds of euros to reclaim. Conditions, amounts and paperwork.",
    },
    faq: [
      {
        q: { fr: "Quel est le montant de la prime de déménagement CAF ?", en: "How much is the CAF moving grant?" },
        a: {
          fr: "Elle rembourse les frais réels dans la limite d'environ 1 100 € pour trois enfants, majorée par enfant supplémentaire, sur présentation de la facture.",
          en: "It refunds actual costs up to around €1,100 for three children, increased per additional child, against an invoice.",
        },
      },
      {
        q: { fr: "Faut-il une facture pour être remboursé ?", en: "Do I need an invoice to be reimbursed?" },
        a: {
          fr: "Oui, toujours : une facture nominative détaillée d'une entreprise inscrite au registre des transporteurs est exigée par tous les organismes.",
          en: "Yes, always: a detailed invoice from a registered transport company is required by every scheme.",
        },
      },
    ],
    body: {
      fr: `Un déménagement peut être partiellement remboursé. Le problème est que ces aides sont cumulables, mal connues, et surtout conditionnées à une facture en règle — ce qui exclut d'office le déménagement « au black ».

## La prime de déménagement de la CAF
**Pour qui** : les familles qui déménagent à l'occasion de la naissance ou de l'arrivée d'un 3ᵉ enfant (ou plus), et qui ont droit à l'APL ou à l'ALF dans le nouveau logement.

**Combien** : le remboursement des frais réellement engagés, plafonné autour de 1 100 € pour trois enfants, avec une majoration par enfant supplémentaire.

**Le point qui fait perdre l'aide** : la demande doit être déposée dans les six mois suivant le déménagement, facture à l'appui. Passé ce délai, c'est définitivement perdu.

## L'aide Mobili-Pass et le dispositif Action Logement
**Pour qui** : les salariés du secteur privé (entreprises de 10 salariés et plus, hors agricole) qui déménagent pour une mobilité professionnelle, avec un changement de logement lié à une embauche ou une mutation.

**Combien** : une subvention et/ou un prêt à taux réduit couvrant les frais d'installation, dont les frais de déménagement, selon la zone géographique.

**À savoir** : la demande se fait avant ou très peu après la prise de poste. Vérifiez aussi le dispositif Mobili-Jeune si vous êtes en alternance et avez moins de 30 ans.

## La participation de l'employeur
Une mutation à l'initiative de l'employeur ouvre très souvent droit à une prise en charge, totale ou partielle, prévue par la convention collective ou l'accord d'entreprise. C'est l'aide la plus rapide à obtenir et la moins réclamée. Demandez systématiquement les conditions aux ressources humaines avant de commander votre déménagement : certaines entreprises imposent leur propre procédure de devis.

## Le FSL et les aides locales
Le Fonds de solidarité pour le logement, géré par le département, peut prendre en charge tout ou partie des frais pour les ménages en difficulté. S'y ajoutent des aides communales ou régionales, les aides des caisses de retraite pour les seniors, celles de la MSA pour le régime agricole, et l'accompagnement social lié à un relogement.

## Les cas particuliers à connaître
- **Fonctionnaires** : indemnité de changement de résidence en cas de mutation
- **Militaires et personnels de sécurité** : dispositifs propres, souvent plus généreux
- **Étudiants boursiers** : aides ponctuelles des CROUS selon l'académie
- **Personnes en situation de handicap** : aides spécifiques via la MDPH pour l'adaptation du logement

## Le dénominateur commun : une facture conforme
Tous ces organismes exigent la même chose : une facture nominative, détaillée, émise par une entreprise identifiable et inscrite au registre des transporteurs, mentionnant les adresses de départ et d'arrivée, la date et la prestation. Un déménagement payé sans facture n'ouvre droit à aucune aide, et ne permet aucun recours en cas de dégât.

## Ce que nous fournissons systématiquement
Devis détaillé, facture nominative conforme, attestation de prestation avec adresses et date, inventaire signé. C'est exactement le dossier attendu par la CAF, Action Logement ou votre employeur — nous le transmettons sur simple demande.

**Faites votre devis en ligne dès maintenant : c'est la pièce que la plupart des organismes demandent avant même le déménagement.**`,
      en: `A move can be partly reimbursed. These grants stack, are poorly known, and all require a proper invoice — which rules out cash-in-hand moving.

## Family allowance moving grant (CAF)
For families moving around the birth or arrival of a third child who qualify for housing benefit in the new home. It refunds actual costs, capped around €1,100 for three children. The claim must be filed within six months, with the invoice.

## Mobili-Pass and Action Logement
For private-sector employees relocating for work: a grant and/or reduced-rate loan covering settling-in costs including moving. Apply before or shortly after starting the new role.

## Employer contribution
An employer-initiated transfer very often opens a full or partial contribution under the collective agreement. It is the fastest aid to obtain and the least claimed — ask HR before ordering your move.

## Local and social funds
The departmental housing solidarity fund can cover part of the cost for households in difficulty, alongside municipal and regional schemes and pension-fund support for seniors.

## Special cases
Civil servants (relocation allowance), military personnel, scholarship students, and people with disabilities through dedicated channels.

## The common requirement: a compliant invoice
Every scheme wants a named, detailed invoice from a registered transport company, showing both addresses, the date and the service.

## What we always provide
Detailed quote, compliant named invoice, service certificate with addresses and date, signed inventory — exactly the file these schemes ask for.

**Get your online quote now: it is the document most schemes request before the move itself.**`,
    },
  },
  {
    slug: "location-camion-ou-demenageur-le-vrai-calcul",
    tag: "Déménagement",
    image: "/images/demenagement.jpg",
    publishedAt: "2026-08-26",
    keywords: [
      "location camion déménagement",
      "louer un camion déménagement prix",
      "camion 20m3 location",
      "déménager seul ou avec déménageur",
    ],
    title: {
      fr: "Location de camion ou déménageur : le vrai calcul, coûts cachés compris",
      en: "Van rental or professional movers: the real calculation, hidden costs included",
    },
    excerpt: {
      fr: "Un camion 20 m³ à 90 € la journée, ça ressemble à une bonne affaire. Le calcul complet — carburant, péages, assurance, kilomètres, risques — dit souvent le contraire.",
      en: "A 20 m³ van at €90 a day looks like a bargain. The full calculation — fuel, tolls, insurance, mileage, risk — often says otherwise.",
    },
    faq: [
      {
        q: { fr: "Quel permis pour un camion de 20 m³ ?", en: "What licence for a 20 m³ van?" },
        a: {
          fr: "Le permis B suffit jusqu'à 3,5 tonnes de PTAC, ce qui couvre la plupart des 20 m³ de location — mais interdit la surcharge.",
          en: "A standard car licence covers up to 3.5 tonnes gross, which includes most rental 20 m³ vans — overloading is illegal.",
        },
      },
      {
        q: { fr: "La location est-elle moins chère qu'un déménageur ?", en: "Is renting cheaper than hiring movers?" },
        a: {
          fr: "En courte distance et petit volume, oui. Au-delà de 300 km ou de 25 m³, l'écart se réduit fortement, voire s'inverse en groupage.",
          en: "For short distances and small volumes, yes. Beyond 300 km or 25 m³ the gap shrinks and can reverse with groupage.",
        },
      },
    ],
    body: {
      fr: `L'annonce dit « camion 20 m³ à partir de 89 € la journée ». Ce n'est pas faux, c'est incomplet. Voici le calcul réel, sur deux scénarios.

## Scénario 1 : T2 (22 m³), même agglomération, 25 km
**En location** : 89 € de location + 45 € de carburant + 39 € d'assurance complémentaire + 25 € de couvertures et sangles + 60 € de cartons = **258 €**, plus une journée entière de votre temps et deux amis à nourrir. Le forfait kilométrique est souvent limité à 100 km inclus.

**Avec un déménageur en formule Économique** : environ 480 € HT, soit 576 € TTC, sans porter un seul carton.

**Verdict** : la location gagne clairement, si vous avez les bras et le temps.

## Scénario 2 : T3 (32 m³), Paris → Toulouse, 680 km
**En location** : 2 jours de location (180 €) + 260 € de carburant + 90 € de péages + 39 € d'assurance + un aller-retour à gérer (le camion doit revenir, ou l'aller simple est facturé 300 à 600 € de plus) + une nuit d'hôtel = **entre 900 et 1 400 €**, deux jours de conduite d'un véhicule que vous ne maîtrisez pas, avec un chargement dont vous êtes seul responsable.

**Avec un déménageur en groupage** : 1 700 à 2 200 € HT en camion dédié, mais **1 300 à 1 600 € HT en groupage** — assurance ad valorem incluse, sans conduite, sans manutention.

**Verdict** : l'écart devient faible, et il s'inverse dès qu'on valorise deux jours de congés.

## Les coûts que personne ne compte
- **La franchise d'assurance** : 800 à 2 500 € en cas de dégât sur le camion, même pour un rétroviseur arraché
- **Le carburant réel** : un 20 m³ chargé consomme 14 à 18 L/100 km
- **Les péages** en poids lourd léger, plus élevés qu'en voiture
- **Le hayon** : indispensable au-delà de 20 m³, souvent en option payante
- **Les dégâts sur le mobilier** : aucune indemnisation, c'est vous le transporteur
- **Le risque physique** : les accidents de manutention sont la première cause d'arrêt de travail dans le déménagement
- **Le retour du camion** : le vrai piège de la longue distance

## La règle simple à retenir
- Moins de 15 m³ et moins de 100 km : **louez**
- 15 à 25 m³ et moins de 300 km : **arbitrez** selon votre condition physique et le nombre d'aidants réels
- Plus de 25 m³ ou plus de 300 km : **passez par un professionnel**, en groupage si le budget est serré
- Étage sans ascenseur, objets lourds, meubles de valeur : **professionnel**, sans hésiter

## L'option intermédiaire que peu de gens connaissent
Vous pouvez déléguer uniquement la partie difficile : main-d'œuvre pour le chargement et le déchargement, ou transport seul quand vous emballez et portez vous-même. Nous facturons ces prestations séparément — c'est souvent le meilleur rapport prix/fatigue.

**Comparez vous-même : notre estimateur en ligne affiche un prix ferme en 2 minutes. Vous saurez immédiatement de quel côté penche votre calcul.**`,
      en: `The ad says "20 m³ van from €89 a day". That is not false, it is incomplete. Here is the real calculation across two scenarios.

## Scenario 1: 22 m³, same city, 25 km
Rental: €89 rental + €45 fuel + €39 extra insurance + €25 blankets and straps + €60 boxes = **€258**, plus a full day of your time and two friends. Mileage is often capped at 100 km.

Movers, Economy formula: around €480 excl. VAT without lifting a box. **Rental wins** if you have the time and the muscle.

## Scenario 2: 32 m³, Paris to Toulouse, 680 km
Rental: two days (€180) + €260 fuel + €90 tolls + €39 insurance + the return trip or a one-way fee of €300-600 + a hotel night = **€900-1,400**, two days driving an unfamiliar vehicle.

Movers: €1,700-2,200 dedicated, but **€1,300-1,600 with groupage**, insurance included. **The gap almost disappears.**

## Costs nobody counts
Insurance excess (€800-2,500), real fuel use (14-18 L/100 km loaded), heavy-vehicle tolls, tail-lift as a paid option, zero compensation for furniture damage, physical risk, and returning the van.

## Simple rule
Under 15 m³ and 100 km: rent. 15-25 m³ under 300 km: judge by your physical condition. Over 25 m³ or 300 km: use a professional, with groupage on a tight budget.

## The middle option
Delegate only the hard part: labour for loading and unloading, or transport only. We price these separately.

**Compare for yourself: our estimator gives a firm price in two minutes.**`,
    },
  },
  {
    slug: "combien-de-cartons-pour-un-demenagement",
    tag: "Déménagement",
    image: "/images/blog/emballage.jpg",
    publishedAt: "2026-08-25",
    keywords: [
      "carton de déménagement",
      "combien de cartons pour un déménagement",
      "acheter cartons déménagement",
      "cartons déménagement pas cher",
    ],
    title: {
      fr: "Combien de cartons pour un déménagement ? Le calcul exact par surface et par pièce",
      en: "How many boxes for a move? Exact counts by size and by room",
    },
    excerpt: {
      fr: "Trop peu de cartons et vous improvisez la veille ; trop et vous payez pour rien. Le compte précis par logement, les bons formats et la méthode d'emballage.",
      en: "Too few boxes and you improvise the night before; too many and you overpay. Precise counts, the right formats and the packing method.",
    },
    faq: [
      {
        q: { fr: "Combien de cartons pour un T3 ?", en: "How many boxes for a two-bedroom?" },
        a: {
          fr: "Comptez 45 à 60 cartons pour un T3 de 70 m², dont une dizaine de cartons livres et 4 à 6 penderies.",
          en: "Expect 45-60 boxes for a 70 m² two-bedroom, including about ten book boxes and 4-6 wardrobe boxes.",
        },
      },
      {
        q: { fr: "Quel poids maximum par carton ?", en: "What is the maximum weight per box?" },
        a: {
          fr: "20 kg pour un carton standard, 15 kg pour un carton livres : au-delà, le fond cède et le port devient dangereux.",
          en: "20 kg for a standard box, 15 kg for a book box: beyond that the bottom fails and carrying becomes unsafe.",
        },
      },
    ],
    body: {
      fr: `Manquer de cartons la veille du déménagement est le classique absolu. Voici comment obtenir le bon compte du premier coup.

## La règle de base
**1 m³ de mobilier = environ 17 cartons standards.** Autre approche, plus rapide : **1 carton par m² habitable**, ajusté selon votre niveau d'équipement (livres, vaisselle, matériel de sport, enfants).

## Le compte par logement
- **Studio 25 m²** : 15 à 25 cartons
- **T2 50 m²** : 30 à 40 cartons
- **T3 70 m²** : 45 à 60 cartons
- **T4 95 m²** : 60 à 80 cartons
- **Maison 130 m²** : 90 à 120 cartons

## Le compte par pièce
- **Cuisine** : 12 à 18 cartons, dont 6 à 8 pour la vaisselle seule (les plus lourds du déménagement)
- **Salon** : 10 à 15 cartons, plus les cartons livres
- **Chambre adulte** : 8 à 12 cartons, plus 2 à 3 penderies
- **Chambre enfant** : 8 à 14 cartons (les jouets prennent un volume considérable)
- **Salle de bain** : 3 à 5 cartons
- **Bureau** : 6 à 10 cartons, dont la moitié en cartons livres
- **Cave, garage, grenier** : 10 à 25 cartons — la pièce systématiquement sous-estimée

## Les quatre formats utiles, et pas plus
**Carton standard (55 × 35 × 30 cm, 0,06 m³)** : 70 % de vos besoins. Vêtements, linge, objets courants.

**Carton livres (35 × 27 × 30 cm)** : petit exprès, pour tout ce qui est dense. Livres, vaisselle, outils, bouteilles. Un carton standard rempli de livres est intransportable et cède.

**Carton penderie avec barre** : vêtements sur cintres, transférés en trois minutes sans repassage. 2 à 3 par adulte.

**Carton vaisselle à croisillons** : verres et assiettes debout, séparés. Il divise réellement le taux de casse.

## La méthode d'emballage qui évite les mauvaises surprises
1. **Les lourds en bas, les légers en haut**, dans le carton comme dans le camion.
2. **20 kg maximum** par carton standard, 15 kg pour un carton livres.
3. **Fermeture en H** : trois bandes d'adhésif large dessus et dessous.
4. **Étiquetage sur le côté**, pas sur le dessus : vous lirez l'étiquette une fois les cartons empilés. Indiquez la pièce de destination, pas la pièce d'origine.
5. **Un carton « première nuit »** clairement identifié : outils, chargeurs, papiers, draps, trousse de toilette, café. C'est celui qu'on charge en dernier et qu'on décharge en premier.
6. **Les liquides et produits d'entretien à part**, en bacs plastiques fermés.

## Combien ça coûte
Un carton neuf de qualité déménagement se situe entre 1,50 € et 3 € en grande surface, et coûte 4,50 € HT chez nous, livré à domicile avant le déménagement avec l'adhésif et le papier bulle. Les cartons de supermarché récupérés sont gratuits mais fragiles, souvent humides et de tailles incohérentes — c'est ce qui rend le chargement instable et allonge la durée d'intervention.

## Notre pack cartons livré chez vous
Nous livrons un pack dimensionné à votre logement (standards, livres, penderies, vaisselle, adhésif, papier bulle, marqueurs) sous 48 h en Île-de-France, et nous reprenons les cartons non utilisés. En formule Confort, l'emballage complet est réalisé par nos équipes : vous ne touchez pas un carton.

**Ajoutez l'option « Cartons » à votre devis en ligne pour recevoir le pack correspondant à votre surface, sans faire de calcul.**`,
      en: `Running out of boxes the night before is the absolute classic. Here is how to get the count right first time.

## Base rule
1 m³ of furniture equals around 17 standard boxes. Faster approach: one box per m² of living space, adjusted for books, crockery and children.

## Count by home size
Studio 25 m²: 15-25 boxes. One-bedroom 50 m²: 30-40. Two-bedroom 70 m²: 45-60. Three-bedroom 95 m²: 60-80. House 130 m²: 90-120.

## Count by room
Kitchen 12-18 (six to eight for crockery alone), living room 10-15, adult bedroom 8-12 plus 2-3 wardrobe boxes, child bedroom 8-14, bathroom 3-5, office 6-10, cellar and garage 10-25 — always underestimated.

## Four useful formats
Standard box (55 × 35 × 30 cm) for 70% of needs; book box, deliberately small for dense items; wardrobe box with a rail; dish box with dividers.

## Packing method
Heavy at the bottom, 20 kg maximum per box, H-pattern taping, label on the side with the destination room, one clearly marked "first night" box, and liquids kept separate in sealed crates.

## Cost
A new moving-grade box costs €1.50-3 in shops and €4.50 excl. VAT from us, delivered with tape and bubble wrap. Recovered supermarket boxes are free but weak, often damp and inconsistent, which makes loading unstable.

## Our box pack, delivered
We deliver a pack sized to your home within 48 hours in the Paris region and take back unused boxes. On the Comfort formula our teams do all the packing.

**Add the "Boxes" option to your online quote to get the pack matching your home.**`,
    },
  },
  {
    slug: "checklist-demenagement-8-semaines",
    tag: "Déménagement",
    image: "/images/demenagement-2.jpg",
    publishedAt: "2026-08-24",
    keywords: [
      "checklist déménagement",
      "démarches déménagement",
      "changement adresse déménagement",
      "préparer son déménagement",
    ],
    title: {
      fr: "Checklist déménagement : le rétroplanning en 8 semaines et les démarches à ne pas manquer",
      en: "Moving checklist: an 8-week countdown and the paperwork you cannot miss",
    },
    excerpt: {
      fr: "Résiliations, préavis, changement d'adresse, école, énergie : le calendrier semaine par semaine pour arriver au jour J sans stress ni pénalité.",
      en: "Notices, address changes, schools, utilities: a week-by-week calendar to reach moving day without stress or penalties.",
    },
    faq: [
      {
        q: { fr: "Quand prévenir son propriétaire ?", en: "When must I notify my landlord?" },
        a: {
          fr: "Trois mois avant en location vide, un mois en location meublée ou en zone tendue, par lettre recommandée ou acte d'huissier.",
          en: "Three months ahead for an unfurnished rental, one month for furnished or tight housing zones, by registered letter.",
        },
      },
      {
        q: { fr: "Combien de temps avant réserver un déménageur ?", en: "How far ahead should I book movers?" },
        a: {
          fr: "Quatre à six semaines en période normale, huit à dix semaines pour un déménagement entre juin et septembre.",
          en: "Four to six weeks normally, eight to ten weeks for a move between June and September.",
        },
      },
    ],
    body: {
      fr: `Un déménagement raté est presque toujours un déménagement mal daté. Voici le rétroplanning que nous donnons à nos clients.

## 8 semaines avant
- Donner son préavis au propriétaire : **3 mois** en location vide, **1 mois** en meublé ou en zone tendue, par lettre recommandée avec accusé de réception
- Faire estimer son volume et demander 2 à 3 devis de déménagement
- Poser ses jours de congés
- Si vous avez des enfants : demander le certificat de radiation et l'inscription dans la nouvelle école
- Vérifier vos droits aux aides (CAF, Action Logement, employeur) — les dossiers se montent en amont

## 6 semaines avant
- **Réserver le déménageur** (8 à 10 semaines si vous déménagez entre juin et septembre)
- Commander les cartons et le matériel d'emballage
- Commencer le tri : vendre, donner, jeter. Chaque m³ éliminé est un m³ non facturé
- Prévoir la déchetterie ou un enlèvement d'encombrants pour les gros volumes

## 4 semaines avant
- Résilier ou transférer : électricité, gaz, eau, internet, assurance habitation
- Souscrire les contrats du nouveau logement avec une date d'effet la veille de l'arrivée
- Faire le changement d'adresse en ligne (service public unique : impôts, sécurité sociale, CAF, Pôle emploi, retraite)
- Demander l'autorisation de stationnement en mairie pour les deux adresses si nécessaire
- Prévenir banque, employeur, mutuelle, écoles, médecins, abonnements

## 2 semaines avant
- Emballer les pièces non essentielles : cave, garage, bibliothèque, décoration, hors-saison
- Faire réviser ou vidanger l'électroménager (lave-linge, congélateur à dégivrer 48 h avant)
- Confirmer l'accès avec le déménageur : étages, ascenseur, largeur de rue, distance de portage, monte-meuble
- Prévoir la garde des enfants et des animaux pour le jour J
- Faire le point sur les objets de valeur : ils doivent figurer sur la déclaration de valeur

## 1 semaine avant
- Terminer les cartons, sauf l'essentiel du quotidien
- Préparer le carton « première nuit »
- Relever les compteurs de l'ancien logement, photos à l'appui
- Rassembler papiers, clés, bijoux, ordinateurs : ils voyagent avec vous, jamais dans le camion
- Faire une dernière vérification du chemin d'accès : travaux, marché, stationnement

## Le jour J
- Être présent au chargement et **signer l'inventaire** après vérification
- Faire l'état des lieux de sortie, compteurs relevés
- Garder sur soi : téléphone, chargeur, papiers d'identité, moyens de paiement, contrat de déménagement
- À l'arrivée, **vérifier chaque colis avant de signer la lettre de voiture**

## Après
- Émettre des réserves écrites **dans les 3 jours** en cas d'avarie constatée : ce délai est impératif pour être indemnisé
- Transférer le courrier (réexpédition postale)
- Mettre à jour la carte grise : obligatoire **sous 1 mois**
- Envoyer votre facture de déménagement aux organismes d'aide
- Souscrire ou activer l'assurance habitation du nouveau logement dès le premier jour

## Le point que 80 % des gens ratent
Les réserves à la livraison. Signer une lettre de voiture « sans réserve » puis découvrir un meuble rayé le lendemain complique fortement l'indemnisation. Prenez dix minutes, ouvrez les cartons sensibles, notez tout par écrit sur le document, même un doute.

**Vous voulez ce rétroplanning appliqué à votre date réelle ? Faites votre devis en ligne : nous fixons ensemble la date d'enlèvement et les échéances, et nous gérons les autorisations de stationnement.**`,
      en: `A failed move is almost always a badly scheduled move. Here is the countdown we give our customers.

## 8 weeks out
Give notice to your landlord (three months unfurnished, one month furnished or in tight zones, by registered letter), get your volume estimated, request 2-3 quotes, book time off, handle school transfers and check grant eligibility.

## 6 weeks out
Book the movers (8-10 weeks for June-September), order boxes, start decluttering — every m³ removed is a m³ not invoiced.

## 4 weeks out
Cancel or transfer electricity, gas, water, internet and home insurance; register the new contracts from the day before arrival; file the online change of address; request parking permits; notify bank, employer and schools.

## 2 weeks out
Pack non-essential rooms, service appliances, confirm access details with the movers, arrange childcare and pet care, list valuables for the declaration of value.

## 1 week out
Finish the boxes, prepare the "first night" box, photograph meter readings, and keep papers, keys, jewellery and laptops with you — never in the van.

## Moving day
Be present at loading and sign the inventory after checking it, complete the exit condition report, and check every item before signing the delivery note.

## Afterwards
File written reservations within three days if anything is damaged, redirect post, update your vehicle registration within a month, and send the invoice to any grant scheme.

## What 80% of people get wrong
Delivery reservations. Signing "no reservations" and finding a scratched cabinet the next day makes compensation far harder.

**Want this countdown applied to your real date? Get your quote online — we set the pickup date and handle parking permits.**`,
    },
  },
];
