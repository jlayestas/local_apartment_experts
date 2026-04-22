"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selector"
      className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5"
    >
      <button
        type="button"
        onClick={() => setLang("es")}
        aria-pressed={lang === "es"}
        aria-label="Español"
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors
          ${lang === "es"
            ? "bg-white text-teal-600 shadow-sm"
            : "text-gray-400 hover:text-gray-700"
          }`}
      >
        <span aria-hidden="true">🇪🇸</span>
        Español
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        aria-label="English"
        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors
          ${lang === "en"
            ? "bg-white text-teal-600 shadow-sm"
            : "text-gray-400 hover:text-gray-700"
          }`}
      >
        <span aria-hidden="true">🇺🇸</span>
        English
      </button>
    </div>
  );
}
