import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Bot, Loader2, Mail, MessageCircle, Phone, Send, User, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n, type Bi } from "../../lib/i18n";
import { CONTACT, whatsappLink } from "../../lib/format";

const SUGGESTIONS: Bi[] = [
  { fr: "Où est mon colis ?", en: "Where is my parcel?" },
  { fr: "Vous livrez à Cotonou ?", en: "Do you deliver to Cotonou?" },
  { fr: "Comment obtenir un devis ?", en: "How do I get a quote?" },
  { fr: "Mes affaires sont-elles assurées ?", en: "Are my goods insured?" },
  { fr: "Je veux parler à un conseiller", en: "I want to talk to an advisor" },
];

const WELCOME: Bi = {
  fr: "Bonjour 👋 Je suis l'assistant LBG Express Colis. Je réponds sur les livraisons en Île-de-France, les déménagements et les envois vers le Bénin, le Togo et le Mali. Posez votre question ou donnez-moi votre numéro de suivi.",
  en: "Hello 👋 I'm the LBG Express Colis assistant. I answer questions about deliveries across Île-de-France, moves and shipments to Benin, Togo and Mali. Ask your question or give me your tracking number.",
};

/**
 * Assistant IA du site : agent LLM en streaming, suivi de colis en direct
 * et escalade vers l'équipe humaine (WhatsApp / e-mail / téléphone).
 */
export function SupportChat() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scroller = useRef<HTMLDivElement | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/agent/messages" }),
  });

  const busy = status === "streaming" || status === "submitted";
  const escalated = messages.some((msg) =>
    msg.parts.some((part) => part.type === "tool-requestHuman"),
  );

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || busy) return;
    setInput("");
    void sendMessage({ text: value });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t({ fr: "Assistance en ligne", en: "Online support" })}
        className="fixed bottom-[5.5rem] right-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_35px_-10px_rgba(57,213,255,0.8)] transition hover:scale-105"
      >
        {open ? <X className="size-6" /> : <Bot className="size-6" />}
      </button>

      {open ? (
        <div className="glass fixed bottom-[9.5rem] right-5 z-50 flex h-[30rem] w-[min(23rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-card border border-border">
          <div className="flex items-center gap-3 border-b border-border bg-surface-2/70 px-4 py-3">
            <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Bot className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{t({ fr: "Assistant LBG", en: "LBG assistant" })}</p>
              <p className="truncate text-xs text-success">
                {t({ fr: "Réponse immédiate · 24/7", en: "Instant answers · 24/7" })}
              </p>
            </div>
          </div>

          <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <Bubble from="bot" text={t(WELCOME)} />

            {messages.map((msg) => {
              const text = msg.parts
                .filter((part) => part.type === "text")
                .map((part) => ("text" in part ? part.text : ""))
                .join("");
              if (!text.trim()) return null;
              return <Bubble key={msg.id} from={msg.role === "user" ? "me" : "bot"} text={text} />;
            })}

            {busy ? (
              <p className="flex items-center gap-2 text-xs text-muted">
                <Loader2 className="size-3.5 animate-spin" />
                {t({ fr: "L'assistant rédige…", en: "The assistant is typing…" })}
              </p>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-warning">
                {t({
                  fr: `Le chat est momentanément indisponible. Écrivez-nous sur WhatsApp ou appelez le ${CONTACT.phone}.`,
                  en: `The chat is temporarily unavailable. Message us on WhatsApp or call ${CONTACT.phone}.`,
                })}
              </p>
            ) : null}

            {escalated ? (
              <div className="grid gap-2 rounded-card border border-primary/40 bg-primary/10 p-3">
                <p className="text-xs font-semibold text-primary">
                  {t({
                    fr: "Un conseiller prend le relais. Contact direct :",
                    en: "An advisor is taking over. Direct contact:",
                  })}
                </p>
                <a
                  href={whatsappLink(
                    t({
                      fr: "Bonjour LBG Express Colis, je viens du chat du site.",
                      en: "Hello LBG Express Colis, I'm coming from the website chat.",
                    }),
                  )}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-[#04121c]"
                >
                  <MessageCircle className="size-3.5" />
                  WhatsApp {CONTACT.phone}
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/50"
                >
                  <Mail className="size-3.5 text-primary" />
                  {CONTACT.email}
                </a>
                <a
                  href={CONTACT.phoneHref}
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/50"
                >
                  <Phone className="size-3.5 text-primary" />
                  {CONTACT.phone}
                </a>
              </div>
            ) : null}

            {messages.length === 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((item) => (
                  <button
                    key={item.fr}
                    type="button"
                    onClick={() => submit(t(item))}
                    className="rounded-full border border-border px-3 py-1.5 text-xs font-medium transition hover:border-primary/60 hover:text-primary"
                  >
                    {t(item)}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-t border-border px-3 py-3">
            <input
              aria-label={t({ fr: "Votre message", en: "Your message" })}
              placeholder={t({ fr: "Écrivez votre message…", en: "Type your message…" })}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(input);
              }}
              className="flex-1 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs outline-none focus:border-primary/60"
            />
            <button
              type="button"
              onClick={() => submit(input)}
              disabled={busy}
              aria-label={t({ fr: "Envoyer", en: "Send" })}
              className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground disabled:opacity-60"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </div>

          <div className="flex gap-2 border-t border-border px-3 pb-3 pt-2">
            <a
              href={whatsappLink(
                t({
                  fr: "Bonjour LBG Express Colis, je viens du chat du site.",
                  en: "Hello LBG Express Colis, I'm coming from the website chat.",
                }),
              )}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-semibold text-[#04121c]"
            >
              <MessageCircle className="size-3.5" />
              WhatsApp
            </a>
            <a
              href={CONTACT.phoneHref}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold transition hover:border-primary/50"
            >
              <Phone className="size-3.5 text-primary" />
              {t({ fr: "Appeler", en: "Call" })}
            </a>
          </div>
        </div>
      ) : null}
    </>
  );
}

function Bubble({ from, text }: { from: "bot" | "me"; text: string }) {
  return (
    <div className={cn("flex gap-2", from === "me" && "flex-row-reverse")}>
      <span
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full",
          from === "me" ? "bg-surface-2 text-muted" : "bg-primary/15 text-primary",
        )}
      >
        {from === "me" ? <User className="size-3.5" /> : <Bot className="size-3.5" />}
      </span>
      <p
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[0.8125rem] leading-relaxed",
          from === "me"
            ? "bg-primary text-primary-foreground"
            : "border border-border bg-surface-2/70 text-foreground",
        )}
      >
        {text}
      </p>
    </div>
  );
}
