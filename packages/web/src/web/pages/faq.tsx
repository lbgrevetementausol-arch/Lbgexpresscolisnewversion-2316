import { useState } from "react";
import { Link } from "wouter";
import { ChevronDown, MessageCircle } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { CONTACT, whatsappLink } from "../lib/format";
import { PageHero } from "../components/site/layout";
import { Section, SectionHead } from "../components/site/section";
import { cn } from "@/lib/utils";

interface Qa {
  q: { fr: string; en: string };
  a: { fr: string; en: string };
}

const GROUPS: { title: { fr: string; en: string }; items: Qa[] }[] = [
  {
    title: { fr: "Commande et tarifs", en: "Orders and pricing" },
    items: [
      {
        q: { fr: "Le prix affiché est-il définitif ?", en: "Is the displayed price final?" },
        a: {
          fr: "Oui, tant que les informations déclarées sont exactes (poids, dimensions, volume, étages). Si l'écart constaté à l'enlèvement est significatif, nous vous prévenons avant de charger et vous validez le nouveau montant.",
          en: "Yes, as long as the declared information is accurate (weight, dimensions, volume, floors). If the difference found at pickup is significant, we notify you before loading and you approve the new amount.",
        },
      },
      {
        q: { fr: "Comment est calculé le poids taxable ?", en: "How is the chargeable weight calculated?" },
        a: {
          fr: "Nous retenons le plus élevé entre le poids réel et le poids volumétrique, calculé sur la base de 1 m³ = 200 kg. Un colis léger mais encombrant est donc facturé au volume.",
          en: "We use the higher of actual weight and volumetric weight, based on 1 m³ = 200 kg. A light but bulky parcel is therefore charged by volume.",
        },
      },
      {
        q: { fr: "Quels moyens de paiement acceptez-vous ?", en: "Which payment methods do you accept?" },
        a: {
          fr: "Carte bancaire, virement, PayPal et espèces à l'enlèvement. Le virement place la commande en attente jusqu'à réception des fonds ; les autres moyens la confirment immédiatement.",
          en: "Card, bank transfer, PayPal and cash on pickup. A bank transfer keeps the order pending until funds arrive; other methods confirm it immediately.",
        },
      },
      {
        q: { fr: "Puis-je annuler ou reporter un enlèvement ?", en: "Can I cancel or postpone a pickup?" },
        a: {
          fr: "Sans frais jusqu'à 12 h avant le créneau. Passé ce délai, un forfait de déplacement peut s'appliquer si le véhicule est déjà engagé.",
          en: "Free of charge up to 12 hours before the slot. After that, a call-out fee may apply if the vehicle is already committed.",
        },
      },
    ],
  },
  {
    title: { fr: "Livraison et suivi", en: "Delivery and tracking" },
    items: [
      {
        q: { fr: "Où trouver mon numéro de suivi ?", en: "Where do I find my tracking number?" },
        a: {
          fr: "Il est généré dès la validation de la commande, au format TRK-AAAAMMJJ-XXXXXX, affiché sur la page de confirmation et envoyé par email. Vous le saisissez ensuite sur la page Suivi.",
          en: "It is generated as soon as your order is confirmed, in the format TRK-YYYYMMDD-XXXXXX, shown on the confirmation page and sent by email. You then enter it on the Tracking page.",
        },
      },
      {
        q: { fr: "Le destinataire est absent, que se passe-t-il ?", en: "What if the recipient is away?" },
        a: {
          fr: "Le livreur appelle, puis laisse un avis de passage. Une seconde présentation est planifiée sous 48 h ; au-delà, le colis est mis à disposition en agence ou retourné à l'expéditeur.",
          en: "The driver calls, then leaves a delivery notice. A second attempt is scheduled within 48 hours; after that, the parcel waits at our depot or is returned to the sender.",
        },
      },
      {
        q: { fr: "Puis-je voir la position du livreur ?", en: "Can I see the driver's position?" },
        a: {
          fr: "Oui. Dès que le colis est pris en charge, la dernière position GPS transmise par le livreur s'affiche sur la page de suivi, avec l'heure du relevé.",
          en: "Yes. As soon as the parcel is picked up, the driver's latest GPS position appears on the tracking page, with the timestamp.",
        },
      },
    ],
  },
  {
    title: { fr: "International et douanes", en: "International and customs" },
    items: [
      {
        q: { fr: "Quels documents pour un envoi hors UE ?", en: "Which documents for a non-EU shipment?" },
        a: {
          fr: "Une facture commerciale et une liste de colisage, que nous préparons avec vous à partir de la description du contenu et de la valeur déclarée. Une pièce d'identité du destinataire peut être demandée à la remise.",
          en: "A commercial invoice and a packing list, which we prepare with you from the contents description and declared value. Recipient ID may be required at handover.",
        },
      },
      {
        q: { fr: "Les droits de douane sont-ils inclus ?", en: "Are customs duties included?" },
        a: {
          fr: "Le transport, la documentation et le dédouonnement sont inclus dans le prix. Les droits et taxes locaux éventuels restent à la charge du destinataire, selon la réglementation du pays.",
          en: "Transport, documentation and clearance are included in the price. Any local duties and taxes remain payable by the recipient, according to the destination country's rules.",
        },
      },
      {
        q: { fr: "Quels objets sont interdits ?", en: "Which items are prohibited?" },
        a: {
          fr: "Espèces, or, armes, stupéfiants, produits inflammables ou explosifs, animaux vivants, denrées périssables non conditionnées, contrefaçons. En cas de doute, demandez-nous avant l'envoi.",
          en: "Cash, gold, weapons, narcotics, flammable or explosive goods, live animals, unpackaged perishables, counterfeit items. If in doubt, ask us before shipping.",
        },
      },
    ],
  },
  {
    title: { fr: "Litiges et assurance", en: "Claims and insurance" },
    items: [
      {
        q: { fr: "Mon colis est abîmé, que faire ?", en: "My parcel is damaged, what should I do?" },
        a: {
          fr: "Émettez des réserves précises sur le bon de livraison, photographiez le colis et écrivez-nous sous 3 jours ouvrés. Nous instruisons le dossier et vous répondons sous 5 jours.",
          en: "Write precise reservations on the delivery note, photograph the parcel and email us within 3 working days. We open the file and reply within 5 days.",
        },
      },
      {
        q: { fr: "Que couvre l'assurance ad valorem ?", en: "What does ad valorem insurance cover?" },
        a: {
          fr: "La valeur déclarée du contenu en cas de perte, vol ou avaries, pour 1,2 % du montant déclaré. Sans elle, l'indemnisation reste plafonnée au barème légal du transport (au kilo).",
          en: "The declared value of the contents in case of loss, theft or damage, for 1.2% of the declared amount. Without it, compensation stays capped at the statutory per-kilo transport scale.",
        },
      },
    ],
  },
];

