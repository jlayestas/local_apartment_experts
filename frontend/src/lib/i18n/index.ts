import { es, type Translations } from "./locales/es";

export type Locale = "es"; // extend with | "en" when ready

const locales: Record<Locale, Translations> = { es };

const DEFAULT_LOCALE: Locale = "es";

/**
 * Returns the full translation object for the given locale.
 * Use this in Server Components or outside React:
 *   const t = getTranslations()
 */
export function getTranslations(locale: Locale = DEFAULT_LOCALE): Translations {
  return locales[locale];
}

/**
 * Hook for Client Components.
 * Currently always returns the default (es) translations.
 * When locale switching is added, swap this to read from a LocaleContext.
 *
 *   const t = useTranslations()
 *   <h1>{t.dashboard.title}</h1>
 */
export function useTranslations(locale: Locale = DEFAULT_LOCALE): Translations {
  return locales[locale];
}
