import { describe, it, expect } from "vitest";
import { applyFilters, applySort, buildChips } from "./listingsUtils";
import type { PropertySummary } from "@/types/property";

// ── Fixture helpers ────────────────────────────────────────────────────────────

function makeProperty(overrides: Partial<PropertySummary> = {}): PropertySummary {
  return {
    id: "id",
    title: "Test Property",
    slug: "test-property",
    neighborhood: null,
    city: "Miami",
    state: "FL",
    price: 2000,
    priceFrequency: "MONTHLY",
    propertyType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: 800,
    featured: false,
    contactPhone: null,
    publishedAt: "2024-01-01T00:00:00Z",
    coverImageUrl: null,
    ...overrides,
  };
}

const BRICKELL = makeProperty({ id: "1", title: "Brickell Studio",       city: "Miami",        neighborhood: "Brickell", price: 1500, bedrooms: 1, bathrooms: 1, propertyType: "STUDIO"    });
const WYNWOOD  = makeProperty({ id: "2", title: "Wynwood Loft",           city: "Miami",        neighborhood: "Wynwood",  price: 2500, bedrooms: 2, bathrooms: 2, propertyType: "APARTMENT" });
const CORAL    = makeProperty({ id: "3", title: "Coral Gables House",     city: "Coral Gables", neighborhood: null,       price: 4000, bedrooms: 4, bathrooms: 3, propertyType: "HOUSE"     });
const ALL = [BRICKELL, WYNWOOD, CORAL];

// ── applyFilters ───────────────────────────────────────────────────────────────

describe("applyFilters", () => {
  describe("empty filters", () => {
    it("returns the full list when no filters are set", () => {
      expect(applyFilters(ALL, {})).toEqual(ALL);
    });
  });

  describe("search", () => {
    it("matches by title (case-insensitive)", () => {
      expect(applyFilters(ALL, { search: "brickell" })).toEqual([BRICKELL]);
      expect(applyFilters(ALL, { search: "WYNWOOD" })).toEqual([WYNWOOD]);
    });

    it("matches by city", () => {
      expect(applyFilters(ALL, { search: "coral gables" })).toEqual([CORAL]);
    });

    it("matches by neighborhood", () => {
      expect(applyFilters(ALL, { search: "wynwood" })).toEqual([WYNWOOD]);
    });

    it("matches multiple properties when search term is broad", () => {
      // "Miami" is the city of both BRICKELL and WYNWOOD
      expect(applyFilters(ALL, { search: "miami" })).toEqual([BRICKELL, WYNWOOD]);
    });

    it("returns empty array when nothing matches", () => {
      expect(applyFilters(ALL, { search: "xyz-no-match" })).toEqual([]);
    });

    it("handles null neighborhood without crashing", () => {
      expect(() => applyFilters(ALL, { search: "gables" })).not.toThrow();
      expect(applyFilters(ALL, { search: "gables" })).toEqual([CORAL]);
    });
  });

  describe("city filter", () => {
    it("filters by exact city (case-insensitive)", () => {
      expect(applyFilters(ALL, { city: "coral gables" })).toEqual([CORAL]);
    });

    it("returns empty when city matches nothing", () => {
      expect(applyFilters(ALL, { city: "Orlando" })).toEqual([]);
    });
  });

  describe("price range", () => {
    it("minPrice excludes cheaper properties", () => {
      expect(applyFilters(ALL, { minPrice: 2000 })).toEqual([WYNWOOD, CORAL]);
    });

    it("maxPrice excludes pricier properties", () => {
      expect(applyFilters(ALL, { maxPrice: 2500 })).toEqual([BRICKELL, WYNWOOD]);
    });

    it("minPrice and maxPrice narrow the range together", () => {
      expect(applyFilters(ALL, { minPrice: 2000, maxPrice: 3000 })).toEqual([WYNWOOD]);
    });

    it("minPrice above all prices returns empty", () => {
      expect(applyFilters(ALL, { minPrice: 10000 })).toEqual([]);
    });

    it("treats null price as 0 — excluded when minPrice > 0", () => {
      const noPriceProperty = makeProperty({ id: "np", price: null });
      expect(applyFilters([noPriceProperty], { minPrice: 1 })).toEqual([]);
    });
  });

  describe("bedrooms", () => {
    it("filters by minimum bedroom count", () => {
      expect(applyFilters(ALL, { bedrooms: 2 })).toEqual([WYNWOOD, CORAL]);
    });

    it("includes properties that exactly meet the minimum", () => {
      expect(applyFilters(ALL, { bedrooms: 4 })).toEqual([CORAL]);
    });

    it("treats null bedrooms as 0 — excluded when filter > 0", () => {
      const noBeds = makeProperty({ id: "nb", bedrooms: null });
      expect(applyFilters([noBeds], { bedrooms: 1 })).toEqual([]);
    });
  });

  describe("bathrooms (client-side only)", () => {
    it("filters by minimum bathroom count", () => {
      expect(applyFilters(ALL, { bathrooms: 2 })).toEqual([WYNWOOD, CORAL]);
    });

    it("treats null bathrooms as 0 — excluded when filter > 0", () => {
      const noBaths = makeProperty({ id: "nba", bathrooms: null });
      expect(applyFilters([noBaths], { bathrooms: 1 })).toEqual([]);
    });
  });

  describe("propertyType", () => {
    it("filters by exact property type", () => {
      expect(applyFilters(ALL, { propertyType: "STUDIO"    })).toEqual([BRICKELL]);
      expect(applyFilters(ALL, { propertyType: "APARTMENT" })).toEqual([WYNWOOD]);
      expect(applyFilters(ALL, { propertyType: "HOUSE"     })).toEqual([CORAL]);
    });

    it("returns empty when no property matches the type", () => {
      expect(applyFilters(ALL, { propertyType: "CONDO" })).toEqual([]);
    });
  });

  describe("combined filters", () => {
    it("ANDs all active filters together", () => {
      // Miami city + min 2 beds + max $3,000 → only WYNWOOD
      expect(applyFilters(ALL, { city: "Miami", bedrooms: 2, maxPrice: 3000 })).toEqual([WYNWOOD]);
    });

    it("returns empty when combined filters have no overlap", () => {
      expect(applyFilters(ALL, { propertyType: "STUDIO", bedrooms: 3 })).toEqual([]);
    });
  });
});

