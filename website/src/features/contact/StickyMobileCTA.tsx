"use client";

import { buildWhatsAppHref } from "@/lib/config/contact";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Props = {
  whatsappMessage?: string;
};

export default function StickyMobileCTA({ whatsappMessage }: Props) {
  const { t } = useLanguage();

  function scrollToInquiry() {
    document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3 flex gap-3">
      <a
        href={buildWhatsAppHref(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 active:bg-green-700 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.374 0 0 5.373 0 12c0 2.12.554 4.11 1.523 5.837L.057 23.882a.5.5 0 0 0 .61.61l6.044-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.65-.51-5.17-1.399l-.37-.22-3.589.871.887-3.59-.24-.383A9.97 9.97 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
        </svg>
        {t("sticky.whatsapp")}
      </a>
      <button
        onClick={scrollToInquiry}
        className="flex-1 rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 active:bg-teal-800 transition-colors"
      >
        {t("sticky.request_info")}
      </button>
    </div>
  );
}
