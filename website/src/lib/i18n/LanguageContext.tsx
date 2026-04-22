"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { translations, type Lang } from "./translations";

type Params = Record<string, string | number>;

type LanguageContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, params?: Params) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored === "en" || stored === "es") {
      setLangState(stored);
      document.documentElement.lang = stored;
    }
  }, []);

  function setLang(l: Lang) {
    setLangState(l);
    localStorage.setItem("lang", l);
    document.documentElement.lang = l;
  }

  function t(key: string, params?: Params): string {
    const dict = translations[lang] as Record<string, string>;
    const fallback = translations.en as Record<string, string>;
    let value = dict[key] ?? fallback[key] ?? key;
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(`{${k}}`, String(v));
      }
    }
    return value;
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
