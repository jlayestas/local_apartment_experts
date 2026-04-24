// ── Enums / value types ───────────────────────────────────────────────────────

export type PropertyType =
  | "APARTMENT"
  | "HOUSE"
  | "STUDIO"
  | "CONDO"
  | "TOWNHOUSE"
  | "COMMERCIAL"
  | "OTHER";

export type PriceFrequency = "MONTHLY" | "WEEKLY" | "DAILY" | "ONCE";

export type PetPolicy = "ALLOWED" | "NOT_ALLOWED" | "NEGOTIABLE";

// ── List view ─────────────────────────────────────────────────────────────────

/**
 * Lightweight projection returned by GET /api/v1/public/properties.
 * Used for listing cards and search results.
 */
export type PropertySummary = {
  id: string;
  title: string;
  slug: string;
  neighborhood: string | null;
  city: string;
  state: string;
  price: number | null;
  priceFrequency: PriceFrequency | null;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  featured: boolean;
  contactPhone: string | null;
  publishedAt: string | null;
  coverImageUrl?: string | null;
};

// ── Detail view ───────────────────────────────────────────────────────────────

/**
 * Full property returned by GET /api/v1/public/properties/{slug}.
 * internalNotes is intentionally absent — never exposed publicly.
 */
export type PropertyDetail = {
  id: string;
  title: string;
  slug: string;
  referenceCode: string;
  description: string | null;
  addressLine1: string;
  addressLine2: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  priceFrequency: PriceFrequency | null;
  propertyType: PropertyType;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  availableDate: string | null;
  featured: boolean;
  amenities: string[] | null;
  petPolicy: PetPolicy | null;
  parkingInfo: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  publishedAt: string | null;
  images?: PropertyImage[];
};

export type PropertyImage = {
  id: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  cover: boolean;
};

// ── Filtering / sorting ───────────────────────────────────────────────────────

export type PropertyFilters = {
  // ── API-supported fields ──────────────────────────────────────────────────
  search?: string;
  featured?: boolean;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: PropertyType;
  amenities?: string[];
  page?: number;
  size?: number;
  // ── UI-level fields (pending backend filter support) ──────────────────────
  bathrooms?: number;
  petFriendly?: boolean;  // maps to petPolicy = "ALLOWED"
  hasParking?: boolean;   // maps to parkingInfo presence
  availableFrom?: string; // ISO date string
};

export type SortOption = "newest" | "price_asc" | "price_desc";

// ── Pagination ────────────────────────────────────────────────────────────────

export type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};
