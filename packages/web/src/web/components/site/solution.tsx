import { Link } from "wouter";
import {
  BadgeEuro,
  CheckCircle2,
  FileText,
  Minus,
  MessageCircle,
  PhoneOff,
  Receipt,
  ScanSearch,
  ShieldCheck,
  ShieldQuestion,
  Truck,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import type { Bi } from "../../lib/i18n";
import { CONTACT, whatsappLink } from "../../lib/format";
import { Card, Section, SectionHead } from "./section";
import { Reveal } from "./reveal";

interface Pain {
  icon: LucideIcon;
  problem: Bi;
  detail: Bi;
  answer: Bi;
}

const PAINS: Pain[] = [
  {
    icon: PhoneOff,
    problem: {
      fr: "Personne à qui parler quand ça coince",
      en: "Nobody to talk to when things go wrong",
    },
    detail: {
      fr: "Chez les grands réseaux, un colis en retard se règle par un formulaire, un robot de chat et un numéro surtaxé. Personne ne connaît votre dossier.",
      en: "With the big networks, a late parcel means a web form, a chatbot and a premium-rate number. Nobody actually knows your case.",
    },
    answer: {
      fr: "Un seul interlocuteur, joignable directement sur WhatsApp et au téléphone. C'est la personne qui a organisé votre envoi qui vous répond.",
      en: "One single contact, reachable directly on WhatsApp and by phone. The person who organised your shipment is the one who answers.",
    },
  },
  {
    icon: ScanSearch,
    problem: {
      fr: "« Retard douanier » sans autre explication",
      en: "“Customs delay” and nothing more",
    },
    detail: {
      fr: "Un statut bloqué pendant deux semaines, aucune date, aucune raison. Vous ne savez pas si le colis est à Roissy, dans un avion ou perdu.",
      en: "A status frozen for two weeks, no date, no reason. You have no idea whether the parcel is at the airport, on a plane, or lost.",
    },
    answer: {
      fr: "Chaque étape est horodatée et nommée dans votre suivi, avec une notification e-mail à chaque changement. En cas d'incident, on vous dit ce qui se passe et ce qu'on fait.",
      en: "Every step is timestamped and named in your tracking, with an email notification at each change. If something goes wrong, we tell you what happened and what we are doing.",
    },
  },
  {
    icon: BadgeEuro,
    problem: {
      fr: "Un prix « au carton », négocié à l'oral",
      en: "A price “per box”, agreed verbally",
    },
    detail: {
      fr: "Dans l'envoi communautaire vers l'Afrique, le tarif dépend de la taille du carton et de la personne en face. Le supplément tombe souvent au moment du départ.",
      en: "In community shipping to Africa, the rate depends on the box size and on who you talk to. The extra charge usually appears at departure.",
    },
    answer: {
      fr: "Un devis chiffré ligne par ligne : transport, options, taxes. Le total affiché est celui que vous payez, aucun frais ajouté après validation.",
      en: "A quote itemised line by line: transport, options, taxes. The displayed total is what you pay, with nothing added after confirmation.",
    },
  },
  {
    icon: Receipt,
    problem: {
      fr: "Aucune facture, aucun justificatif",
      en: "No invoice, no paper trail",
    },
    detail: {
      fr: "Un paiement en espèces ou par lien personnel, sans reçu : impossible de comptabiliser l'envoi, impossible de prouver quoi que ce soit.",
      en: "A cash payment or a personal payment link, no receipt: you cannot book the cost, and you cannot prove anything.",
    },
    answer: {
      fr: "Facture numérotée avec TVA à 20 %, disponible dans votre espace client. Paiement par carte bancaire ou par virement, jamais en espèces.",
      en: "Numbered invoice with 20% VAT, available in your customer area. Payment by card or bank transfer, never in cash.",
    },
  },
  {
    icon: ShieldQuestion,
    problem: {
      fr: "Une assurance dont personne ne connaît le plafond",
      en: "Insurance nobody can quote a limit for",
    },
    detail: {
      fr: "« C'est assuré » : par qui, jusqu'à combien, avec quelle franchise ? Sans réponse écrite, vous n'êtes pas assuré, vous espérez.",
      en: "“It's insured”: by whom, up to how much, with what deductible? Without a written answer, you are not insured — you are hoping.",
    },
    answer: {
      fr: "Responsabilité civile professionnelle souscrite chez Simplis : biens confiés couverts jusqu'à 100 000 € par sinistre, franchise de 200 €. C'est écrit sur le site, pas promis au téléphone.",
      en: "Professional liability insurance with Simplis: goods entrusted covered up to €100,000 per claim, €200 deductible. It is written on the website, not promised over the phone.",
    },
  },
  {
    icon: FileText,
    problem: {
      fr: "Des conditions d'annulation introuvables",
      en: "Cancellation terms you cannot find",
    },
    detail: {
      fr: "Vous annulez la veille et vous découvrez la retenue au moment du remboursement — ou vous ne la découvrez jamais parce qu'il n'y a rien d'écrit.",
      en: "You cancel the day before and discover the fee at refund time — or never discover it, because nothing was written down.",
    },
    answer: {
      fr: "Le barème d'annulation et les délais cibles sont publiés en clair, avant la commande. Si l'annulation vient de nous, vous ne payez rien.",
      en: "The cancellation scale and target lead times are published in plain language, before you order. If we cancel, you pay nothing.",
    },
  },
];

type Mark = "yes" | "no" | "partial";

interface Row {
  criterion: Bi;
  major: { mark: Mark; text: Bi };
  informal: { mark: Mark; text: Bi };
  lbg: { mark: Mark; text: Bi };
}

const ROWS: Row[] = [
  {
    criterion: { fr: "Prix connu avant l'envoi", en: "Price known before shipping" },
    major: { mark: "partial", text: { fr: "Grille en ligne, surcharges variables", en: "Online grid, variable surcharges" } },
    informal: { mark: "partial", text: { fr: "Au carton, négocié à l'oral", en: "Per box, agreed verbally" } },
    lbg: { mark: "yes", text: { fr: "Devis détaillé, total ferme", en: "Itemised quote, firm total" } },
  },
  {
    criterion: { fr: "Facture numérotée avec TVA", en: "Numbered invoice with VAT" },
    major: { mark: "yes", text: { fr: "Oui", en: "Yes" } },
    informal: { mark: "no", text: { fr: "Rarement", en: "Rarely" } },
    lbg: { mark: "yes", text: { fr: "Oui, dans l'espace client", en: "Yes, in your customer area" } },
  },
  {
    criterion: { fr: "Assurance nommée et chiffrée", en: "Named insurance with a stated limit" },
    major: { mark: "partial", text: { fr: "Plafonds au kilo, conventions internationales", en: "Per-kilo caps, international conventions" } },
    informal: { mark: "no", text: { fr: "Le plus souvent aucune", en: "Usually none" } },
    lbg: { mark: "yes", text: { fr: "Simplis, jusqu'à 100 000 € par sinistre", en: "Simplis, up to €100,000 per claim" } },
  },
  {
    criterion: { fr: "Suivi en ligne", en: "Online tracking" },
    major: { mark: "yes", text: { fr: "Oui", en: "Yes" } },
    informal: { mark: "no", text: { fr: "Messages WhatsApp au coup par coup", en: "Ad-hoc WhatsApp messages" } },
    lbg: { mark: "yes", text: { fr: "Oui, sans créer de compte", en: "Yes, no account needed" } },
  },
  {
    criterion: { fr: "Interlocuteur humain identifié", en: "A named human to talk to" },
    major: { mark: "no", text: { fr: "Centre d'appels, dossier anonyme", en: "Call centre, anonymous ticket" } },
    informal: { mark: "yes", text: { fr: "Oui, c'est leur force", en: "Yes — their real strength" } },
    lbg: { mark: "yes", text: { fr: "Un seul, sur WhatsApp et au téléphone", en: "One, on WhatsApp and by phone" } },
  },
  {
    criterion: { fr: "Enlèvement à votre adresse", en: "Pickup at your address" },
    major: { mark: "partial", text: { fr: "Option payante, créneau large", en: "Paid option, wide time slot" } },
    informal: { mark: "partial", text: { fr: "Variable, souvent dépôt à un local", en: "Varies, often drop-off at a shop" } },
    lbg: { mark: "yes", text: { fr: "Inclus en Île-de-France", en: "Included across Greater Paris" } },
  },
  {
    criterion: { fr: "Paiement encadré", en: "Regulated payment" },
    major: { mark: "yes", text: { fr: "Carte bancaire", en: "Card payment" } },
    informal: { mark: "no", text: { fr: "Espèces ou lien personnel", en: "Cash or personal payment link" } },
    lbg: { mark: "yes", text: { fr: "Carte via myPOS ou virement", en: "Card via myPOS or bank transfer" } },
  },
  {
    criterion: { fr: "Conditions d'annulation publiées", en: "Published cancellation terms" },
    major: { mark: "partial", text: { fr: "Dans des CGV de trente pages", en: "Buried in thirty pages of terms" } },
    informal: { mark: "no", text: { fr: "Rien d'écrit", en: "Nothing in writing" } },
    lbg: { mark: "yes", text: { fr: "Barème en clair, page dédiée", en: "Plain-language scale, dedicated page" } },
  },
];

const MARK_STYLE: Record<Mark, { icon: LucideIcon; className: string }> = {
  yes: { icon: CheckCircle2, className: "text-success" },
  partial: { icon: Minus, className: "text-warning" },
  no: { icon: XCircle, className: "text-danger" },
};

function Cell({ mark, text, strong }: { mark: Mark; text: string; strong?: boolean }) {
  const style = MARK_STYLE[mark];
  return (
    <div className="flex gap-2">
      <style.icon className={`mt-0.5 size-4 shrink-0 ${style.className}`} aria-hidden="true" />
      <span className={strong ? "font-medium text-foreground" : "text-muted"}>{text}</span>
    </div>
  );
}

/** Bloc « problème → réponse » : le cœur du positionnement. */
export function ProblemSolution({ className }: { className?: string }) {
  const { t } = useI18n();

  return (
    <Section className={className}>
      <SectionHead
        eyebrow={t({ fr: "Pourquoi nous existons", en: "Why we exist" })}
        title={t({
          fr: "Le sérieux d'un transporteur, la proximité d'un voisin",
          en: "A carrier's rigour, a neighbour's proximity",
        })}
        lead={t({
          fr: "D'un côté les grands réseaux : outillés, mais injoignables et opaques dès que ça dérape. De l'autre l'envoi communautaire : humain et souple, mais sans facture, sans assurance nommée, sans suivi. Nous avons construit LBG Express Colis exactement entre les deux.",
          en: "On one side the big networks: well equipped, but unreachable and opaque the moment something slips. On the other, community shipping: human and flexible, but with no invoice, no named insurance, no tracking. We built LBG Express Colis precisely in between.",
        })}
      />

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PAINS.map((pain, i) => (
          <Reveal key={pain.problem.fr} delay={i * 60}>
            <Card className="flex h-full flex-col">
              <span className="grid size-11 place-items-center rounded-xl bg-danger/12 text-danger">
                <pain.icon className="size-5" />
              </span>
              <h3 className="mt-5 font-display text-base font-bold">{t(pain.problem)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(pain.detail)}</p>
              <div className="mt-5 flex gap-3 rounded-2xl border border-success/25 bg-success/[0.07] p-4">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
                <p className="text-sm leading-relaxed">{t(pain.answer)}</p>
              </div>
            </Card>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-10 flex flex-wrap items-center gap-3">
        <a
          href={whatsappLink(
            t({
              fr: "Bonjour, j'ai une question sur un envoi avant de commander.",
              en: "Hello, I have a question about a shipment before ordering.",
            }),
          )}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-primary-foreground transition hover:bg-primary-strong"
        >
          <MessageCircle className="size-4" />
          {t({ fr: "Poser ma question sur WhatsApp", en: "Ask on WhatsApp" })}
        </a>
        <a
          href={CONTACT.phoneHref}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-6 py-3.5 font-semibold transition hover:border-primary/50 hover:text-primary"
        >
          {CONTACT.phone}
        </a>
        <Link
          to="/livraison-delais"
          className="inline-flex items-center gap-2 px-2 py-3.5 text-sm font-semibold text-muted transition hover:text-primary"
        >
          {t({ fr: "Nos délais et nos limites, en clair", en: "Our lead times and limits, in plain words" })}
        </Link>
      </Reveal>
    </Section>
  );
}

/** Comparatif par catégorie d'acteur — aucun concurrent n'est nommé, volontairement. */
export function ComparisonTable({ className }: { className?: string }) {
  const { t } = useI18n();

  const headers = [
    { key: "criterion", label: t({ fr: "Ce qui compte vraiment", en: "What actually matters" }) },
    { key: "major", label: t({ fr: "Grand réseau international", en: "Large international network" }) },
    { key: "informal", label: t({ fr: "Envoi communautaire informel", en: "Informal community shipping" }) },
    { key: "lbg", label: "LBG Express Colis" },
  ];

  return (
    <Section className={className}>
      <SectionHead
        eyebrow={t({ fr: "Comparatif honnête", en: "An honest comparison" })}
        title={t({ fr: "Ce que chacun fait bien, et ce qui manque", en: "What each side does well, and what is missing" })}
        lead={t({
          fr: "Nous ne nommons personne et nous ne prétendons pas être meilleurs sur tout : un grand réseau reste imbattable sur le volume et le maillage mondial. Sur les trois choses que nous faisons — colis en Île-de-France, déménagement en Île-de-France, envoi vers le Bénin, le Togo et le Mali — voici la différence concrète.",
          en: "We name nobody and we do not claim to win on everything: a large network is unbeatable on volume and global reach. On the three things we do — parcels in Greater Paris, moving in Greater Paris, shipping to Benin, Togo and Mali — here is the concrete difference.",
        })}
      />

      <Reveal className="mt-12 overflow-x-auto rounded-card border border-border">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">
            {t({
              fr: "Comparaison des pratiques par catégorie d'acteur du transport",
              en: "Comparison of practices by category of transport provider",
            })}
          </caption>
          <thead>
            <tr className="bg-surface-2/70 text-left">
              {headers.map((h) => (
                <th
                  key={h.key}
                  scope="col"
                  className={`px-5 py-4 font-display text-sm font-bold ${
                    h.key === "lbg" ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.criterion.fr} className="border-t border-border align-top">
                <th scope="row" className="bg-surface/40 px-5 py-4 text-left font-semibold">
                  {t(row.criterion)}
                </th>
                <td className="px-5 py-4">
                  <Cell mark={row.major.mark} text={t(row.major.text)} />
                </td>
                <td className="px-5 py-4">
                  <Cell mark={row.informal.mark} text={t(row.informal.text)} />
                </td>
                <td className="bg-primary/[0.06] px-5 py-4">
                  <Cell mark={row.lbg.mark} text={t(row.lbg.text)} strong />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      <Reveal className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            icon: ShieldCheck,
            fr: "Assurance et statut vérifiables",
            en: "Verifiable status and insurance",
            descFr: "SIRET, TVA et garanties publiés sur le site. Vous pouvez tout vérifier avant de payer.",
            descEn: "Company number, VAT and guarantees published on the website. You can check everything before paying.",
            href: "/mentions-legales",
            linkFr: "Voir nos informations légales",
            linkEn: "See our legal information",
          },
          {
            icon: Truck,
            fr: "Délais écrits, sans promesse creuse",
            en: "Written lead times, no empty promise",
            descFr: "Colis en Île-de-France sous 24 à 48 h, déménagement sous 3 jours, aérien 5 à 10 jours, maritime 30 à 45 jours. Ce sont des délais cibles, et nous le disons.",
            descEn: "Parcels in Greater Paris within 24–48 h, moving within 3 days, air 5–10 days, sea 30–45 days. These are target lead times, and we say so.",
            href: "/livraison-delais",
            linkFr: "Détail des délais",
            linkEn: "Lead-time details",
          },
          {
            icon: FileText,
            fr: "Annulation et remboursement",
            en: "Cancellation and refund",
            descFr: "Gratuit à plus de 24 h de l'enlèvement, barème connu au-delà, et rien à payer si l'annulation vient de nous.",
            descEn: "Free more than 24 h before pickup, a known scale after that, and nothing to pay if we cancel.",
            href: "/annulation-remboursement",
            linkFr: "Lire le barème",
            linkEn: "Read the scale",
          },
        ].map((item) => (
          <Card key={item.fr} className="h-full">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/12 text-primary">
              <item.icon className="size-5" />
            </span>
            <h3 className="mt-4 font-display text-base font-bold">{t(item)}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{t({ fr: item.descFr, en: item.descEn })}</p>
            <Link to={item.href} className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">
              {t({ fr: item.linkFr, en: item.linkEn })}
            </Link>
          </Card>
        ))}
      </Reveal>
    </Section>
  );
}
