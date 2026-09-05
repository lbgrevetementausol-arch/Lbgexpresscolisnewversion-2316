import { MessageCircle } from "lucide-react";
import { useI18n } from "../../lib/i18n";
import { whatsappLink } from "../../lib/format";

export function WhatsAppButton() {
  const { t } = useI18n();
  return (
    <a
      href={whatsappLink(
        t({
          fr: "Bonjour LBG Express Colis, j'ai une question sur un envoi.",
          en: "Hello LBG Express Colis, I have a question about a shipment.",
        }),
      )}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3.5 font-semibold text-[#04121c] shadow-[0_12px_35px_-10px_rgba(37,211,102,0.7)] transition hover:scale-105"
      aria-label="WhatsApp"
    >
      <MessageCircle className="size-5" />
      <span className="hidden text-sm sm:block">WhatsApp</span>
    </a>
  );
}