// ── applySort ──────────────────────────────────────────────────────────────────

describe("applySort", () => {
  it("sorts price ascending", () => {
    const result = applySort(ALL, "price_asc");
    expect(result.map((p) => p.price)).toEqual([1500, 2500, 4000]);
  });

  it("sorts price descending", () => {
    const result = applySort(ALL, "price_desc");
    expect(result.map((p) => p.price)).toEqual([4000, 2500, 1500]);
  });

  it("newest sort preserves original order", () => {
    const result = applySort(ALL, "newest");
    expect(result).toEqual(ALL);
  });

  it("does not mutate the original array", () => {
    const original = [...ALL];
    applySort(ALL, "price_asc");
    expect(ALL).toEqual(original);
  });

  it("treats null price as 0 when sorting ascending", () => {
    const nullPrice = makeProperty({ id: "np", price: null });
    const result = applySort([WYNWOOD, nullPrice, BRICKELL], "price_asc");
    expect(result[0]).toBe(nullPrice);
  });
});

// ── buildChips ─────────────────────────────────────────────────────────────────

describe("buildChips", () => {
  const t = (key: string, params?: Record<string, string | number>): string => {
    if (key.startsWith("type."))            return key.replace("type.", "");
    if (key === "listings.beds_chip")       return `${params?.n}+ bds`;
    if (key === "listings.baths_chip")      return `${params?.n}+ bas`;
    if (key === "listings.from_price")      return `From $${params?.n}`;
    if (key === "listings.to_price")        return `Up to $${params?.n}`;
    return key;
  };

  it("returns empty array for empty filters", () => {
    expect(buildChips({}, t)).toEqual([]);
  });

  it("creates a chip for search with quoted label", () => {
    const chips = buildChips({ search: "brickell" }, t);
    expect(chips).toHaveLength(1);
    expect(chips[0]).toEqual({ key: "search", label: '"brickell"' });
  });

  it("creates a chip for each active filter", () => {
    const chips = buildChips({ city: "Miami", bedrooms: 2, propertyType: "APARTMENT" }, t);
    expect(chips).toHaveLength(3);
    expect(chips.map((c) => c.key)).toContain("city");
    expect(chips.map((c) => c.key)).toContain("bedrooms");
    expect(chips.map((c) => c.key)).toContain("propertyType");
  });

  it("creates price chips for min and max", () => {
    const chips = buildChips({ minPrice: 1000, maxPrice: 3000 }, t);
    expect(chips.find((c) => c.key === "minPrice")).toBeDefined();
    expect(chips.find((c) => c.key === "maxPrice")).toBeDefined();
  });

  it("does not create a chip for undefined filters", () => {
    const chips = buildChips({ search: undefined, city: undefined }, t);
    expect(chips).toHaveLength(0);
  });
});
