import type { Bi } from "./i18n";
import { CONTACT } from "./format";

/** Identité légale affichée sur tout le site (obligation LCEN + exigences myPOS). */
export const COMPANY = {
  legalName: "LBG EXPRESS",
  brand: "LBG Express Colis",
  operator: "Billy Lionnel Godefroy Koussala Wola",
  /** Forme abrégée affichée sur le site : identification assurée par le SIREN affiché à côté. */
  operatorShort: "B. Koussala Wola",
  status: { fr: "Entrepreneur individuel", en: "Sole trader (entrepreneur individuel)" } satisfies Bi,
  addressLine: "1 rue de Stockholm",
  addressCity: "75008 Paris",
  addressCountry: { fr: "France", en: "France" } satisfies Bi,
  siret: "893 700 336 00025",
  siren: "893 700 336",
  vat: "FR68893700336",
  ape: "5320Z",
  apeLabel: {
    fr: "Autres activités de poste et de courrier",
    en: "Other postal and courier activities",
  } satisfies Bi,
  registeredSince: { fr: "8 décembre 2022", en: "8 December 2022" } satisfies Bi,
  insurer: "Simplis",
  vatRate: 20,
} as const;

export const POSTAL_ADDRESS = `${COMPANY.addressLine}, ${COMPANY.addressCity}, France`;

export interface Block {
  title: Bi;
  body: Bi;
}

const IDF = {
  fr: "Paris (75), Seine-et-Marne (77), Yvelines (78), Essonne (91), Hauts-de-Seine (92), Seine-Saint-Denis (93), Val-de-Marne (94) et Val-d'Oise (95)",
  en: "Paris (75), Seine-et-Marne (77), Yvelines (78), Essonne (91), Hauts-de-Seine (92), Seine-Saint-Denis (93), Val-de-Marne (94) and Val-d'Oise (95)",
};

/* ------------------------------------------------------------------ */
/* Mentions légales                                                    */
/* ------------------------------------------------------------------ */

