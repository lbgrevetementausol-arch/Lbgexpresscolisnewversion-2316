/**
 * Seed du back-office : compte admin, réglages du site, factures de démo.
 * Exécution : cd packages/web && bun --env-file=../../.env src/api/database/seed-admin.ts
 * Idempotent : ne recrée pas ce qui existe déjà.
 */
import { eq } from "drizzle-orm";
import { auth } from "../auth";
import { createInvoice } from "../lib/invoicing";
import { db } from "./__client";
import * as schema from "./schema";

const ADMIN_EMAIL = "admin@lbgexpresscolis.fr";
const ADMIN_PASSWORD = "LbgAdmin2026!";
const CLIENT_EMAIL = "client.demo@lbgexpresscolis.fr";
const CLIENT_PASSWORD = "LbgClient2026!";

async function ensureUser(opts: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "client";
  phone?: string;
  company?: string;
  mustChangePassword: boolean;
}) {
  const [existing] = await db.select().from(schema.user).where(eq(schema.user.email, opts.email)).limit(1);
  if (existing) {
    await db
      .update(schema.user)
      .set({ role: opts.role, accountStatus: "actif" })
      .where(eq(schema.user.id, existing.id));
    return existing.id;
  }
  await auth.api.signUpEmail({
    body: { email: opts.email, password: opts.password, name: opts.name },
  });
  const [created] = await db.select().from(schema.user).where(eq(schema.user.email, opts.email)).limit(1);
  if (!created) throw new Error(`Création du compte ${opts.email} impossible`);
  await db
    .update(schema.user)
    .set({
      role: opts.role,
      accountStatus: "actif",
      emailVerified: true,
      phone: opts.phone ?? null,
      company: opts.company ?? null,
      mustChangePassword: opts.mustChangePassword,
    })
    .where(eq(schema.user.id, created.id));
  return created.id;
}

const SETTINGS: { key: string; value: string; group: string; label: string }[] = [
  { key: "contact.phone", value: "+33 6 95 09 86 88", group: "contact", label: "Téléphone / WhatsApp" },
  { key: "contact.email", value: "contact@lbgexpresscolis.fr", group: "contact", label: "E-mail" },
  { key: "contact.hours", value: "Lun-Sam 8h-20h", group: "contact", label: "Horaires" },
  { key: "hero.title.fr", value: "Vos colis livrés partout, sans mauvaise surprise", group: "contenu", label: "Titre accueil (FR)" },
  {
    key: "hero.subtitle.fr",
    value: "Colis, palettes, fret international et déménagement — devis en 10 secondes, suivi en temps réel.",
    group: "contenu",
    label: "Sous-titre accueil (FR)",
  },
  { key: "banner.message.fr", value: "", group: "contenu", label: "Bandeau d'annonce (FR, vide = masqué)" },
  { key: "pricing.multiplier", value: "1", group: "tarifs", label: "Coefficient global des tarifs" },
  { key: "pricing.vatRate", value: "20", group: "tarifs", label: "Taux de TVA (%)" },
  { key: "payment.mypos", value: "https://mypos.com/@lbgrevetement", group: "paiement", label: "Lien de paiement MyPOS" },
  {
    key: "payment.transferNotice.fr",
    value: "Pour un paiement par virement bancaire, contactez-nous : nous vous transmettons nos coordonnées bancaires.",
    group: "paiement",
    label: "Mention virement (FR)",
  },
];

async function main() {
  const adminId = await ensureUser({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: "Administration LBG",
    role: "admin",
    phone: "+33 6 95 09 86 88",
    company: "LBG Express Colis",
    mustChangePassword: true,
  });
  const clientId = await ensureUser({
    email: CLIENT_EMAIL,
    password: CLIENT_PASSWORD,
    name: "Claire Dupont",
    role: "client",
    phone: "+33 6 11 22 33 44",
    company: "Atelier Dupont",
    mustChangePassword: false,
  });

  for (const entry of SETTINGS) {
    await db
      .insert(schema.siteSettings)
      .values({ ...entry, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: schema.siteSettings.key,
        set: { group: entry.group, label: entry.label, updatedAt: new Date() },
      });
  }

  const existingInvoices = await db.select().from(schema.invoices).limit(1);
  if (existingInvoices.length === 0) {
    const first = await createInvoice({
      customerName: "Claire Dupont",
      customerEmail: CLIENT_EMAIL,
      customerPhone: "+33 6 11 22 33 44",
      customerCompany: "Atelier Dupont",
      customerAddress: "18 rue de la Roquette, 75011 Paris",
      userId: clientId,
      subject: "Transport France — 3 colis",
      items: [
        {
          label: "Transport France métropolitaine — service Standard",
          detail: "Paris 11e → Bordeaux · 3 colis · 24 kg",
          unitPriceCents: 8400,
        },
        { label: "Assurance ad valorem", detail: "Valeur déclarée 900 €", unitPriceCents: 1350 },
      ],
    });

    const second = await createInvoice({
      customerName: "Studio Vertigo",
      customerEmail: "compta@studiovertigo.fr",
      customerCompany: "Studio Vertigo SARL",
      customerAddress: "9 quai Saint-Antoine, 69002 Lyon",
      subject: "Déménagement Lyon → Bruxelles",
      items: [
        { label: "Déménagement international 32 m³", detail: "Lyon → Bruxelles · 2 étages sans ascenseur", unitPriceCents: 264000 },
        { label: "Emballage professionnel", quantity: 1, unitPriceCents: 42000 },
      ],
    });
    await db
      .update(schema.invoices)
      .set({ status: "payee", paymentMethod: "carte_mypos", paymentReference: "MYPOS-DEMO-0001", paidAt: new Date() })
      .where(eq(schema.invoices.id, second.invoice.id));

    console.log("Factures de démo :", first.invoice.number, second.invoice.number);
  }

  const existingLeads = await db.select().from(schema.chatLeads).limit(1);
  if (existingLeads.length === 0) {
    await db.insert(schema.chatLeads).values([
      {
        name: "Karim B.",
        phone: "+33 7 58 41 02 66",
        topic: "tarifs",
        transcript: "Chat : tarif pour 2 palettes Paris → Casablanca ?",
        channel: "site_chat",
      },
      {
        name: "Aline",
        phone: "+33 6 74 19 55 21",
        topic: "suivi",
        transcript: "Chat : où est mon colis TRK-20260824-DEMO01 ?",
        channel: "whatsapp",
        handled: true,
      },
    ]);
  }

  console.log("Admin :", ADMIN_EMAIL, "/", ADMIN_PASSWORD, "(mot de passe à changer à la 1re connexion)");
  console.log("Client démo :", CLIENT_EMAIL, "/", CLIENT_PASSWORD);
  console.log("adminId:", adminId);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
