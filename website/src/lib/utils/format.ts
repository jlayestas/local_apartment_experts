import type { PriceFrequency } from "@/types/property";

export type TFn = (key: string, params?: Record<string, string | number>) => string;

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function formatPrice(
  price: number | null,
  frequency: PriceFrequency | null,
  t: TFn
): string {
  if (price == null) return t("format.price_on_request");
  const formatted = CURRENCY_FORMATTER.format(price);
  const freq = frequency ? t(`format.freq_${frequency.toLowerCase()}`) : "";
  return freq ? `${formatted} ${freq}` : formatted;
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatBedsLabel(n: number | null, t: TFn): string {
  if (n == null) return "—";
  return n === 1 ? t("format.bed_one") : t("format.bed_other", { n });
}

export function formatBathsLabel(n: number | null, t: TFn): string {
  if (n == null) return "—";
  return n === 1 ? t("format.bath_one") : t("format.bath_other", { n });
}

export function formatSqft(n: number | null): string {
  if (n == null) return "—";
  return `${n} sq ft`;
}

export function slugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