function Accordion({ items }: { items: Qa[] }) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border overflow-hidden rounded-card border border-border">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q.fr}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 bg-surface-2/40 px-5 py-4 text-left transition hover:bg-surface-2"
              aria-expanded={isOpen}
            >
              <span className="font-medium">{t(item.q)}</span>
              <ChevronDown
                className={cn("size-4 shrink-0 text-primary transition-transform", isOpen && "rotate-180")}
              />
            </button>
            {isOpen ? (
              <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{t(item.a)}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

export default function FaqPage() {
  const { t } = useI18n();
  useSeo(SEO_ROUTES["/faq"]);

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title={t({ fr: "Vos questions, nos réponses", en: "Your questions, answered" })}
        lead={t({
          fr: "Tarifs, délais, douanes, litiges : l'essentiel est ici. Si votre cas est particulier, écrivez-nous, nous répondons vite.",
          en: "Pricing, lead times, customs, claims: the essentials are here. If your case is specific, write to us — we answer fast.",
        })}
      />

      <Section>
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr] lg:items-start">
          <div className="space-y-12">
            {GROUPS.map((group) => (
              <div key={group.title.fr}>
                <SectionHead title={t(group.title)} className="max-w-none" />
                <div className="mt-6">
                  <Accordion items={group.items} />
                </div>
              </div>
            ))}
          </div>

          <div className="glass rounded-card p-6 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-bold">
              {t({ fr: "Toujours bloqué ?", en: "Still stuck?" })}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {t({
                fr: "Notre équipe répond du lundi au samedi, de 8 h à 20 h. Le plus rapide reste WhatsApp.",
                en: "Our team answers Monday to Saturday, 8 am to 8 pm. WhatsApp is the fastest route.",
              })}
            </p>
            <a
              href={whatsappLink(t({ fr: "Bonjour, j'ai une question sur mon envoi", en: "Hello, I have a question about my shipment" }))}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-strong"
            >
              <MessageCircle className="size-4" />
              WhatsApp
            </a>
            <a
              href={CONTACT.phoneHref}
              className="mt-3 block rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-muted transition hover:border-primary/50 hover:text-foreground"
            >
              {CONTACT.phone}
            </a>
            <Link
              to="/aide"
              className="mt-3 block rounded-xl border border-border px-4 py-3 text-center text-sm font-medium text-muted transition hover:border-primary/50 hover:text-foreground"
            >
              {t({ fr: "Formulaire de contact", en: "Contact form" })}
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
