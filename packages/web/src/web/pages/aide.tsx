import { useState } from "react";
import { Link } from "wouter";
import { CheckCircle2, Clock, Loader2, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { useSeo } from "../lib/seo";
import { SEO_ROUTES } from "../lib/seo-routes";
import { CONTACT, whatsappLink } from "../lib/format";
import { PageHero } from "../components/site/layout";
import { Card, Section } from "../components/site/section";
import { Field, Input, Select, Textarea } from "../components/site/field";
import { trackContact } from "../lib/pixels";
import { useSendContact } from "../queries/content";

const SUBJECTS = [
  { fr: "Question sur un devis", en: "Question about a quote" },
  { fr: "Suivi de colis", en: "Parcel tracking" },
  { fr: "Réclamation / litige", en: "Claim / dispute" },
  { fr: "Compte professionnel & API", en: "Business account & API" },
  { fr: "Déménagement", en: "Moving" },
  { fr: "Autre demande", en: "Other request" },
];

export default function AidePage() {
  const { t } = useI18n();
  const send = useSendContact();
  useSeo(SEO_ROUTES["/aide"]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]!.fr);
  const [message, setMessage] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    send.mutate(
      { name, email, phone: phone || undefined, subject, message },
      { onSuccess: () => trackContact({ content_name: subject }) },
    );
  };

  return (
    <>
      <PageHero
        eyebrow={t({ fr: "Aide & contact", en: "Help & contact" })}
        title={t({ fr: "Parlons de votre envoi", en: "Let's talk about your shipment" })}
        lead={t({
          fr: "Une équipe joignable du lundi au samedi, de 8 h à 20 h. Réponse sous 2 h ouvrées en moyenne.",
          en: "A team available Monday to Saturday, 8 am to 8 pm. Average reply time: 2 working hours.",
        })}
        image="/images/livraison-2.jpg"
      />

      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <Card hover={false}>
            <h2 className="font-display text-xl font-bold">
              {t({ fr: "Écrivez-nous", en: "Write to us" })}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {t({
                fr: "Plus votre message est précis (numéro TRK, adresses, dates), plus notre réponse sera utile.",
                en: "The more precise your message (TRK number, addresses, dates), the more useful our reply.",
              })}
            </p>

            {send.isSuccess ? (
              <div className="mt-6 rounded-card border border-success/40 bg-success/10 p-5">
                <p className="flex items-center gap-2 font-semibold text-success">
                  <CheckCircle2 className="size-5" />
                  {t({ fr: "Message envoyé", en: "Message sent" })}
                </p>
                <p className="mt-2 text-sm text-muted">
                  {t({
                    fr: "Nous revenons vers vous par email très vite. Pour une urgence, WhatsApp reste le plus rapide.",
                    en: "We'll get back to you by email shortly. For anything urgent, WhatsApp is fastest.",
                  })}
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field label={t({ fr: "Nom et prénom", en: "Full name" })}>
                  <Input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Field>
                <Field label={t({ fr: "Téléphone (optionnel)", en: "Phone (optional)" })}>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 …" />
                </Field>
                <Field label={t({ fr: "Sujet", en: "Subject" })}>
                  <Select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    {SUBJECTS.map((s) => (
                      <option key={s.fr} value={s.fr}>
                        {t(s)}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field className="sm:col-span-2" label={t({ fr: "Votre message", en: "Your message" })}>
                  <Textarea
                    required
                    minLength={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-40"
                    placeholder={t({
                      fr: "Ex. Mon colis TRK-20260824-XXXXXX doit être livré à Lyon, puis-je décaler au samedi ?",
                      en: "e.g. My parcel TRK-20260824-XXXXXX is going to Lyon, can we move it to Saturday?",
                    })}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={send.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:bg-primary-strong disabled:opacity-60"
                  >
                    {send.isPending ? <Loader2 className="size-5 animate-spin" /> : t({ fr: "Envoyer", en: "Send" })}
                  </button>
                  {send.isError ? (
                    <p className="mt-3 text-sm text-danger">
                      {t({
                        fr: "L'envoi a échoué. Vérifiez l'email et la longueur du message.",
                        en: "Sending failed. Check the email and the message length.",
                      })}
                    </p>
                  ) : null}
                </div>
              </form>
            )}
          </Card>

          <div className="space-y-4">
            <Card hover={false}>
              <h3 className="font-display text-base font-bold">
                {t({ fr: "Contact direct", en: "Direct contact" })}
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li>
                  <a href={CONTACT.phoneHref} className="flex items-center gap-3 text-muted transition hover:text-primary">
                    <Phone className="size-4 text-primary" />
                    {CONTACT.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={whatsappLink(t({ fr: "Bonjour, j'ai besoin d'aide", en: "Hello, I need some help" }))}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 text-muted transition hover:text-primary"
                  >
                    <MessageCircle className="size-4 text-primary" />
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="flex items-center gap-3 text-muted transition hover:text-primary"
                  >
                    <Mail className="size-4 text-primary" />
                    {CONTACT.email}
                  </a>
                </li>
                <li>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">
                    {t({ fr: "Nous suivre", en: "Follow us" })}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {[
                      { href: CONTACT.instagram, label: "Instagram" },
                      { href: CONTACT.facebook, label: "Facebook" },
                      { href: CONTACT.tiktok, label: "TikTok" },
                    ].map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-border px-3 py-1.5 text-xs text-muted transition hover:border-primary hover:text-primary"
                      >
                        {s.label}
                      </a>
                    ))}
                  </div>
                </li>
                <li className="flex items-center gap-3 text-muted">
                  <Clock className="size-4 text-primary" />
                  {t({ fr: "Lun – Sam, 8 h – 20 h", en: "Mon – Sat, 8 am – 8 pm" })}
                </li>
                <li className="flex items-start gap-3 text-muted">
                  <MapPin className="mt-0.5 size-4 text-primary" />
                  {t({
                    fr: "Île-de-France — interventions dans toute la France et à l'international",
                    en: "Greater Paris — operating across France and internationally",
                  })}
                </li>
              </ul>
            </Card>

            <Card hover={false}>
              <h3 className="font-display text-base font-bold">
                {t({ fr: "Réponses immédiates", en: "Instant answers" })}
              </h3>
              <div className="mt-4 grid gap-2 text-sm">
                <Link
                  to="/suivi"
                  className="rounded-xl border border-border px-4 py-2.5 text-muted transition hover:border-primary/50 hover:text-foreground"
                >
                  {t({ fr: "Suivre mon colis", en: "Track my parcel" })}
                </Link>
                <Link
                  to="/faq"
                  className="rounded-xl border border-border px-4 py-2.5 text-muted transition hover:border-primary/50 hover:text-foreground"
                >
                  {t({ fr: "Consulter la FAQ", en: "Read the FAQ" })}
                </Link>
                <Link
                  to="/devis"
                  className="rounded-xl border border-border px-4 py-2.5 text-muted transition hover:border-primary/50 hover:text-foreground"
                >
                  {t({ fr: "Calculer un tarif", en: "Calculate a price" })}
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
