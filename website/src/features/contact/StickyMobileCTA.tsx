"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function StickyMobileCTA() {
  const { t } = useLanguage();

  function scrollToInquiry() {
    document.getElementById("inquiry")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 lg:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-3">
      <button
        onClick={scrollToInquiry}
        className="w-full rounded-lg bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 active:bg-teal-800 transition-colors"
      >
        {t("sticky.request_info")}
      </button>
    </div>
  );
}
