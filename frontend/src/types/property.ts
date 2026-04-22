export type PropertyStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
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

// ── Image ─────────────────────────────────────────────────────────────────────

export type PropertyImage = {
  id: string;
  propertyId: string;
  imageUrl: string;
  altText: string | null;
  sortOrder: number;
  cover: boolean;
  createdAt: string;
};

// ── Read models ───────────────────────────────────────────────────────────────

/** Lightweight projection returned by the list endpoint. */
export type PropertySummary = {
  id: string;
  title: string;
  slug: string;
  neighborhood: string | null;
  city: string;
  state: string;
  price: number | null;
  priceFrequency: string | null;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  status: PropertyStatus;
  featured: boolean;
  contactPhone: string | null;
  createdAt: string;
  publishedAt: string | null;
};

/** Full property returned by the detail endpoint. */
export type PropertyDetail = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  /** Omitted from public responses; only present for internal/admin endpoints. */
  internalNotes?: string | null;
  addressLine1: string;
  addressLine2: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  price: number | null;
  priceFrequency: string | null;
  propertyType: string;
  bedrooms: number | null;
  bathrooms: number | null;
  squareFeet: number | null;
  availableDate: string | null;
  status: PropertyStatus;
  featured: boolean;
  amenities: string[] | null;
  petPolicy: string | null;
  parkingInfo: string | null;
  externalReferenceId: string | null;
  sourceCompany: string | null;
  listingAgentId: string | null;
  listingAgentName: string | null;
  contactPhone: string | null;
  contactWhatsapp: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  archivedAt: string | null;
  publicSortOrder: number | null;
};

// ── Request payloads ──────────────────────────────────────────────────────────

export type CreatePropertyInput = {
  title: string;
  slug?: string;
  description?: string;
  internalNotes?: string;
  addressLine1: string;
  addressLine2?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  price?: number;
  priceFrequency?: PriceFrequency;
  propertyType: PropertyType;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  availableDate?: string;
  featured?: boolean;
  amenities?: string[];
  petPolicy?: PetPolicy;
  parkingInfo?: string;
  externalReferenceId?: string;
  sourceCompany?: string;
  listingAgentId?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  publicSortOrder?: number | null;
};

export type UpdatePropertyInput = Partial<CreatePropertyInput>;

export type PropertyFilters = {
  search?: string;
  status?: PropertyStatus;
  featured?: boolean;
  city?: string;
  neighborhood?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: PropertyType;
  page?: number;
  size?: number;
};
