import { describe, it, expect } from "vitest";
import { translations } from "./translations";

describe("translations", () => {
  const enKeys = Object.keys(translations.en) as (keyof typeof translations.en)[];
  const esKeys = Object.keys(translations.es) as (keyof typeof translations.es)[];

  it("every English key exists in Spanish", () => {
    const missing = enKeys.filter((k) => !(k in translations.es));
    expect(missing).toEqual([]);
  });

  it("every Spanish key exists in English", () => {
    const missing = esKeys.filter((k) => !(k in translations.en));
    expect(missing).toEqual([]);
  });

  it("no English value is an empty string", () => {
    const empty = enKeys.filter((k) => translations.en[k] === "");
    expect(empty).toEqual([]);
  });

  it("no Spanish value is an empty string", () => {
    const empty = esKeys.filter((k) => translations.es[k] === "");
    expect(empty).toEqual([]);
  });

  it("English and Spanish have the same number of keys", () => {
    expect(enKeys.length).toBe(esKeys.length);
  });
});
