import type { PropertyFilters, PropertySummary, PropertyType, SortOption } from "@/types/property";

export type Chip = { key: keyof PropertyFilters; label: string };

// Bilingual keyword → PropertyType for free-text type matching.
// Covers both English and Spanish terms so "studio" and "estudio" both hit STUDIO.
export const TYPE_KEYWORDS: Record<string, PropertyType> = {
  apartment:   "APARTMENT",
  apartamento: "APARTMENT",
  house:       "HOUSE",
  casa:        "HOUSE",
  studio:      "STUDIO",
  estudio:     "STUDIO",
  condo:       "CONDO",
  condominio:  "CONDO",
  townhouse:   "TOWNHOUSE",
  other:       "OTHER",
  otro:        "OTHER",
};

export function buildChips(
  f: PropertyFilters,
  t: (key: string, params?: Record<string, string | number>) => string
): Chip[] {
  const chips: Chip[] = [];
  if (f.search)       chips.push({ key: "search",       label: `"${f.search}"` });
  if (f.city)         chips.push({ key: "city",          label: f.city });
  if (f.neighborhood) chips.push({ key: "neighborhood",  label: f.neighborhood });
  if (f.propertyType) chips.push({ key: "propertyType",  label: t(`type.${f.propertyType}`) });
  if (f.bedrooms)     chips.push({ key: "bedrooms",      label: t("listings.beds_chip",  { n: f.bedrooms  }) });
  if (f.bathrooms)    chips.push({ key: "bathrooms",     label: t("listings.baths_chip", { n: f.bathrooms }) });
  if (f.minPrice)     chips.push({ key: "minPrice",      label: t("listings.from_price", { n: f.minPrice.toLocaleString() }) });
  if (f.maxPrice)     chips.push({ key: "maxPrice",      label: t("listings.to_price",   { n: f.maxPrice.toLocaleString() }) });
  return chips;
}

export function applyFilters(properties: PropertySummary[], f: PropertyFilters): PropertySummary[] {
  const search = f.search?.toLowerCase().trim();

  // Pre-compute which PropertyType values match the search term once, not per property.
  const matchedTypes = new Set<PropertyType>();
  if (search) {
    for (const [kw, type] of Object.entries(TYPE_KEYWORDS)) {
      if (kw.includes(search)) matchedTypes.add(type);
    }
  }

  return properties.filter((p) => {
    if (search && !(
      p.title.toLowerCase().includes(search) ||
      p.neighborhood?.toLowerCase().includes(search) ||
      p.city.toLowerCase().includes(search) ||
      matchedTypes.has(p.propertyType)
    )) return false;

    if (f.city         && !p.city.toLowerCase().includes(f.city.toLowerCase()))                  return false;
    if (f.neighborhood && !p.neighborhood?.toLowerCase().includes(f.neighborhood.toLowerCase())) return false;
    if (f.propertyType && p.propertyType !== f.propertyType)                                     return false;
    if (f.bedrooms     && (p.bedrooms  ?? 0) < f.bedrooms)                                      return false;
    if (f.bathrooms    && (p.bathrooms ?? 0) < f.bathrooms)                                     return false;
    if (f.minPrice != null && (p.price ?? 0) < f.minPrice)                                      return false;
    if (f.maxPrice != null && (p.price ?? 0) > f.maxPrice)                                      return false;
    return true;
  });
}

export function applySort(properties: PropertySummary[], sort: SortOption): PropertySummary[] {
  const sorted = [...properties];
  if (sort === "price_asc")  sorted.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  if (sort === "price_desc") sorted.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  return sorted;
}