export const MENTIONS: Block[] = [
  {
    title: { fr: "Notre cadre juridique", en: "Our legal framework" },
    body: {
      fr: `${COMPANY.brand} applique les normes juridiques les plus exigeantes afin de garantir à ses clients un service de transport fiable et sécurisé. En commandant une prestation sur ce site, vous concluez un contrat de transport juridiquement contraignant avec ${COMPANY.brand}. Nous vous invitons à examiner attentivement nos conditions générales de vente, qui encadrent l'ensemble de votre relation avec nous : obligations de chacune des parties, conditions d'enlèvement et de livraison, responsabilité en cas de perte ou d'avarie, tarification et modalités de règlement.\nLa protection de vos données est une priorité. ${COMPANY.brand} se conforme au règlement général sur la protection des données et à la loi Informatique et Libertés. Notre politique de confidentialité détaille les données collectées, les finalités poursuivies, les durées de conservation et les droits que vous pouvez exercer à tout moment.\nLa sécurité de nos clients ne se limite pas aux documents contractuels : suivi des expéditions, traçabilité des colis, paiement traité par un établissement agréé et couverture d'assurance sur les biens confiés participent du même engagement.\nEn cas de désaccord, nous privilégions toujours le dialogue direct et une résolution amiable. Si aucune solution n'est trouvée, vous conservez l'intégralité de vos droits : recours gratuit à un médiateur de la consommation et accès aux tribunaux français compétents. Nous n'imposons aucune clause d'arbitrage ni renonciation à vos droits.\n${COMPANY.brand} peut faire évoluer ces documents pour tenir compte des évolutions légales ou de son offre. La date de dernière mise à jour figure au bas de cette page.`,
      en: `${COMPANY.brand} applies the highest legal standards to provide its customers with a reliable and secure transport service. By ordering a service on this website, you enter into a legally binding contract of carriage with ${COMPANY.brand}. We invite you to review our terms and conditions of sale carefully, as they govern your entire relationship with us: the obligations of each party, pickup and delivery conditions, liability in the event of loss or damage, pricing and payment terms.\nProtecting your data is a priority. ${COMPANY.brand} complies with the General Data Protection Regulation and French data protection law. Our privacy policy sets out the data collected, the purposes pursued, retention periods and the rights you may exercise at any time.\nCustomer safety goes beyond contractual documents: shipment tracking, parcel traceability, payment handled by an authorised institution and insurance cover on goods entrusted are part of the same commitment.\nShould a disagreement arise, we always favour direct dialogue and an amicable resolution. If no solution is found, you retain all of your rights: free recourse to a consumer mediator and access to the competent French courts. We impose no arbitration clause and no waiver of your rights.\n${COMPANY.brand} may update these documents to reflect changes in the law or in its offering. The date of last update appears at the foot of this page.`,
    },
  },
  {
    title: { fr: "Propriété intellectuelle", en: "Intellectual property" },
    body: {
      fr: `La marque ${COMPANY.brand}, le logo, les textes, visuels, grilles tarifaires, guides et la structure de ce site sont la propriété exclusive de ${COMPANY.legalName}. Toute reproduction, représentation, extraction ou réutilisation, même partielle et par quelque procédé que ce soit, est interdite sans autorisation écrite préalable. Toute utilisation non autorisée expose son auteur aux poursuites prévues par le code de la propriété intellectuelle.`,
      en: `The ${COMPANY.brand} brand, logo, texts, visuals, pricing tables, guides and the structure of this website are the exclusive property of ${COMPANY.legalName}. Any reproduction, representation, extraction or reuse, even partial and by any means whatsoever, is prohibited without prior written permission. Unauthorised use exposes the author to the proceedings provided for by French intellectual property law.`,
    },
  },
  {
    title: { fr: "Paiement en ligne", en: "Online payment" },
    body: {
      fr: "Les paiements par carte bancaire sont traités par myPOS (myPOS Payments Ltd / myPOS AD, établissement de paiement agréé dans l'Espace économique européen). Les données de carte sont saisies sur l'environnement sécurisé du prestataire : nous n'y avons jamais accès et n'en conservons aucune copie. Le virement bancaire est également accepté. Toutes les transactions sont libellées en euros (EUR).",
      en: "Card payments are processed by myPOS (myPOS Payments Ltd / myPOS AD, a payment institution authorised in the European Economic Area). Card details are entered on the provider's secure environment: we never have access to them and store no copy. Bank transfer is also accepted. All transactions are denominated in euros (EUR).",
    },
  },
  {
    title: { fr: "Médiation et litiges", en: "Mediation and disputes" },
    body: {
      fr: `Toute réclamation doit d'abord nous être adressée à ${CONTACT.email}. À défaut de solution satisfaisante sous 30 jours, le consommateur peut saisir gratuitement un médiateur de la consommation (article L612-1 du code de la consommation) ou la plateforme européenne de règlement en ligne des litiges. Le droit français s'applique et les tribunaux français sont seuls compétents.`,
      en: `Any complaint must first be sent to us at ${CONTACT.email}. If no satisfactory outcome is reached within 30 days, consumers may refer the matter free of charge to a consumer mediator (Article L612-1 of the French Consumer Code) or to the European online dispute resolution platform. French law applies and French courts have jurisdiction.`,
    },
  },
  {
    title: { fr: "Signaler un contenu", en: "Reporting content" },
    body: {
      fr: `Pour signaler une erreur, un contenu illicite ou une usurpation de notre identité, écrivez à ${CONTACT.email} en précisant l'URL concernée. Nous traitons ces signalements sous 48 heures ouvrées.`,
      en: `To report an error, unlawful content or misuse of our identity, write to ${CONTACT.email} stating the URL concerned. We handle such reports within 48 working hours.`,
    },
  },
  {
    title: { fr: "Éditeur et hébergement", en: "Publisher and hosting" },
    body: {
      fr: `Site édité par ${COMPANY.legalName} (marque commerciale « ${COMPANY.brand} »), entreprise individuelle exploitée par M. ${COMPANY.operatorShort} — ${POSTAL_ADDRESS}.\nSIREN ${COMPANY.siren} — SIRET ${COMPANY.siret} — TVA intracommunautaire ${COMPANY.vat}.\nTéléphone : ${CONTACT.phone} (numéro non surtaxé, également joignable sur WhatsApp) — E-mail : ${CONTACT.email}.\nHébergeur : Hostinger International Ltd, 61 Lordou Vironos Street, 6023 Larnaca, Chypre — hostinger.fr. Serveur situé dans l'Union européenne, connexions chiffrées en HTTPS.`,
      en: `Website published by ${COMPANY.legalName} (trading as “${COMPANY.brand}”), a sole trader operated by Mr ${COMPANY.operatorShort} — ${POSTAL_ADDRESS}.\nSIREN ${COMPANY.siren} — SIRET ${COMPANY.siret} — EU VAT ${COMPANY.vat}.\nPhone: ${CONTACT.phone} (no premium rate, also reachable on WhatsApp) — Email: ${CONTACT.email}.\nHost: Hostinger International Ltd, 61 Lordou Vironos Street, 6023 Larnaca, Cyprus — hostinger.com. Server located in the European Union, connections encrypted over HTTPS.`,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Livraison et délais                                                 */
/* ------------------------------------------------------------------ */

export const LIVRAISON: Block[] = [
  {
    title: { fr: "Modes de livraison proposés", en: "Delivery methods offered" },
    body: {
      fr: `Trois prestations, toutes avec enlèvement à l'adresse de votre choix :\n• Livraison de colis en Île-de-France — enlèvement à domicile ou en entreprise, remise en main propre contre signature ou preuve photo.\n• Déménagement en Île-de-France — équipe et véhicule dédiés, chargement et déchargement inclus dans la formule choisie.\n• Envoi de colis à l'international — départ d'Île-de-France, acheminement aérien ou maritime, puis retrait sur notre point de remise à destination ou livraison à domicile selon l'option retenue.\nAucun envoi n'est confié à un point relais automatique : un interlocuteur identifié suit chaque expédition.`,
      en: `Three services, all including pickup at the address of your choice:\n• Parcel delivery within Greater Paris — pickup at home or at your business, handover against signature or photo proof.\n• Moving within Greater Paris — dedicated crew and vehicle, loading and unloading included in the selected package.\n• International parcel shipping — departure from Greater Paris, air or sea freight, then collection at our handover point at destination or home delivery depending on the option chosen.\nNo shipment is left in an automated pickup locker: a named contact follows every shipment.`,
    },
  },
  {
    title: { fr: "Zone desservie en Île-de-France", en: "Coverage in Greater Paris" },
    body: {
      fr: `Nous intervenons dans les huit départements d'Île-de-France : ${IDF.fr}. Hors de cette zone, un devis spécifique est établi avant toute intervention.`,
      en: `We operate across the eight Greater Paris departments: ${IDF.en}. Outside this area, a specific quote is issued before any service.`,
    },
  },
  {
    title: { fr: "Délais de livraison en Île-de-France", en: "Delivery times in Greater Paris" },
    body: {
      fr: "Colis en Île-de-France : livraison sous 24 à 48 heures à compter de l'enlèvement effectif. Une option Express permet une livraison le jour même sur créneau confirmé par téléphone.\nDéménagement en Île-de-France : intervention réalisée sous 3 jours après validation du devis et confirmation du créneau.\nLes délais sont exprimés en jours ouvrés et courent à partir du moment où la marchandise est prise en charge, pas de la date de commande.",
      en: "Parcels within Greater Paris: delivered within 24 to 48 hours from actual pickup. An Express option allows same-day delivery within a slot confirmed by phone.\nMoving within Greater Paris: carried out within 3 days after the quote is approved and the slot confirmed.\nLead times are expressed in working days and start when the goods are collected, not from the order date.",
    },
  },
  {
    title: { fr: "Délais à l'international", en: "International lead times" },
    body: {
      fr: "Acheminement aérien : 5 à 10 jours ouvrés entre l'enlèvement en Île-de-France et la mise à disposition à destination.\nAcheminement maritime : 30 à 45 jours, adapté aux volumes importants et aux envois non urgents.\nCes durées incluent le groupage au départ mais pas le temps de dédouanement à l'arrivée, qui dépend des autorités locales et peut ajouter quelques jours. Nous vous informons dès que le colis est présenté à la douane.",
      en: "Air freight: 5 to 10 working days between pickup in Greater Paris and availability at destination.\nSea freight: 30 to 45 days, suited to large volumes and non-urgent shipments.\nThese durations include consolidation at departure but not customs clearance on arrival, which depends on local authorities and may add a few days. We notify you as soon as the parcel is presented to customs.",
    },
  },
  {
    title: { fr: "Destinations internationales desservies", en: "International destinations served" },
    body: {
      fr: "Nous expédions actuellement vers trois destinations, en aérien comme en maritime : Bénin (Cotonou), Togo (Lomé) et Mali (Bamako). Toute autre destination fait l'objet d'une étude au cas par cas : contactez-nous avant de commander, nous ne prenons pas d'engagement que nous ne pouvons pas tenir.",
      en: "We currently ship to three destinations, by air and by sea: Benin (Cotonou), Togo (Lomé) and Mali (Bamako). Any other destination is studied case by case: contact us before ordering — we do not make commitments we cannot keep.",
    },
  },
  {
    title: { fr: "Suivi de votre expédition", en: "Tracking your shipment" },
    body: {
      fr: "Chaque expédition reçoit un numéro de suivi au format TRK-AAAAMMJJ-XXXXXX, consultable à tout moment sur la page Suivi du site, sans création de compte. Les statuts sont mis à jour par le livreur lui-même : colis créé, pris en charge, en transit, en cours de livraison, livré, incident, retourné. Vous recevez une notification par e-mail à chaque changement de statut.",
      en: "Every shipment gets a tracking number in the TRK-YYYYMMDD-XXXXXX format, available at any time on the Tracking page without creating an account. Statuses are updated by the driver: created, picked up, in transit, out for delivery, delivered, incident, returned. You receive an email notification at every status change.",
    },
  },
  {
    title: { fr: "Retards et absence du destinataire", en: "Delays and recipient absence" },
    body: {
      fr: "Les délais annoncés sont des délais cibles et non des garanties de résultat : ils peuvent être allongés par un cas de force majeure, une grève, un aléa climatique, un contrôle douanier ou une adresse incomplète. Dans ce cas nous vous prévenons et vous donnons un interlocuteur unique, joignable par téléphone ou WhatsApp, jusqu'à la résolution.\nEn cas d'absence du destinataire, un avis de passage est laissé et une seconde présentation est planifiée sous 48 heures. Passé ce délai, le colis est conservé 14 jours puis retourné à l'expéditeur, les frais de retour restant à sa charge.",
      en: "Stated lead times are target times, not guaranteed results: they may be extended by force majeure, strikes, weather events, customs inspections or an incomplete address. If that happens we warn you and give you a single contact person, reachable by phone or WhatsApp, until it is resolved.\nIf the recipient is absent, a notice is left and a second attempt is scheduled within 48 hours. After that, the parcel is held for 14 days then returned to the sender, who bears the return costs.",
    },
  },
  {
    title: { fr: "Marchandises exclues du transport", en: "Goods excluded from carriage" },
    body: {
      fr: "Ne peuvent être expédiés : espèces et valeurs, métaux précieux, armes et munitions, stupéfiants, produits dangereux, inflammables ou explosifs, batteries au lithium non conformes, animaux vivants, denrées périssables non conditionnées, médicaments sans ordonnance et contrefaçons. Toute déclaration inexacte engage la responsabilité de l'expéditeur, y compris pour les sanctions douanières.",
      en: "The following cannot be shipped: cash and valuables, precious metals, weapons and ammunition, narcotics, dangerous, flammable or explosive goods, non-compliant lithium batteries, live animals, unpackaged perishables, prescription-free medicines and counterfeit items. Any inaccurate declaration is the sender's responsibility, including customs penalties.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Annulation, retour et remboursement                                 */
/* ------------------------------------------------------------------ */

export const ANNULATION: Block[] = [
  {
    title: { fr: "Annuler une commande de transport", en: "Cancelling a transport order" },
    body: {
      fr: `Une annulation s'effectue par un simple message à ${CONTACT.email}, par téléphone ou sur WhatsApp au ${CONTACT.phone}. Elle est confirmée par écrit. Le barème appliqué dépend du préavis :\n• Plus de 24 heures avant le créneau d'enlèvement : annulation gratuite, remboursement intégral de toute somme déjà versée.\n• Entre 24 et 4 heures avant le créneau : 20 % du montant retenus au titre de la réservation du véhicule et de l'équipe, 80 % remboursés.\n• Moins de 4 heures avant le créneau, ou véhicule déjà sur place : 50 % du montant retenus, 50 % remboursés.\n• Marchandise déjà enlevée : le transport est dû ; seules les options non exécutées sont remboursées.\nAucun frais n'est retenu si l'annulation vient de nous, quelle qu'en soit la raison.`,
      en: `To cancel, simply send a message to ${CONTACT.email}, or call or WhatsApp ${CONTACT.phone}. Cancellation is confirmed in writing. The scale applied depends on the notice given:\n• More than 24 hours before the pickup slot: free cancellation, full refund of any amount already paid.\n• Between 24 and 4 hours before the slot: 20% retained for reserving the vehicle and crew, 80% refunded.\n• Less than 4 hours before the slot, or vehicle already on site: 50% retained, 50% refunded.\n• Goods already collected: the carriage is due; only unperformed options are refunded.\nNo fee is retained if the cancellation comes from us, whatever the reason.`,
    },
  },
  {
    title: { fr: "Droit de rétractation : ce que dit la loi", en: "Right of withdrawal: what the law says" },
    body: {
      fr: "Nous préférons être clairs plutôt que rassurants à tort : le délai de rétractation de 14 jours ne s'applique pas aux prestations de transport de biens. C'est une exclusion prévue par le code de la consommation (article L221-2 pour les contrats de transport de biens et article L221-28 pour les services exécutés à une date convenue). C'est la raison pour laquelle nous appliquons à la place le barème d'annulation ci-dessus, qui vous permet d'annuler gratuitement jusqu'à 24 heures avant l'enlèvement.",
      en: "We would rather be clear than falsely reassuring: the 14-day withdrawal period does not apply to the carriage of goods. This is an exclusion set out in the French Consumer Code (Article L221-2 for contracts for the carriage of goods and Article L221-28 for services performed on an agreed date). That is why we instead apply the cancellation scale above, which lets you cancel free of charge up to 24 hours before pickup.",
    },
  },
  {
    title: { fr: "Retour d'un colis non livré", en: "Return of an undelivered parcel" },
    body: {
      fr: "Un colis qui n'a pu être remis après deux présentations et 14 jours de garde est retourné à l'expéditeur. Le transport aller reste dû ; le retour est facturé au tarif d'une livraison simple dans la même zone, annoncé avant expédition du retour. Si l'échec de livraison nous est imputable, le retour est gratuit.",
      en: "A parcel that could not be handed over after two attempts and 14 days of storage is returned to the sender. The outbound carriage remains due; the return is charged at the price of a standard delivery in the same zone, quoted before the return is dispatched. If the failed delivery is our fault, the return is free.",
    },
  },
  {
    title: { fr: "Perte, vol ou avarie : indemnisation", en: "Loss, theft or damage: compensation" },
    body: {
      fr: `Toute réserve doit être portée précisément sur le bon de livraison au moment de la remise, puis confirmée par écrit à ${CONTACT.email} dans les 3 jours ouvrés, photos à l'appui. Nous accusons réception sous 48 heures ouvrées et rendons une décision motivée sous 30 jours au plus.\n• Sans option d'assurance ad valorem, l'indemnisation suit les plafonds légaux applicables au transport (barème au kilogramme).\n• Avec l'option d'assurance ad valorem, la valeur déclarée est couverte, sur justificatif d'achat, dans la limite de la garantie souscrite auprès de ${COMPANY.insurer} (100 000 € par sinistre, franchise 200 €).\nLe remboursement est effectué par le même moyen que le paiement initial, sous 14 jours après accord, en euros.`,
      en: `Any reservation must be stated precisely on the delivery note at handover, then confirmed in writing to ${CONTACT.email} within 3 working days, with photos. We acknowledge receipt within 48 working hours and issue a reasoned decision within 30 days at most.\n• Without the ad valorem insurance option, compensation follows the statutory transport caps (per-kilogram scale).\n• With the ad valorem insurance option, the declared value is covered, against proof of purchase, up to the cover taken out with ${COMPANY.insurer} (€100,000 per claim, €200 deductible).\nRefunds are issued by the same means as the original payment, within 14 days of agreement, in euros.`,
    },
  },
  {
    title: { fr: "Erreur de facturation", en: "Billing errors" },
    body: {
      fr: `Si le montant prélevé ne correspond pas au devis accepté, signalez-le à ${CONTACT.email} avec le numéro de facture (format FA-AAAA-NNNN). La différence est remboursée sous 7 jours ouvrés sur le moyen de paiement d'origine, sans condition et sans discussion sur le principe.`,
      en: `If the amount charged does not match the accepted quote, report it to ${CONTACT.email} with the invoice number (format FA-YYYY-NNNN). The difference is refunded within 7 working days to the original payment method, unconditionally and without argument over the principle.`,
    },
  },
];

/* ------------------------------------------------------------------ */
/* Confidentialité                                                     */
/* ------------------------------------------------------------------ */

export const CONFIDENTIALITE: Block[] = [
  {
    title: { fr: "Responsable du traitement", en: "Data controller" },
    body: {
      fr: `${COMPANY.legalName}, ${POSTAL_ADDRESS}, SIRET ${COMPANY.siret}, représentée par M. ${COMPANY.operatorShort}, est responsable du traitement des données collectées sur lbgexpresscolis.fr. Contact pour toute question relative aux données : ${CONTACT.email}.`,
      en: `${COMPANY.legalName}, ${POSTAL_ADDRESS}, SIRET ${COMPANY.siret}, represented by Mr ${COMPANY.operatorShort}, is the controller of data collected on lbgexpresscolis.fr. Contact for any data-related question: ${CONTACT.email}.`,
    },
  },
  {
    title: { fr: "Données collectées et finalités", en: "Data collected and purposes" },
    body: {
      fr: "• Devis et commandes : nom, téléphone, e-mail, adresses d'enlèvement et de livraison, description de la marchandise — pour établir le prix et exécuter le transport (exécution du contrat).\n• Suivi : numéro de suivi, statuts, horodatages, position du livreur pendant la tournée — pour vous informer (exécution du contrat).\n• Compte client : e-mail, mot de passe chiffré, historique des commandes et factures (exécution du contrat).\n• Contact et réclamations : contenu de vos messages et pièces jointes (intérêt légitime).\n• Facturation : données comptables obligatoires (obligation légale).\nAucune donnée n'est utilisée pour du profilage publicitaire et aucune n'est revendue à des tiers.",
      en: "• Quotes and orders: name, phone, email, pickup and delivery addresses, description of the goods — to price and perform the carriage (contract performance).\n• Tracking: tracking number, statuses, timestamps, driver position during the round — to keep you informed (contract performance).\n• Customer account: email, hashed password, order and invoice history (contract performance).\n• Contact and claims: the content of your messages and attachments (legitimate interest).\n• Invoicing: mandatory accounting data (legal obligation).\nNo data is used for advertising profiling and none is resold to third parties.",
    },
  },
  {
    title: { fr: "Durées de conservation", en: "Retention periods" },
    body: {
      fr: "Prospects et devis sans suite : 3 ans après le dernier contact. Dossiers de transport et suivi : 5 ans. Pièces comptables et factures : 10 ans, conformément au code de commerce. Comptes clients inactifs : supprimés après 3 ans sans connexion. Journaux techniques du serveur : 12 mois.",
      en: "Prospects and quotes with no follow-up: 3 years after the last contact. Transport files and tracking: 5 years. Accounting records and invoices: 10 years, as required by the French Commercial Code. Inactive customer accounts: deleted after 3 years without login. Technical server logs: 12 months.",
    },
  },
  {
    title: { fr: "Destinataires et sous-traitants", en: "Recipients and processors" },
    body: {
      fr: "Vos données sont accessibles à M. Billy Koussala Wola et, pour les seules informations nécessaires à la tournée, au livreur en charge de votre expédition. Sous-traitants techniques : Hostinger (hébergement, Union européenne), Resend (envoi des e-mails transactionnels), myPOS (paiement par carte). L'autocomplétion des adresses interroge les services ouverts Photon (Komoot) et Nominatim (OpenStreetMap) depuis notre serveur : seule la saisie partielle du champ adresse leur est transmise, sans aucune donnée d'identification. À l'international, nos correspondants locaux au Bénin, au Togo et au Mali reçoivent les seules coordonnées du destinataire nécessaires à la remise. Les autorités douanières reçoivent les déclarations obligatoires.",
      en: "Your data is accessible to Mr Billy Koussala Wola and, for round-related information only, to the driver handling your shipment. Technical processors: Hostinger (hosting, European Union), Resend (transactional email delivery), myPOS (card payment). Address autocompletion queries the open Photon (Komoot) and Nominatim (OpenStreetMap) services from our server: only the partial text typed in the address field is sent, with no identifying data. For international shipments, our local partners in Benin, Togo and Mali receive only the recipient details required for handover. Customs authorities receive the mandatory declarations.",
    },
  },
  {
    title: { fr: "Transferts hors Union européenne", en: "Transfers outside the European Union" },
    body: {
      fr: "Les expéditions internationales impliquent nécessairement la transmission des coordonnées du destinataire hors de l'Union européenne (Bénin, Togo, Mali). Ce transfert est nécessaire à l'exécution du contrat de transport, au sens de l'article 49 du RGPD, et se limite au strict nécessaire : nom, téléphone, adresse de remise et description du colis.",
      en: "International shipments necessarily involve transmitting the recipient's details outside the European Union (Benin, Togo, Mali). This transfer is necessary to perform the transport contract, within the meaning of Article 49 GDPR, and is limited to the strict minimum: name, phone, delivery address and parcel description.",
    },
  },
  {
    title: { fr: "Vos droits", en: "Your rights" },
    body: {
      fr: `Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité. Écrivez à ${CONTACT.email} : nous répondons sous un mois. Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — cnil.fr.`,
      en: `You have the right of access, rectification, erasure, restriction, objection and portability. Write to ${CONTACT.email}: we reply within one month. If our answer does not satisfy you, you may lodge a complaint with the CNIL, 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07 — cnil.fr.`,
    },
  },
  {
    title: { fr: "Cookies et consentement", en: "Cookies and consent" },
    body: {
      fr: "Deux catégories seulement.\n• Cookies strictement nécessaires, déposés sans consentement car indispensables au fonctionnement : langue choisie, thème d'affichage, session de connexion à l'espace client, mémorisation de votre choix de cookies.\n• Mesure d'audience et publicité, soumises à votre consentement : statistiques de fréquentation agrégées et, le cas échéant, campagnes publicitaires ou de remarketing. Tant que vous n'avez pas accepté, ces traitements sont désactivés ; si vous refusez, la mesure d'audience et toute publicité ciblée restent coupées et les cookies non essentiels déjà présents sont supprimés.\nÀ votre première visite, un bandeau vous permet d'accepter ou de refuser. Votre choix est conservé 6 mois puis la question vous est reposée. Il est révocable à tout moment : videz les cookies du site depuis votre navigateur, le bandeau réapparaîtra, ou écrivez-nous à " + CONTACT.email + ". Vous pouvez aussi supprimer tous les cookies depuis les réglages de votre navigateur ; la connexion à votre espace client sera alors perdue. Aucun cookie n'est utilisé pour revendre vos données.",
      en: "Two categories only.\n• Strictly necessary cookies, set without consent because the site cannot work without them: chosen language, display theme, customer-area login session, and the record of your cookie choice.\n• Analytics and advertising, subject to your consent: aggregated traffic statistics and, where applicable, advertising or remarketing campaigns. Until you accept, these are disabled; if you refuse, analytics and any targeted advertising stay off and non-essential cookies already present are deleted.\nOn your first visit, a banner lets you accept or refuse. Your choice is kept for 6 months, after which you are asked again. It can be withdrawn at any time: clear the site cookies from your browser and the banner will reappear, or write to us at " + CONTACT.email + ". You can also delete all cookies from your browser settings; your customer-area session will then be lost. No cookie is used to resell your data.",
    },
  },
  {
    title: { fr: "Sécurité", en: "Security" },
    body: {
      fr: "Le site est intégralement servi en HTTPS. Les mots de passe sont stockés hachés et jamais lisibles, y compris par nous. Les données de carte bancaire ne transitent jamais par nos serveurs : elles sont saisies directement chez myPOS. La base de données est sauvegardée chaque jour et conservée sur un serveur situé dans l'Union européenne.",
      en: "The whole site is served over HTTPS. Passwords are stored hashed and are never readable, including by us. Card details never pass through our servers: they are entered directly with myPOS. The database is backed up daily and kept on a server located in the European Union.",
    },
  },
];

/* ------------------------------------------------------------------ */
/* Conditions générales de vente                                       */
/* ------------------------------------------------------------------ */

export const CGV: Block[] = [
  {
    title: { fr: "1. Identité du prestataire", en: "1. Service provider identity" },
    body: {
      fr: `${COMPANY.legalName}, entreprise individuelle exploitée par M. ${COMPANY.operatorShort}, ${POSTAL_ADDRESS}. SIRET ${COMPANY.siret}, TVA intracommunautaire ${COMPANY.vat}, code APE ${COMPANY.ape}. Téléphone et WhatsApp : ${CONTACT.phone}. E-mail : ${CONTACT.email}.`,
      en: `${COMPANY.legalName}, a sole trader owned by Mr ${COMPANY.operatorShort}, ${POSTAL_ADDRESS}. SIRET ${COMPANY.siret}, EU VAT ${COMPANY.vat}, activity code ${COMPANY.ape}. Phone and WhatsApp: ${CONTACT.phone}. Email: ${CONTACT.email}.`,
    },
  },
  {
    title: { fr: "2. Objet et champ d'application", en: "2. Purpose and scope" },
    body: {
      fr: "Les présentes conditions régissent trois prestations : la livraison de colis en Île-de-France, le déménagement en Île-de-France et l'envoi de colis à l'international (Bénin, Togo, Mali). Elles s'appliquent aux particuliers comme aux professionnels. Toute commande passée sur le site ou validée par écrit vaut acceptation sans réserve de ces conditions.",
      en: "These terms govern three services: parcel delivery within Greater Paris, moving within Greater Paris, and international parcel shipping (Benin, Togo, Mali). They apply to both consumers and businesses. Any order placed on the website or confirmed in writing constitutes unreserved acceptance of these terms.",
    },
  },
  {
    title: { fr: "3. Devis et prix", en: "3. Quotes and prices" },
    body: {
      fr: `Le prix est calculé à partir des informations déclarées par le client : zone, formule, poids, dimensions, volume, étages et options. Le poids taxable retenu est le plus élevé entre le poids réel et le poids volumétrique (L × l × H / 5000 en aérien, 1 m³ = 200 kg en groupage). Tous les prix sont exprimés en euros (EUR). Les tarifs affichés sur le site sont indiqués hors taxes et toutes taxes comprises : la TVA française de ${COMPANY.vatRate} % s'applique, ainsi que la surcharge carburant en vigueur, mentionnée sur la page Tarifs. Le devis remis avant commande indique le coût total à payer, options, frais de manutention et taxes inclus : aucun frais ne s'y ajoute après validation. Un écart significatif constaté à l'enlèvement donne lieu à un nouveau prix soumis à votre validation avant chargement ; vous pouvez le refuser sans frais.`,
      en: `The price is computed from the information declared by the customer: zone, service level, weight, dimensions, volume, floors and options. The chargeable weight is the higher of actual and volumetric weight (L × W × H / 5000 for air freight, 1 m³ = 200 kg for consolidated freight). All prices are in euros (EUR). Prices shown on the site are displayed both excluding and including tax: French VAT of ${COMPANY.vatRate}% applies, as does the current fuel surcharge stated on the Pricing page. The quote issued before ordering states the total amount payable, including options, handling fees and taxes: nothing is added after approval. A significant discrepancy found at pickup leads to a new price submitted for your approval before loading; you may refuse it free of charge.`,
    },
  },
  {
    title: { fr: "4. Paiement", en: "4. Payment" },
    body: {
      fr: "Deux moyens de paiement sont acceptés : la carte bancaire, via la plateforme sécurisée myPOS, et le virement bancaire. Nous n'acceptons ni les espèces ni PayPal. Le montant est débité en euros (EUR) ; aucun frais de dossier ni commission de paiement n'est ajouté au total du devis. En cas de virement, la commande reste en attente jusqu'à réception effective des fonds. Une facture numérotée au format FA-AAAA-NNNN, mentionnant la TVA, est émise pour chaque prestation et disponible dans votre espace client.",
      en: "Two payment methods are accepted: bank card, through the secure myPOS platform, and bank transfer. We accept neither cash nor PayPal. The amount is charged in euros (EUR); no administration fee or payment commission is added to the quoted total. For bank transfers, the order stays pending until funds are actually received. A numbered invoice in the FA-YYYY-NNNN format, showing VAT, is issued for every service and available in your customer area.",
    },
  },
  {
    title: { fr: "5. Emballage et marchandises exclues", en: "5. Packaging and excluded goods" },
    body: {
      fr: "Le client garantit un emballage adapté à la nature du contenu et au mode de transport, sauf souscription de l'option d'emballage professionnel. Sont exclus du transport : espèces et valeurs, métaux précieux, armes, stupéfiants, produits dangereux, inflammables ou explosifs, animaux vivants, denrées périssables non conditionnées et contrefaçons. Le client répond des conséquences de toute déclaration inexacte, y compris des sanctions douanières.",
      en: "The customer guarantees packaging suited to the contents and the transport mode, unless the professional packing option is purchased. Excluded from carriage: cash and valuables, precious metals, weapons, narcotics, dangerous, flammable or explosive goods, live animals, unpackaged perishables and counterfeit items. The customer is liable for the consequences of any inaccurate declaration, including customs penalties.",
    },
  },
  {
    title: { fr: "6. Délais et livraison", en: "6. Lead times and delivery" },
    body: {
      fr: "Les délais applicables sont ceux détaillés sur la page « Livraison et délais » : 24 à 48 h pour un colis en Île-de-France, sous 3 jours pour un déménagement, 5 à 10 jours en aérien et 30 à 45 jours en maritime à l'international. Ils sont exprimés en jours ouvrés, courent à compter de l'enlèvement effectif et constituent des délais cibles, susceptibles d'être allongés par un cas de force majeure, une grève, un aléa climatique, un contrôle douanier ou une adresse incomplète. La livraison est réputée effectuée à la remise contre signature ou preuve photo.",
      en: "The applicable lead times are those detailed on the “Delivery and lead times” page: 24 to 48 hours for a parcel within Greater Paris, within 3 days for a move, 5 to 10 days by air and 30 to 45 days by sea for international shipments. They are expressed in working days, start from actual pickup and are target times, which may be extended by force majeure, strikes, weather events, customs inspections or an incomplete address. Delivery is deemed complete upon handover against signature or photo proof.",
    },
  },
  {
    title: { fr: "7. Responsabilité et indemnisation", en: "7. Liability and compensation" },
    body: {
      fr: `À défaut d'assurance ad valorem, l'indemnisation est limitée aux plafonds légaux applicables au transport (barème au kilogramme). L'option d'assurance ad valorem couvre la valeur déclarée, sur justificatif d'achat, en cas de perte, vol ou avarie établie. LBG Express Colis est titulaire d'une responsabilité civile professionnelle souscrite auprès de ${COMPANY.insurer}, dont la garantie « biens confiés » atteint 100 000 € par sinistre (franchise 200 €).`,
      en: `Without ad valorem insurance, compensation is limited to the statutory transport caps (per-kilogram scale). The ad valorem insurance option covers the declared value, against proof of purchase, in the event of established loss, theft or damage. LBG Express Colis holds professional liability insurance underwritten by ${COMPANY.insurer}, whose “goods entrusted” cover reaches €100,000 per claim (€200 deductible).`,
    },
  },
  {
    title: { fr: "8. Réclamations", en: "8. Claims" },
    body: {
      fr: `Toute réserve doit être portée précisément sur le bon de livraison à la remise, puis confirmée par écrit à ${CONTACT.email} dans un délai de 3 jours ouvrés, photos à l'appui. Passé ce délai, la marchandise est réputée acceptée sans réserve. Le détail de la procédure figure sur la page « Annulation, retour et remboursement ».`,
      en: `Any reservation must be stated precisely on the delivery note at handover, then confirmed in writing to ${CONTACT.email} within 3 working days, with photos. After that period, the goods are deemed accepted without reservation. The full procedure is set out on the “Cancellation, return and refund” page.`,
    },
  },
  {
    title: { fr: "9. Annulation et rétractation", en: "9. Cancellation and withdrawal" },
    body: {
      fr: "L'annulation est gratuite jusqu'à 24 heures avant le créneau d'enlèvement. Entre 24 et 4 heures avant, 20 % du montant est retenu ; moins de 4 heures avant ou véhicule sur place, 50 %. Le droit de rétractation de 14 jours ne s'applique pas aux contrats de transport de biens ni aux services exécutés à une date convenue (articles L221-2 et L221-28 du code de la consommation). Le barème complet figure sur la page « Annulation, retour et remboursement ».",
      en: "Cancellation is free up to 24 hours before the pickup slot. Between 24 and 4 hours before, 20% of the amount is retained; less than 4 hours before, or with the vehicle on site, 50%. The 14-day right of withdrawal does not apply to contracts for the carriage of goods or to services performed on an agreed date (Articles L221-2 and L221-28 of the French Consumer Code). The full scale is on the “Cancellation, return and refund” page.",
    },
  },
  {
    title: { fr: "10. Données personnelles", en: "10. Personal data" },
    body: {
      fr: "Le traitement des données du client est décrit dans la politique de confidentialité accessible depuis chaque page du site. Aucune donnée n'est revendue.",
      en: "The processing of customer data is described in the privacy policy accessible from every page of the site. No data is resold.",
    },
  },
  {
    title: { fr: "11. Droit applicable et médiation", en: "11. Governing law and mediation" },
    body: {
      fr: `Les présentes conditions sont soumises au droit français. Toute réclamation est d'abord adressée à ${CONTACT.email}. À défaut d'accord sous 30 jours, le consommateur peut saisir gratuitement un médiateur de la consommation ; à défaut de résolution amiable, les tribunaux français compétents sont saisis.`,
      en: `These terms are governed by French law. Any complaint is first sent to ${CONTACT.email}. Failing agreement within 30 days, consumers may refer the matter free of charge to a consumer mediator; failing an amicable resolution, the competent French courts have jurisdiction.`,
    },
  },
];
