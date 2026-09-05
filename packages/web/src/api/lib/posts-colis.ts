/**
 * Articles SEO — intention « envoi de colis » (prix, poids, gros colis, international,
 * suivi, point relais, poids volumétrique). Chaque article cible une requête tapée en France.
 */

import type { Post } from "./posts";

export const POSTS_COLIS: Post[] = [
  {
    slug: "envoyer-un-colis-pas-cher-en-france",
    tag: "Envoi de colis",
    image: "/images/livraison.jpg",
    publishedAt: "2026-08-31",
    keywords: [
      "envoyer un colis pas cher",
      "envoi colis pas cher",
      "comparateur envoi colis",
      "tarif envoi colis France",
    ],
    title: {
      fr: "Envoyer un colis pas cher en France : le comparatif honnête 2026 (et quand nous sommes moins chers)",
      en: "Sending a parcel cheaply in France: the honest 2026 comparison",
    },
    excerpt: {
      fr: "Colissimo, Mondial Relay, Chronopost, transporteur direct : qui est réellement le moins cher selon le poids, le format et la destination. Avec nos propres tarifs, sans marketing.",
      en: "Colissimo, Mondial Relay, Chronopost or a direct carrier: who is genuinely cheapest by weight, size and destination — including our own rates.",
    },
    faq: [
      {
        q: { fr: "Quel est le moyen le moins cher d'envoyer un colis ?", en: "What is the cheapest way to send a parcel?" },
        a: {
          fr: "Sous 5 kg et sans urgence, le point relais reste le moins cher. Au-delà de 20 kg ou hors format, un transporteur direct comme nous devient plus économique.",
          en: "Under 5 kg without urgency, relay points stay cheapest. Above 20 kg or oversized, a direct carrier becomes cheaper.",
        },
      },
      {
        q: { fr: "Le prix dépend-il du poids ou de la taille ?", en: "Does price depend on weight or size?" },
        a: {
          fr: "Des deux : les transporteurs retiennent le poids taxable, c'est-à-dire le plus élevé entre le poids réel et le poids volumétrique (L×l×H/5000).",
          en: "Both: carriers use chargeable weight, the higher of actual weight and volumetric weight (L×W×H/5000).",
        },
      },
    ],
    body: {
      fr: `Il n'existe pas un transporteur « le moins cher », il existe un transporteur le moins cher **pour votre colis**. Le prix se joue sur quatre variables : le poids taxable, le format, le délai et le mode de remise. Voici comment arbitrer, sans discours commercial.

## D'abord, calculez votre poids taxable
C'est l'erreur numéro un : comparer des prix « jusqu'à 10 kg » alors que votre colis sera facturé sur son volume. La formule utilisée par toute la profession est **L × l × H (en cm) ÷ 5000**. Un carton de 60 × 40 × 40 cm ne pèse que 4 kg sur la balance mais compte pour **19,2 kg** au tarif. Comparez toujours à poids taxable identique.

## Le comparatif par tranche (France métropolitaine, 2026)
**Colis de 0 à 2 kg, petit format, non urgent**
Le point relais est imbattable, entre 4 et 6 €. Aucun transporteur direct ne peut aligner ce prix sur un envoi isolé, nous compris. Utilisez-le.

**Colis de 2 à 10 kg, format standard**
Point relais : 7 à 14 €. Livraison à domicile : 12 à 22 €. Notre tarif direct : **16,90 € HT de base + 1,10 €/kg** en France métropolitaine, soit environ 20 € HT pour 3 kg — compétitif dès que vous voulez un enlèvement à domicile et une prise en charge nominative plutôt qu'un dépôt en boutique.

**Colis de 10 à 30 kg**
C'est le point de bascule. Les réseaux grand public appliquent des surtaxes fortes ou refusent tout simplement au-delà de 20 à 30 kg. Nous restons sur la même logique linéaire : base + prix au kilo, sans pénalité de format tant que le colis reste manipulable par une personne.

**Plus de 30 kg, palette, meuble, colis hors gabarit**
Le grand public n'est plus dans la course. C'est du transport de fret : palette Europe de 65 à 240 € HT selon la destination, avec hayon et rendez-vous de livraison.

**Île-de-France, en local**
Notre base est de **14,50 € HT + 0,85 €/kg**, avec enlèvement le jour même sur les créneaux disponibles. Sur un trajet intra-francilien urgent, c'est structurellement plus rapide et souvent moins cher qu'un express national.

## Les six frais cachés qui changent le classement
1. **La surtaxe hors format** : longueur, périmètre, poids unitaire — c'est là que les prix d'appel s'écroulent
2. **La contribution carburant**, indexée (14,2 % en 2026 chez nous, affichée séparément)
3. **La zone difficile d'accès**, y compris certaines communes rurales
4. **La seconde présentation** en cas d'absence du destinataire
5. **L'assurance réelle** : l'indemnisation par défaut est forfaitaire et souvent dérisoire face à la valeur du contenu
6. **Le retour d'un colis non retiré**, facturé sur beaucoup de réseaux

## Nos trois règles honnêtes
- **Petit et non urgent** : allez au point relais, vous paierez moins.
- **Lourd, volumineux, fragile ou de valeur** : passez par un transporteur direct, vous paierez moins **et** vous serez couvert.
- **Régulier** : négociez un contrat. À partir de 20 envois par mois, un tarif dégressif change complètement l'équation.

## Comment économiser sans changer de transporteur
- Réduisez le volume : un carton ajusté au contenu vaut mieux qu'un grand carton à moitié vide
- Regroupez plusieurs envois pour le même destinataire en un seul colis
- Acceptez un délai standard plutôt qu'express : l'écart est de 30 à 40 %
- Déclarez la valeur exacte : sur-assurer coûte, sous-assurer ruine en cas de litige
- Préparez une étiquette lisible et une étiquette de secours à l'intérieur

## Notre proposition
Prix immédiat en ligne à partir du poids et des dimensions, enlèvement à domicile ou en entreprise, suivi en ligne à chaque étape, assurance ad valorem à 0,7 % de la valeur déclarée (minimum 8 € HT), et un interlocuteur humain au 06 95 09 86 88 quand quelque chose bloque — ce que les réseaux automatisés ne proposent plus.

**Calculez votre prix réel en 30 secondes sur notre page devis : poids, dimensions, destination. Vous verrez immédiatement si nous sommes le bon choix pour votre colis.**`,
      en: `There is no single cheapest carrier — only the cheapest carrier **for your parcel**. Price depends on chargeable weight, size, deadline and drop-off method.

## First, calculate chargeable weight
The industry formula is L × W × H (cm) ÷ 5000. A 60 × 40 × 40 cm box weighing 4 kg counts as 19.2 kg. Always compare at equal chargeable weight.

## Comparison by bracket (mainland France, 2026)
**0-2 kg, small, not urgent:** relay points are unbeatable at €4-6. Use them.

**2-10 kg:** relay €7-14, home delivery €12-22. Our direct rate: €16.90 excl. VAT base + €1.10/kg — competitive as soon as you want a home pickup.

**10-30 kg:** the tipping point. Consumer networks add heavy surcharges or refuse above 20-30 kg; our pricing stays linear.

**Over 30 kg, pallets, furniture:** this is freight — Euro pallets from €65 to €240 excl. VAT with tail-lift delivery.

**Paris region local:** €14.50 base + €0.85/kg with same-day pickup on available slots.

## Six hidden fees that change the ranking
Oversize surcharges, indexed fuel contribution, hard-to-access areas, second delivery attempts, real insurance cover, and return fees for uncollected parcels.

## Three honest rules
Small and not urgent: use a relay point. Heavy, bulky, fragile or valuable: use a direct carrier. Regular shipper: negotiate a contract above 20 parcels a month.

## Saving without switching carrier
Cut the volume, group shipments, accept standard instead of express (30-40% cheaper), declare the exact value, and add a backup label inside.

**Calculate your real price in 30 seconds on our quote page.**`,
    },
  },
  {
    slug: "prix-envoi-colis-10-kg",
    tag: "Envoi de colis",
    image: "/images/livraison-2.jpg",
    publishedAt: "2026-08-30",
    keywords: [
      "quel est le moins cher pour envoyer un colis de 10kg",
      "tarif envoi colis 10 kg",
      "envoyer colis 10 kg pas cher",
      "prix colis 20 kg",
    ],
    title: {
      fr: "Quel est le moins cher pour envoyer un colis de 10 kg ? Le calcul complet, cas par cas",
      en: "What is the cheapest way to send a 10 kg parcel? The full calculation",
    },
    excerpt: {
      fr: "10 kg est exactement la tranche où les prix divergent le plus. Comparatif chiffré selon le format, la destination et l'urgence, avec le calcul du poids taxable.",
      en: "10 kg is exactly where prices diverge most. A costed comparison by size, destination and urgency.",
    },
    faq: [
      {
        q: { fr: "Combien coûte l'envoi d'un colis de 10 kg en France ?", en: "How much to send a 10 kg parcel in France?" },
        a: {
          fr: "Entre 14 et 25 € en point relais, 20 à 35 € à domicile, et environ 27,90 € HT chez nous avec enlèvement inclus en France métropolitaine.",
          en: "€14-25 via relay points, €20-35 to the door, and around €27.90 excl. VAT with us including pickup in mainland France.",
        },
      },
      {
        q: { fr: "Un colis de 10 kg peut-il être refusé ?", en: "Can a 10 kg parcel be refused?" },
        a: {
          fr: "Oui si une dimension dépasse les limites du réseau : c'est le format, pas le poids, qui provoque la plupart des refus.",
          en: "Yes, if one dimension exceeds network limits: size, not weight, causes most refusals.",
        },
      },
    ],
    body: {
      fr: `Dix kilos, c'est le poids d'un carton de livres, d'un petit électroménager ou d'un colis de vêtements bien rempli. C'est aussi la tranche où les écarts de prix atteignent 300 % entre deux solutions. Voici le calcul complet.

## Étape 1 : votre colis pèse-t-il vraiment 10 kg pour le transporteur ?
Le tarif se calcule sur le **poids taxable** : le plus élevé entre le poids réel et le poids volumétrique, soit L × l × H ÷ 5000.

- Carton 40 × 30 × 30 cm, 10 kg réels → volumétrique 7,2 kg → **taxable 10 kg**
- Carton 60 × 40 × 40 cm, 10 kg réels → volumétrique 19,2 kg → **taxable 19,2 kg**

Même contenu, même balance, presque le double de facture. Avant de comparer quoi que ce soit, mesurez votre carton.

## Étape 2 : le comparatif à 10 kg taxables, France métropolitaine
- **Point relais, dépôt et retrait en boutique, 3 à 5 jours** : 14 à 25 €. Le moins cher, si le format passe et si le destinataire peut se déplacer.
- **Livraison à domicile standard, réseau grand public** : 20 à 35 €.
- **Express 24 h** : 35 à 60 €.
- **Notre tarif direct France** : 16,90 € HT + 1,10 €/kg = **27,90 € HT**, enlèvement à l'adresse inclus, suivi et assurance disponibles.
- **Notre tarif Île-de-France** : 14,50 € HT + 0,85 €/kg = **23 € HT**, avec créneau d'enlèvement le jour même selon disponibilité.

## Étape 3 : le vrai arbitrage, ce n'est pas 5 € d'écart
Sur un colis à 10 kg, la différence entre le moins cher et le plus cher tourne autour de 15 à 25 €. Ce qui coûte réellement de l'argent, ce sont les incidents :

- Un colis **refusé au dépôt** pour dépassement de format : vous refaites l'emballage et vous perdez la journée
- Un colis **non retiré** en point relais dans les 10 jours : retour facturé, contenu bloqué deux semaines
- Un colis **endommagé** avec indemnisation forfaitaire à 23 €/kg alors que le contenu valait 400 €
- Une **seconde présentation** facturée parce que personne n'était là

C'est exactement ce que couvre un envoi direct avec enlèvement sur rendez-vous et assurance ad valorem.

## Étape 4 : international, à 10 kg
- **Europe** : 24,00 € HT + 2,10 €/kg = **45 € HT**
- **Cotonou, Lomé, Bamako** : 65,00 € HT + 7,50 €/kg = **140 € HT**

À ces montants s'ajoutent, hors Union européenne, les droits et taxes du pays de destination, qui dépendent de la valeur déclarée et de la nature du contenu — jamais du transporteur. Une facture commerciale et un contenu correctement décrit accélèrent le passage en douane.

## La règle de décision, en trois lignes
- **Colis compact, destinataire mobile, aucune urgence** → point relais
- **Colis volumineux, fragile, de valeur, ou expéditeur qui ne peut pas se déplacer** → transporteur direct
- **Plus de 20 kg ou une dimension supérieure à 120 cm** → transporteur direct, c'est souvent la seule option acceptée

## Notre proposition sur cette tranche
Prix ferme affiché avant commande à partir du poids et des dimensions réels, enlèvement à domicile ou en entreprise, suivi en ligne, assurance à 0,7 % de la valeur déclarée, et un numéro qui répond : 06 95 09 86 88.

**Entrez vos dimensions exactes sur notre page devis : vous obtenez le poids taxable et le prix réel, sans surprise au dépôt.**`,
      en: `Ten kilos is a box of books, a small appliance or a full box of clothes. It is also the bracket where price gaps reach 300%.

## Step 1: does your parcel really weigh 10 kg for the carrier?
Chargeable weight is the higher of actual and volumetric weight (L × W × H ÷ 5000). A 40 × 30 × 30 cm box at 10 kg stays 10 kg; a 60 × 40 × 40 cm box at 10 kg counts as 19.2 kg.

## Step 2: comparison at 10 kg chargeable, mainland France
Relay point (3-5 days): €14-25. Standard home delivery: €20-35. Express 24 h: €35-60. Our direct rate: €16.90 + €1.10/kg = **€27.90 excl. VAT** with pickup included. Paris region: €14.50 + €0.85/kg = **€23**.

## Step 3: the real trade-off is not €5
Incidents cost far more: a parcel refused for oversize, an uncollected parcel returned at your expense, damage compensated at a flat rate while the contents were worth €400, or a charged second delivery attempt.

## Step 4: international at 10 kg
Europe: €24 + €2.10/kg = €45. Cotonou, Lomé and Bamako: €65 + €7.50/kg = €140. Outside the EU, destination duties and taxes apply on declared value.

## Decision rule
Compact and not urgent: relay point. Bulky, fragile or valuable: direct carrier. Over 20 kg or any side above 120 cm: direct carrier is often the only option.

**Enter your exact dimensions on our quote page to get chargeable weight and the real price.**`,
    },
  },
  {
    slug: "envoyer-un-gros-colis-hors-format",
    tag: "Envoi de colis",
    image: "/images/palette.jpg",
    publishedAt: "2026-08-29",
    keywords: [
      "envoyer gros colis",
      "envoi colis hors format",
      "envoyer un colis de 30 kg",
      "envoyer un meuble",
      "envoi palette prix",
    ],
    title: {
      fr: "Envoyer un gros colis, un meuble ou une palette : la solution quand les réseaux classiques refusent",
      en: "Sending a large parcel, furniture or a pallet when standard networks refuse",
    },
    excerpt: {
      fr: "Au-delà de 30 kg ou de 120 cm, les réseaux grand public bloquent. Voici comment expédier un meuble, un vélo, un électroménager ou une palette, et à quel prix.",
      en: "Above 30 kg or 120 cm, consumer networks stop. How to ship furniture, bikes, appliances or a pallet — and at what price.",
    },
    faq: [
      {
        q: { fr: "Quel est le poids maximum d'un colis ?", en: "What is the maximum parcel weight?" },
        a: {
          fr: "Les réseaux grand public s'arrêtent souvent à 30 kg et 120 cm ; en transport direct, nous prenons jusqu'à la palette complète avec hayon.",
          en: "Consumer networks usually stop at 30 kg and 120 cm; as a direct carrier we handle up to a full pallet with tail-lift.",
        },
      },
      {
        q: { fr: "Comment expédier un meuble en toute sécurité ?", en: "How do I ship furniture safely?" },
        a: {
          fr: "Démontage si possible, angles protégés, film et couverture, palettisation pour les pièces lourdes, et assurance ad valorem sur la valeur réelle.",
          en: "Dismantle if possible, protect corners, wrap and blanket, palletise heavy pieces, and insure on real value.",
        },
      },
    ],
    body: {
      fr: `« Colis refusé : dimensions non conformes. » Si vous lisez ce message, votre envoi n'est plus un colis au sens des réseaux automatisés — c'est du transport, et cela se traite autrement.

## Les limites où les réseaux grand public s'arrêtent
En pratique : au-delà de **30 kg**, au-delà de **120 cm** sur le plus grand côté, ou au-delà d'un certain périmètre (2 × largeur + 2 × hauteur + longueur), le colis sort du convoyeur automatique. Il est alors refusé, surtaxé lourdement, ou accepté puis abîmé parce qu'il n'était pas conçu pour ce circuit.

Concrètement, ce sont : les meubles, les matelas, les vélos, l'électroménager, les portes et plans de travail, les machines-outils, les palettes de marchandises, les cartons de déménagement partiels.

## Nos quatre solutions selon le gabarit
**1. Colis lourd manipulable (30 à 70 kg)**
Enlèvement à l'adresse, transport en messagerie palettisée ou véhicule dédié selon l'axe. Tarification linéaire : base zone + prix au kilo, sans pénalité de format.

**2. Meuble ou objet volumineux non palettisable**
Protection sur place (film, couverture, angles carton), transport en véhicule avec sangles, livraison sur rendez-vous. C'est le mode adapté au canapé, au buffet ancien, au miroir grand format.

**3. Palette Europe (80 × 120 cm)**
De **65 € HT** en Europe proche à **240 € HT** selon la destination et le poids, hayon disponible au chargement comme à la livraison. C'est la solution la plus économique dès que vous avez plusieurs cartons ou plus de 100 kg : une palette coûte moins cher que dix colis lourds.

**4. Groupage de mobilier**
Votre lot voyage avec d'autres sur le même axe : c'est la formule la moins chère pour un meuble hérité, un achat en ligne à récupérer, ou un envoi vers un autre département sans urgence.

## Comment préparer un gros colis pour qu'il arrive intact
- **Démontez** ce qui se démonte : un meuble démonté et filmé se casse beaucoup moins
- **Protégez les angles** en priorité : c'est là que 80 % des dégâts arrivent
- **Palettisez** dès que le poids dépasse 50 kg : le colis devient manipulable au transpalette et cesse d'être porté à la main
- **Filmez** l'ensemble, puis cerclez : le film seul ne tient pas un chargement
- **Ne dépassez jamais du périmètre de la palette** : tout débord est le premier point d'impact
- **Photographiez** l'objet emballé avant l'enlèvement : c'est votre preuve en cas de litige
- **Déclarez la valeur réelle** : l'indemnisation légale au poids ne couvre jamais un meuble de valeur

## Le point que les particuliers découvrent trop tard
La livraison d'un gros colis n'est pas une livraison de colis. Il faut prévoir : qui réceptionne, avec quel accès, à quel étage, et si un hayon ou deux personnes sont nécessaires. Une livraison au 3ᵉ étage sans ascenseur pour un buffet de 90 kg, ça se planifie — pas ça s'improvise le matin même. Nous validons ce point avant l'enlèvement, systématiquement.

## Notre proposition
Nous prenons ce que les réseaux refusent : colis lourds, meubles, palettes, envois hors format, en Île-de-France, en Europe et vers Cotonou, Lomé et Bamako. Enlèvement à l'adresse, protection réalisée par nos équipes si vous le souhaitez, hayon, livraison sur rendez-vous, suivi en ligne et assurance ad valorem.

**Décrivez votre objet sur notre page devis (dimensions, poids, étage, accès) ou appelez le 06 95 09 86 88 : nous vous dirons immédiatement si c'est un colis, une palette ou un transport dédié — et à quel prix.**`,
      en: `"Parcel refused: non-compliant dimensions." If you get that message, your shipment is no longer a parcel for automated networks — it is freight.

## Where consumer networks stop
In practice: above 30 kg, above 120 cm on the longest side, or beyond a set girth, the parcel leaves the automated conveyor. It gets refused, heavily surcharged, or accepted and then damaged.

That means furniture, mattresses, bikes, appliances, doors and worktops, machine tools and pallets.

## Four solutions by size
**Heavy handleable parcel (30-70 kg):** pickup at your address, palletised freight or dedicated vehicle, linear pricing with no size penalty.

**Bulky non-palletisable item:** on-site protection, strapped transport, delivery by appointment.

**Euro pallet (80 × 120 cm):** from €65 to €240 excl. VAT with tail-lift. Cheaper than ten heavy parcels above 100 kg.

**Furniture groupage:** your lot travels with others on the same route — the cheapest option without urgency.

## Preparing a large shipment
Dismantle what you can, protect the corners first, palletise above 50 kg, wrap then strap, never overhang the pallet, photograph the packed item, and declare the real value.

## What private senders discover too late
Delivering a large item is not delivering a parcel: who receives it, which access, which floor, tail-lift or two people. We validate this before pickup, every time.

**Describe your item on our quote page or call +33 6 95 09 86 88 — we will tell you immediately whether it is a parcel, a pallet or a dedicated transport.**`,
    },
  },
  {
    slug: "envoi-colis-international-europe-maghreb-afrique",
    tag: "International",
    image: "/images/blog/afrique.jpg",
    publishedAt: "2026-08-28",
    keywords: [
      "envoi colis international",
      "envoyer un colis en Afrique",
      "envoi colis Bénin Togo Mali",
      "tarif colis international",
      "envoi colis particulier international",
    ],
    title: {
      fr: "Envoi de colis international : Europe, Bénin, Togo, Mali — prix, douane et délais réels",
      en: "International parcels: Europe, Benin, Togo, Mali — prices, customs and real transit times",
    },
    excerpt: {
      fr: "Tarifs au kilo par zone, documents douaniers, contenus interdits et délais constatés. Tout ce qu'il faut savoir avant d'expédier hors de France.",
      en: "Per-kilo rates by zone, customs documents, prohibited contents and observed transit times before shipping abroad.",
    },
    faq: [
      {
        q: { fr: "Faut-il payer des droits de douane ?", en: "Do I have to pay customs duties?" },
        a: {
          fr: "Non dans l'Union européenne. Hors UE, les droits et taxes dépendent de la valeur déclarée et du type de contenu, et sont dus dans le pays de destination.",
          en: "No within the EU. Outside the EU, duties depend on declared value and content type and are payable in the destination country.",
        },
      },
      {
        q: { fr: "Quels documents pour un colis hors UE ?", en: "Which documents outside the EU?" },
        a: {
          fr: "Une facture commerciale ou proforma, la déclaration douanière CN23 et une description précise du contenu avec sa valeur réelle.",
          en: "A commercial or proforma invoice, the CN23 customs declaration and a precise content description with real values.",
        },
      },
    ],
    body: {
      fr: `Un colis international bloqué, c'est presque toujours un problème de papier, pas de transport. Voici les prix réels, les documents exigés et les délais constatés par zone.

## Nos tarifs par zone (base + prix au kilo, HT)
- **Europe** : 24,00 € + 2,10 €/kg
- **Cotonou (Bénin), Lomé (Togo), Bamako (Mali)** : 65,00 € + 7,50 €/kg

Exemples : 5 kg vers l'Espagne ≈ 34,50 € HT ; 20 kg vers Cotonou ≈ 215 € HT. Le poids retenu est toujours le poids taxable, c'est-à-dire le plus élevé entre le poids réel et **L × l × H ÷ 5000**.

## Les délais constatés
- **Europe de l'Ouest** : 3 à 6 jours ouvrés
- **Europe de l'Est et du Nord** : 5 à 9 jours ouvrés
- **Cotonou, Lomé, Bamako en aérien** : 5 à 10 jours, dédouanement inclus
- **Cotonou, Lomé, Bamako en maritime groupé** : 30 à 45 jours, mais un coût au kilo divisé par trois sur les gros volumes

Ce sont des délais cibles constatés, jamais des délais garantis.

Ces délais démarrent à l'enlèvement, pas à la commande, et n'incluent pas les immobilisations douanières liées à un dossier incomplet.

## Les documents, dans l'ordre
1. **Facture commerciale ou proforma** en trois exemplaires, avec valeur unitaire réelle
2. **Déclaration douanière CN23** avec description précise : « 4 chemises coton homme », pas « vêtements »
3. **Identité de l'expéditeur et du destinataire**, avec un numéro de téléphone local valide — c'est ce qui manque le plus souvent et bloque la livraison
4. **Numéro fiscal du destinataire** exigé par certains pays pour les envois commerciaux
5. **Certificats spécifiques** selon la nature : alimentaire, cosmétique, électronique, médicament

## La règle d'or de la valeur déclarée
Sous-déclarer pour réduire les droits est la fausse bonne idée classique : en cas de contrôle, le colis est immobilisé, réévalué d'office, et l'indemnisation en cas de perte se limite à la valeur que vous avez déclarée. Déclarez la valeur réelle, assurez, et vous dormez tranquille.

## Ce qui est interdit ou strictement encadré
Batteries lithium seules, aérosols, parfums et alcools au-delà de certains seuils, produits inflammables, denrées périssables, espèces et bijoux, médicaments sans ordonnance, contrefaçons. Chaque pays ajoute ses propres restrictions : nous les vérifions avant l'enlèvement plutôt que de vous laisser découvrir un blocage en douane.

## Le cas particulier des envois vers l'Afrique
C'est notre spécialité. Les problèmes récurrents sont toujours les mêmes : adresse imprécise (indiquez un quartier et un point de repère, pas seulement une rue), téléphone local injoignable, contenu mal décrit, et emballage inadapté à plusieurs transbordements. Nous imposons donc un double emballage sur les envois fragiles, un contact local vérifié, et un suivi jusqu'à la remise.

## Notre proposition
Enlèvement en France, préparation documentaire vérifiée avant départ, choix aérien ou maritime groupé selon votre budget, suivi en ligne à chaque étape, assurance ad valorem à 0,7 % de la valeur déclarée, et un interlocuteur qui parle à votre destinataire si nécessaire.

**Indiquez votre destination, le poids et les dimensions sur notre page devis pour un prix immédiat, ou appelez le 06 95 09 86 88 pour valider vos documents avant l'expédition.**`,
      en: `A blocked international parcel is almost always a paperwork problem, not a transport problem.

## Our rates by zone (base + per kilo, excl. VAT)
Europe €24 + €2.10/kg; Cotonou, Lomé and Bamako €65 + €7.50/kg. Chargeable weight is the higher of actual weight and L × W × H ÷ 5000.

## Observed transit times
Western Europe 3-6 working days; Eastern and Northern Europe 5-9; Cotonou, Lomé and Bamako 5-10 days by air including clearance, 30-45 days by grouped sea freight at a third of the per-kilo cost. These are target lead times, not guarantees.

## Documents, in order
Commercial or proforma invoice in triplicate, CN23 customs declaration with a precise description, sender and recipient identity with a valid local phone number, recipient tax number where required, and product-specific certificates.

## The golden rule on declared value
Under-declaring is the classic false economy: parcels get held and reassessed, and compensation is capped at the value you declared.

## Prohibited or restricted
Loose lithium batteries, aerosols, perfumes and alcohol above thresholds, flammables, perishables, cash and jewellery, medicines without prescription, counterfeits.

## Shipping to Africa
Our speciality. Recurring issues: imprecise addresses, unreachable local phone numbers, poorly described contents and packaging unfit for multiple transfers. We require double packaging on fragile shipments and a verified local contact.

**Enter destination, weight and dimensions on our quote page, or call +33 6 95 09 86 88 to validate your documents before shipping.**`,
    },
  },
  {
    slug: "suivre-un-colis-comprendre-les-statuts",
    tag: "Livraison",
    image: "/images/blog/delais.jpg",
    publishedAt: "2026-08-27",
    keywords: [
      "suivre un colis",
      "suivi colis",
      "colis bloqué en transit",
      "colis en cours de livraison depuis 3 jours",
    ],
    title: {
      fr: "Suivre un colis : comprendre chaque statut et débloquer une livraison qui n'avance plus",
      en: "Parcel tracking: understanding each status and unblocking a stalled delivery",
    },
    excerpt: {
      fr: "« En transit » depuis quatre jours, « en cours de livraison » sans livreur : ce que chaque statut signifie réellement, quand s'inquiéter et quoi faire, étape par étape.",
      en: "\"In transit\" for four days, \"out for delivery\" with no driver: what each status really means and what to do.",
    },
    faq: [
      {
        q: { fr: "Mon colis n'a pas bougé depuis 3 jours, est-il perdu ?", en: "No movement for 3 days — is my parcel lost?" },
        a: {
          fr: "Rarement. Un statut figé traduit le plus souvent une attente sur un hub ou un scan manquant ; un colis n'est déclaré perdu qu'après 21 jours sans scan.",
          en: "Rarely. A frozen status usually means a hub wait or a missed scan; a parcel is declared lost only after 21 days without a scan.",
        },
      },
      {
        q: { fr: "Quel délai pour déclarer une perte ?", en: "When can I declare a loss?" },
        a: {
          fr: "En national, une réclamation est recevable après 21 jours sans scan ; les avaries visibles doivent être signalées par écrit sous 3 jours après réception.",
          en: "Domestically a claim is admissible after 21 days without a scan; visible damage must be reported in writing within 3 days.",
        },
      },
    ],
    body: {
      fr: `Un suivi de colis n'est pas un GPS : c'est une suite de scans. Comprendre ce que chaque scan signifie évite 90 % de l'angoisse — et permet d'agir au bon moment.

## Ce que chaque statut veut vraiment dire
**Pris en charge / Expédition enregistrée** : l'étiquette existe, le colis a été remis au transporteur. Si ce statut ne bouge pas pendant 48 h, il n'a peut-être jamais été scanné physiquement.

**En transit** : le colis circule entre deux sites. C'est le statut le plus long et le plus inquiétant à tort — sur un envoi national, deux à quatre jours sans nouveau scan est normal ; sur un international, jusqu'à une semaine.

**Arrivé sur le site de livraison** : le colis est dans l'agence qui desservira l'adresse. La livraison est proche, généralement sous 24 à 48 h.

**En cours de livraison** : le colis est dans le véhicule aujourd'hui. Si le statut reste figé le lendemain, il est retourné en agence sans avoir été présenté.

**Tentative de livraison infructueuse** : personne, adresse incomplète ou accès impossible. C'est à vous d'agir : un colis en attente est retourné après 10 à 14 jours.

**En attente de dédouanement** : rien à voir avec le transporteur. Il manque un document ou une taxe est due. C'est le seul statut qui exige une action immédiate de votre part.

**Livré** : avec preuve de livraison — nom, signature, ou photo selon le mode.

## Quand s'inquiéter vraiment
- **National** : au-delà de 5 jours ouvrés sans aucun nouveau scan
- **International Europe** : au-delà de 8 jours ouvrés
- **International hors UE** : au-delà de 15 jours ouvrés hors phase douanière
- **Statut « livré » mais rien reçu** : réagissez dans les 24 h, c'est le cas le plus facile à résoudre à chaud (voisin, gardien, dépôt en boîte, erreur de rue)

## La procédure qui débloque réellement un colis
1. **Notez le numéro de suivi et la date du dernier scan** : c'est la seule donnée utile pour le service client
2. **Vérifiez l'adresse saisie**, caractère par caractère, y compris le code postal et le numéro
3. **Contactez le transporteur avec le numéro de suivi**, pas avec une capture d'écran
4. **Demandez une enquête écrite** si aucun scan depuis 5 jours en national : c'est cette demande formelle qui déclenche la recherche physique
5. **Réclamation officielle** après 21 jours sans scan : le colis est présumé perdu et l'indemnisation s'ouvre
6. **En cas d'avarie**, écrivez des réserves précises **sous 3 jours** après réception, photos à l'appui. Passé ce délai, l'indemnisation devient très difficile

## L'erreur qui coûte l'indemnisation
Signer « reçu en bon état » puis constater un dégât. Ouvrez le colis devant le livreur quand c'est possible, et si un doute existe, écrivez « sous réserve de vérification, emballage endommagé » sur le bordereau. Cette mention change tout.

## Comment nous traitons le suivi
Chaque envoi LBG Express Colis dispose d'un numéro de suivi consultable sur notre page Suivi, avec l'historique horodaté des étapes et une notification à chaque changement de statut. Et surtout : un humain au 06 95 09 86 88 qui appelle l'agence, le chauffeur ou le destinataire. C'est exactement ce qui manque dans les réseaux entièrement automatisés, et c'est ce qui débloque un colis en quelques heures au lieu de quelques semaines.

**Un colis en attente ? Entrez votre numéro sur la page Suivi. Un colis qui n'avance plus, même chez un autre transporteur ? Appelez-nous, nous vous dirons quelle démarche déclenche réellement l'enquête.**`,
      en: `Parcel tracking is not GPS: it is a sequence of scans. Understanding each scan removes 90% of the anxiety.

## What each status really means
**Collected:** the label exists and the parcel was handed over. No movement for 48 h may mean it was never physically scanned.

**In transit:** moving between sites. Two to four days without a scan is normal domestically, up to a week internationally.

**Arrived at delivery depot:** delivery usually within 24-48 h.

**Out for delivery:** in the van today. Still frozen tomorrow means it returned undelivered.

**Failed delivery attempt:** act now — held parcels return after 10-14 days.

**Awaiting customs clearance:** a document or a tax is missing. The only status requiring your immediate action.

## When to actually worry
Domestic: more than 5 working days without a scan. Europe: more than 8. Outside the EU: more than 15, excluding customs. "Delivered" but nothing received: react within 24 hours.

## The procedure that unblocks a parcel
Note the tracking number and last scan date, verify the address character by character, contact the carrier with the tracking number, request a written investigation after 5 days without a scan, file a formal claim after 21 days, and report damage in writing within 3 days with photos.

## The mistake that costs compensation
Signing "received in good condition" then finding damage. Write "subject to verification, packaging damaged" on the delivery note.

## How we handle tracking
Every LBG Express Colis shipment has a tracking number with timestamped history and status notifications — plus a human on +33 6 95 09 86 88 who calls the depot, the driver or the recipient.

**Parcel pending? Enter your number on our Tracking page, or call us and we will tell you which step actually triggers an investigation.**`,
    },
  },
  {
    slug: "point-relais-ou-enlevement-a-domicile",
    tag: "Envoi de colis",
    image: "/images/entrepot.jpg",
    publishedAt: "2026-08-26",
    keywords: [
      "point relais proche de moi",
      "point de dépôt colis",
      "enlèvement colis à domicile",
      "déposer un colis sans imprimante",
    ],
    title: {
      fr: "Point relais, point de dépôt ou enlèvement à domicile : lequel choisir selon votre colis",
      en: "Relay point, drop-off point or home pickup: which one for your parcel",
    },
    excerpt: {
      fr: "Le mode de remise change le prix, le délai et le risque. Comparaison honnête des trois options, avec les cas où chacune est clairement la meilleure.",
      en: "How you hand over your parcel changes price, timing and risk. An honest comparison of the three options.",
    },
    faq: [
      {
        q: { fr: "L'enlèvement à domicile est-il payant ?", en: "Is home pickup chargeable?" },
        a: {
          fr: "Chez nous il est inclus dans le tarif d'envoi en Île-de-France et en France métropolitaine, sur créneau convenu.",
          en: "With us it is included in the shipping rate in the Paris region and mainland France, on an agreed slot.",
        },
      },
      {
        q: { fr: "Puis-je envoyer un colis sans imprimante ?", en: "Can I ship without a printer?" },
        a: {
          fr: "Oui : nous imprimons et posons l'étiquette lors de l'enlèvement, vous n'avez rien à préparer d'autre que l'emballage.",
          en: "Yes: we print and attach the label at pickup — you only need the packaging.",
        },
      },
    ],
    body: {
      fr: `Trois façons de confier un colis, trois logiques de prix et de risque totalement différentes. Le bon choix dépend du colis, pas de l'habitude.

## Le point relais : le moins cher, sous conditions
**Ses forces** : le tarif le plus bas du marché sur les petits colis, un maillage dense en ville, des horaires étendus.

**Ses limites réelles** :
- Limite de poids et de format souvent fixée à 20-30 kg et 100-120 cm — refus au comptoir si vous dépassez
- Vous portez le colis jusqu'au commerce, et le destinataire va le chercher
- Délai de retrait de 10 à 14 jours, sinon retour facturé
- Aucune manutention professionnelle : un colis mal emballé prend les chocs du circuit automatisé
- Le commerce peut être fermé, saturé ou avoir suspendu le service

**Le bon cas d'usage** : colis de moins de 5 kg, contenu non fragile, destinataire mobile, aucune urgence.

## Le point de dépôt / bureau de poste
Même logique, avec un guichet professionnel et des plafonds de poids parfois plus élevés. Utile quand vous n'avez pas d'imprimante ou quand vous voulez une preuve de dépôt tamponnée. Les files d'attente restent le principal coût — en temps.

## L'enlèvement à domicile ou en entreprise
**Ses forces** :
- Vous ne portez rien et ne vous déplacez pas
- Pas de limite de format ni de poids liée au comptoir : meubles, palettes, colis de 60 kg passent
- Étiquette imprimée et posée par le chauffeur : aucune imprimante nécessaire
- Prise en charge nominative avec bordereau signé — vous avez une preuve datée et un responsable identifié
- Manutention humaine du départ à l'arrivée, sans convoyeur automatique
- Créneau planifié, y compris le jour même en Île-de-France selon disponibilité

**Ses limites** : le tarif de base est plus élevé qu'un point relais sur un petit colis léger, et il faut être présent sur le créneau.

**Le bon cas d'usage** : plus de 10 kg, hors format, fragile, de valeur, urgent, ou expéditeur qui ne peut pas se déplacer (professionnel, personne âgée, parent seul, e-commerçant qui expédie plusieurs colis).

## Le tableau de décision
- **Moins de 5 kg, compact, non urgent** → point relais
- **5 à 10 kg** → arbitrez sur la valeur du contenu et votre temps
- **Plus de 10 kg, volumineux ou fragile** → enlèvement à domicile
- **Plusieurs colis le même jour** → enlèvement à domicile, systématiquement moins cher au colis
- **Professionnel avec envois réguliers** → contrat avec enlèvement planifié et tarif dégressif
- **Meuble, palette, électroménager** → enlèvement, aucune autre option ne l'accepte

## Ce que nous proposons
Enlèvement inclus dans notre tarif en Île-de-France (base 14,50 € HT + 0,85 €/kg) et en France métropolitaine (16,90 € HT + 1,10 €/kg), sur créneau convenu, avec impression de l'étiquette par le chauffeur, bordereau signé, suivi en ligne et assurance ad valorem en option. Pour les professionnels : tournée d'enlèvement planifiée et tarif dégressif dès 20 envois par mois.

**Réservez un enlèvement en indiquant votre adresse et votre créneau sur notre page devis, ou appelez le 06 95 09 86 88 pour un enlèvement le jour même en Île-de-France.**`,
      en: `Three ways to hand over a parcel, three completely different price and risk models.

## Relay point: cheapest, with conditions
Strengths: lowest rates on small parcels, dense urban coverage, long opening hours.

Real limits: weight and size caps around 20-30 kg and 100-120 cm, you carry the parcel there and the recipient collects it, a 10-14 day collection window before a charged return, no professional handling, and shops can be closed or saturated.

Best for: under 5 kg, non-fragile, mobile recipient, no urgency.

## Drop-off point or post office
Same logic with a professional counter and sometimes higher caps. Useful without a printer or when you want a stamped proof of deposit. Queues are the real cost.

## Home or business pickup
Strengths: you carry nothing, no counter-related size limits, the driver prints and attaches the label, signed handover proof, human handling throughout, and planned slots including same day in the Paris region.

Limits: a higher base rate on small light parcels, and you must be present.

Best for: over 10 kg, oversized, fragile, valuable, urgent, or senders who cannot travel.

## Decision table
Under 5 kg compact: relay point. 5-10 kg: judge on value and your time. Over 10 kg or bulky: pickup. Several parcels the same day: pickup, always cheaper per parcel. Furniture or pallets: pickup only.

## What we offer
Pickup included in our rate in the Paris region (€14.50 + €0.85/kg) and mainland France (€16.90 + €1.10/kg), label printed by the driver, signed handover, online tracking and optional ad valorem insurance. Business shippers get planned pickup rounds and volume pricing from 20 parcels a month.

**Book a pickup on our quote page, or call +33 6 95 09 86 88 for same-day pickup in the Paris region.**`,
    },
  },
  {
    slug: "poids-volumetrique-colis-explication",
    tag: "Envoi de colis",
    image: "/images/aerien.jpg",
    publishedAt: "2026-08-25",
    keywords: [
      "poids volumétrique",
      "poids taxable colis",
      "calcul poids volumétrique",
      "pourquoi mon colis coûte plus cher",
    ],
    title: {
      fr: "Poids volumétrique : pourquoi votre colis de 3 kg est facturé 19 kg (et comment l'éviter)",
      en: "Volumetric weight: why your 3 kg parcel is billed as 19 kg",
    },
    excerpt: {
      fr: "La formule L×l×H/5000 explique la majorité des factures incompréhensibles. Comment la calculer, pourquoi elle existe, et les cinq gestes qui réduisent réellement votre prix.",
      en: "The L×W×H/5000 formula explains most confusing invoices. How to calculate it and five ways to cut your price.",
    },
    faq: [
      {
        q: { fr: "Comment calculer le poids volumétrique ?", en: "How do I calculate volumetric weight?" },
        a: {
          fr: "Multipliez longueur × largeur × hauteur en centimètres, puis divisez par 5000 : le résultat est en kilos.",
          en: "Multiply length × width × height in centimetres and divide by 5000 — the result is in kilos.",
        },
      },
      {
        q: { fr: "Quel poids est retenu pour la facturation ?", en: "Which weight is billed?" },
        a: {
          fr: "Le poids taxable, c'est-à-dire le plus élevé entre le poids réel sur la balance et le poids volumétrique.",
          en: "Chargeable weight: the higher of the scale weight and the volumetric weight.",
        },
      },
    ],
    body: {
      fr: `Vous expédiez trois coussins, la balance affiche 3 kg, et la facture parle de 19 kg. Ce n'est pas une erreur : c'est le poids volumétrique, la règle la plus mal expliquée du transport.

## La formule, une fois pour toutes
**Poids volumétrique (kg) = L × l × H (cm) ÷ 5000**

Le transporteur retient ensuite le **poids taxable** : le plus élevé entre le poids réel et le poids volumétrique.

Exemple : carton de 80 × 60 × 40 cm → 192 000 ÷ 5000 = **38,4 kg volumétriques**. Même s'il contient des plumes, il sera facturé 38,4 kg.

## Pourquoi cette règle existe
Un camion, un avion ou un conteneur se remplit en volume avant de se remplir en poids. Un chargement de couettes atteint le plafond du véhicule à 40 % de sa charge utile : le coût du trajet est le même, mais il n'y a plus de place. Facturer uniquement au kilo réel reviendrait à faire payer ce vide par les autres clients. Le diviseur varie selon le mode : 5000 en routier et messagerie, 6000 en aérien classique, 4000 chez certains express.

## Le tableau des colis piégeux
- Carton 30 × 20 × 20 cm → 2,4 kg volumétriques
- Carton 40 × 30 × 30 cm → 7,2 kg
- Carton 50 × 40 × 40 cm → 16 kg
- Carton 60 × 40 × 40 cm → 19,2 kg
- Carton 80 × 60 × 40 cm → 38,4 kg
- Carton 100 × 60 × 60 cm → 72 kg

Retenez le repère : **un carton de 60 × 40 × 40 cm coûte au minimum le prix de 19 kg**, quoi qu'il contienne.

## Les cinq gestes qui font baisser la facture
1. **Ajustez le carton au contenu.** Cinq centimètres de moins sur chaque côté d'un 60 × 40 × 40 fait tomber le volumétrique de 19,2 à 14 kg, soit environ 6 € HT d'économie par colis en France.
2. **Comprimez ce qui est compressible.** Housse sous vide pour textile, couettes, oreillers : le volume peut être divisé par trois.
3. **Démontez et emboîtez.** Meubles, luminaires, matériel de sport : le volume est le prix.
4. **Ne surcalez pas.** Cinq centimètres de calage suffisent ; dix centimètres, c'est du volume payé pour rien.
5. **Groupez plutôt que multiplier.** Deux colis de 40 × 30 × 30 (7,2 kg volumétriques chacun, donc 14,4 kg) coûtent plus cher qu'un seul 60 × 40 × 30 (14,4 kg) avec une seule base tarifaire.

## L'inverse est vrai aussi
Sur un colis dense — livres, outils, pièces métalliques — le poids réel dépasse toujours le volumétrique. Dans ce cas, ne cherchez pas à réduire le carton : cherchez un transporteur avec un prix au kilo bas et pas de pénalité de poids unitaire. C'est précisément notre positionnement : base par zone plus un prix au kilo linéaire, sans surtaxe de format tant que le colis reste manipulable.

## Notre engagement de transparence
Notre estimateur en ligne demande le poids **et** les trois dimensions, calcule le poids taxable devant vous, et affiche le prix correspondant. Aucun ajustement après enlèvement : ce qui est calculé sur les dimensions déclarées est ce qui est facturé. Un colis mal mesuré est le seul cas de rectification, et nous vous prévenons avant.

**Testez la différence : entrez vos dimensions réelles sur notre page devis, puis retirez cinq centimètres par côté. Vous verrez immédiatement combien coûte votre carton.**`,
      en: `You ship three cushions, the scale says 3 kg, and the invoice says 19 kg. That is volumetric weight — the worst explained rule in shipping.

## The formula
Volumetric weight (kg) = L × W × H (cm) ÷ 5000. Carriers bill the **chargeable weight**: the higher of actual and volumetric weight. An 80 × 60 × 40 cm box is 38.4 volumetric kilos even filled with feathers.

## Why it exists
Vehicles fill up by volume before they fill up by weight. A load of duvets hits the ceiling at 40% of payload while the trip costs the same. Divisors vary: 5000 for road freight, 6000 for standard air, 4000 for some express services.

## Trap sizes
30 × 20 × 20 cm → 2.4 kg; 40 × 30 × 30 → 7.2 kg; 50 × 40 × 40 → 16 kg; 60 × 40 × 40 → 19.2 kg; 80 × 60 × 40 → 38.4 kg; 100 × 60 × 60 → 72 kg.

## Five ways to cut the bill
Right-size the box (five centimetres off each side of a 60 × 40 × 40 drops it from 19.2 to 14 kg), compress textiles with vacuum bags, dismantle and nest, avoid over-cushioning, and group parcels instead of multiplying bases.

## The reverse is also true
For dense goods — books, tools, metal parts — actual weight always wins. Then look for a low per-kilo rate with no unit-weight penalty, which is exactly our model.

## Our transparency commitment
Our estimator asks for weight **and** all three dimensions, computes chargeable weight in front of you, and shows the matching price. No post-pickup adjustment unless the parcel was mismeasured, and we warn you first.

**Try it: enter your real dimensions on our quote page, then remove five centimetres per side.**`,
    },
  },
];
