import { describe, it, expect } from "vitest";
import { formatPrice, formatBedsLabel, formatBathsLabel, formatSqft } from "./format";

// Minimal t() that mirrors the English translation values
const t = (key: string, params?: Record<string, string | number>): string => {
  const map: Record<string, string> = {
    "format.price_on_request": "Price on request",
    "format.freq_monthly":     "/ mo",
    "format.freq_weekly":      "/ wk",
    "format.freq_daily":       "/ day",
    "format.freq_once":        "one-time",
    "format.bed_one":          "1 bd",
    "format.bed_other":        "{n} bds",
    "format.bath_one":         "1 ba",
    "format.bath_other":       "{n} bas",
  };
  let value = map[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }
  return value;
};

describe("formatPrice", () => {
  it("returns translation result when price is null", () => {
    expect(formatPrice(null, null, t)).toBe("Price on request");
  });

  it("formats a price without frequency", () => {
    expect(formatPrice(2000, null, t)).toBe("$2,000");
  });

  it("appends monthly frequency label", () => {
    expect(formatPrice(2000, "MONTHLY", t)).toBe("$2,000 / mo");
  });

  it("appends weekly frequency label", () => {
    expect(formatPrice(500, "WEEKLY", t)).toBe("$500 / wk");
  });

  it("formats large prices with commas", () => {
    expect(formatPrice(10000, "MONTHLY", t)).toBe("$10,000 / mo");
  });
});

describe("formatBedsLabel", () => {
  it("returns singular label for 1 bed", () => {
    expect(formatBedsLabel(1, t)).toBe("1 bd");
  });

  it("returns plural label for multiple beds", () => {
    expect(formatBedsLabel(3, t)).toBe("3 bds");
  });

  it("returns dash for null", () => {
    expect(formatBedsLabel(null, t)).toBe("—");
  });
});

describe("formatBathsLabel", () => {
  it("returns singular label for 1 bath", () => {
    expect(formatBathsLabel(1, t)).toBe("1 ba");
  });

  it("returns plural label for multiple baths", () => {
    expect(formatBathsLabel(2, t)).toBe("2 bas");
  });

  it("returns dash for null", () => {
    expect(formatBathsLabel(null, t)).toBe("—");
  });
});

describe("formatSqft", () => {
  it("formats square footage with unit", () => {
    expect(formatSqft(850)).toBe("850 sq ft");
  });

  it("returns dash for null", () => {
    expect(formatSqft(null)).toBe("—");
  });
});
