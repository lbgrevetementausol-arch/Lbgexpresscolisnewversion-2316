import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Devis / commandes (colis, palette, déménagement, international) */
export const quotes = sqliteTable("quotes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ref: text("ref").notNull().unique(),
  /** Numéro de commande à 4 chiffres communiqué au client (1000 → 9999). */
  orderNumber: text("order_number").unique(),
  kind: text("kind").notNull().default("colis"),
  service: text("service").notNull().default("standard"),
  zone: text("zone").notNull().default("france"),
  customerName: text("customer_name").notNull(),
  customerFirstName: text("customer_first_name"),
  customerLastName: text("customer_last_name"),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  company: text("company"),
  fromAddress: text("from_address").notNull(),
  toAddress: text("to_address").notNull(),
  weightKg: real("weight_kg"),
  lengthCm: real("length_cm"),
  widthCm: real("width_cm"),
  heightCm: real("height_cm"),
  volumeM3: real("volume_m3"),
  pieces: integer("pieces").default(1),
  floors: integer("floors").default(0),
  elevator: integer("elevator", { mode: "boolean" }).default(false),
  insurance: integer("insurance", { mode: "boolean" }).default(false),
  homePickup: integer("home_pickup", { mode: "boolean" }).default(false),
  packing: integer("packing", { mode: "boolean" }).default(false),
  fragile: integer("fragile", { mode: "boolean" }).default(false),
  declaredValue: real("declared_value"),
  goodsDescription: text("goods_description"),
  message: text("message"),
  priceCents: integer("price_cents").notNull(),
  breakdown: text("breakdown"),
  etaMin: integer("eta_min"),
  etaMax: integer("eta_max"),
  status: text("status").notNull().default("nouveau"),
  trackingNumber: text("tracking_number"),
  userId: text("user_id"),
  invoiceId: integer("invoice_id"),
  decision: text("decision"),
  decisionReason: text("decision_reason"),
  decidedAt: integer("decided_at", { mode: "timestamp" }),
  locale: text("locale").notNull().default("fr"),
  /** Relance panier abandonné n°1 : date d'envoi (vide = pas encore relancé). */
  reminder1SentAt: integer("reminder1_sent_at", { mode: "timestamp" }),
  /** Relance panier abandonné n°2 : date d'envoi. */
  reminder2SentAt: integer("reminder2_sent_at", { mode: "timestamp" }),
  /** Alerte commerciale interne envoyée pour un gros volume abandonné. */
  opsAbandonNotifiedAt: integer("ops_abandon_notified_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Notifications du back-office (nouvelle commande, paiement…) */
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  kind: text("kind").notNull().default("commande"),
  title: text("title").notNull(),
  body: text("body"),
  /** Référence du devis/commande concerné, pour ouvrir la fiche depuis la notification. */
  quoteRef: text("quote_ref"),
  orderNumber: text("order_number"),
  amountCents: integer("amount_cents"),
  customerName: text("customer_name"),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  readAt: integer("read_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Colis suivis (créés par un devis, par le back-office ou par l'API pro) */
export const trackings = sqliteTable("trackings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trackingNumber: text("tracking_number").notNull().unique(),
  quoteId: integer("quote_id"),
  recipientName: text("recipient_name"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  status: text("status").notNull().default("cree"),
  service: text("service").notNull().default("standard"),
  carrier: text("carrier").notNull().default("LBG Express"),
  externalCarrier: text("external_carrier"),
  weightKg: real("weight_kg"),
  eta: integer("eta", { mode: "timestamp" }),
  driverId: integer("driver_id"),
  source: text("source").notNull().default("site"),
  /** Date d'envoi de la demande d'avis Trustpilot (null = pas encore envoyée). */
  reviewRequestedAt: integer("review_requested_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Timeline d'événements d'un colis */
export const trackingEvents = sqliteTable("tracking_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trackingNumber: text("tracking_number").notNull(),
  status: text("status").notNull(),
  labelFr: text("label_fr").notNull(),
  labelEn: text("label_en").notNull(),
  location: text("location"),
  occurredAt: integer("occurred_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Positions GPS envoyées par les livreurs */
export const trackingLocations = sqliteTable("tracking_locations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trackingNumber: text("tracking_number").notNull(),
  driverId: integer("driver_id"),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  accuracy: real("accuracy"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Comptes livreurs (auth simple email + code) */
export const drivers = sqliteTable("drivers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  code: text("code").notNull(),
  vehicle: text("vehicle"),
  city: text("city"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  // — Compte livreur autonome (inscription depuis le site) —
  firstName: text("first_name"),
  lastName: text("last_name"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  plate: text("plate"),
  siret: text("siret"),
  passwordHash: text("password_hash"),
  /** Documents : clés de fichiers servies uniquement à l'admin authentifié. */
  licenseKey: text("license_key"),
  idPhotoKey: text("id_photo_key"),
  vehicleDocKey: text("vehicle_doc_key"),
  /** Vérification de l'adresse e-mail par code à 6 chiffres. */
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  verifyCode: text("verify_code"),
  verifyExpiresAt: integer("verify_expires_at", { mode: "timestamp" }),
  /** Réinitialisation de mot de passe. */
  resetToken: text("reset_token"),
  resetExpiresAt: integer("reset_expires_at", { mode: "timestamp" }),
  /** Validation des documents par l'administration : en_attente | valide | refuse. */
  approvalStatus: text("approval_status").notNull().default("valide"),
  approvalNote: text("approval_note"),
  approvedAt: integer("approved_at", { mode: "timestamp" }),
  /** Le livreur se déclare disponible pour recevoir des courses. */
  available: integer("available", { mode: "boolean" }).notNull().default(false),
  availableSince: integer("available_since", { mode: "timestamp" }),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
});

/** Courses publiées à tous les livreurs disponibles — premier arrivé, premier servi. */
export const jobOffers = sqliteTable("job_offers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  trackingNumber: text("tracking_number").notNull().unique(),
  quoteRef: text("quote_ref"),
  service: text("service"),
  kind: text("kind"),
  pickupAddress: text("pickup_address").notNull(),
  dropAddress: text("drop_address").notNull(),
  recipientName: text("recipient_name"),
  recipientPhone: text("recipient_phone"),
  weightKg: real("weight_kg"),
  volumeM3: real("volume_m3"),
  payoutCents: integer("payout_cents"),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  /** ouverte | attribuee | annulee */
  status: text("status").notNull().default("ouverte"),
  acceptedDriverId: integer("accepted_driver_id"),
  acceptedAt: integer("accepted_at", { mode: "timestamp" }),
  notifiedCount: integer("notified_count").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Courses assignées à un livreur */
export const driverJobs = sqliteTable("driver_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  driverId: integer("driver_id").notNull(),
  trackingNumber: text("tracking_number").notNull(),
  pickupAddress: text("pickup_address").notNull(),
  dropAddress: text("drop_address").notNull(),
  recipientName: text("recipient_name"),
  recipientPhone: text("recipient_phone"),
  scheduledAt: integer("scheduled_at", { mode: "timestamp" }),
  status: text("status").notNull().default("a_recuperer"),
  payoutCents: integer("payout_cents"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Paiements enregistrés sur un devis */
export const payments = sqliteTable("payments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  quoteRef: text("quote_ref").notNull(),
  provider: text("provider").notNull().default("virement"),
  amountCents: integer("amount_cents").notNull(),
  status: text("status").notNull().default("en_attente"),
  reference: text("reference"),
  payerEmail: text("payer_email"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Clés API du module pro */
export const apiKeys = sqliteTable("api_keys", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  key: text("key").notNull().unique(),
  revoked: integer("revoked", { mode: "boolean" }).notNull().default(false),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Webhooks pro (signature HMAC) */
export const webhooks = sqliteTable("webhooks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  url: text("url").notNull(),
  secret: text("secret").notNull(),
  events: text("events").notNull().default("tracking.updated"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  lastStatus: text("last_status"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Messages du formulaire de contact / aide */
export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  handled: integer("handled", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Candidatures transporteurs partenaires */
export const carrierApplications = sqliteTable("carrier_applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  vehicle: text("vehicle").notNull(),
  capacityM3: real("capacity_m3"),
  siret: text("siret"),
  message: text("message"),
  status: text("status").notNull().default("nouveau"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export * from "./auth-schema";

/** Factures pro numérotées (FA-AAAA-NNNN) */
export const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  number: text("number").notNull().unique(),
  quoteRef: text("quote_ref"),
  userId: text("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerCompany: text("customer_company"),
  customerAddress: text("customer_address"),
  subject: text("subject").notNull().default("Prestation de transport"),
  subtotalCents: integer("subtotal_cents").notNull().default(0),
  vatRate: real("vat_rate").notNull().default(20),
  vatCents: integer("vat_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  currency: text("currency").notNull().default("EUR"),
  status: text("status").notNull().default("en_attente_paiement"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  dueAt: integer("due_at", { mode: "timestamp" }),
  notes: text("notes"),
  locale: text("locale").notNull().default("fr"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Lignes de détail d'une facture */
export const invoiceItems = sqliteTable("invoice_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  invoiceId: integer("invoice_id").notNull(),
  label: text("label").notNull(),
  detail: text("detail"),
  quantity: real("quantity").notNull().default(1),
  unit: text("unit").notNull().default("forfait"),
  unitPriceCents: integer("unit_price_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull().default(0),
  position: integer("position").notNull().default(0),
});

/** Réglages du site pilotables depuis le back-office (clé/valeur) */
export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  group: text("group").notNull().default("general"),
  label: text("label"),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Journal des actions admin */
export const auditLog = sqliteTable("audit_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id"),
  userEmail: text("user_email"),
  action: text("action").notNull(),
  target: text("target"),
  detail: text("detail"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

/** Leads issus du chat / auto-répondeur WhatsApp */
export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  name: text("name"),
  source: text("source").notNull().default("popup"),
  locale: text("locale").notNull().default("fr"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const chatLeads = sqliteTable("chat_leads", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  topic: text("topic").notNull().default("general"),
  transcript: text("transcript"),
  channel: text("channel").notNull().default("site_chat"),
  locale: text("locale").notNull().default("fr"),
  handled: integer("handled", { mode: "boolean" }).notNull().default(false),
  forwardedAt: integer("forwarded_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
