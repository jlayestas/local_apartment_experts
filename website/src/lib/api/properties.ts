import { apiClient, ApiError } from "./client";
import type { PagedResponse, PropertyDetail, PropertyFilters, PropertySummary } from "@/types/property";

const BASE = "/api/v1/public/properties";

/**
 * Fetches a paginated list of published properties.
 * Maps front-end filter shape to the backend's supported query params.
 *
 * Note: bathrooms, petFriendly, hasParking, and availableFrom are UI-only filters
 * not yet supported by the backend — they are applied client-side in ListingsClient.
 */
export async function getPublishedProperties(
  filters: PropertyFilters = {}
): Promise<PagedResponse<PropertySummary>> {
  const params = new URLSearchParams();

  const {
    search, featured, city, neighborhood,
    minPrice, maxPrice, bedrooms, propertyType, amenities,
    page, size,
  } = filters;

  if (search)           params.set("search",       search);
  if (featured)         params.set("featured",      String(featured));
  if (city)             params.set("city",          city);
  if (neighborhood)     params.set("neighborhood",  neighborhood);
  if (minPrice != null) params.set("minPrice",      String(minPrice));
  if (maxPrice != null) params.set("maxPrice",      String(maxPrice));
  if (bedrooms != null) params.set("bedrooms",      String(bedrooms));
  if (propertyType)     params.set("propertyType",  propertyType);
  amenities?.forEach((a) => params.append("amenities", a));
  if (page != null)     params.set("page",          String(page));
  if (size != null)     params.set("size",          String(size));

  const qs = params.toString();
  return apiClient.get<PagedResponse<PropertySummary>>(
    `${BASE}${qs ? `?${qs}` : ""}`,
    { next: { revalidate: 60 } }
  );
}

/**
 * Fetches a single published property by URL slug.
 * Returns null on 404; throws for all other errors.
 */
export async function getPublishedPropertyBySlug(
  slug: string
): Promise<PropertyDetail | null> {
  try {
    return await apiClient.get<PropertyDetail>(
      `${BASE}/${slug}`,
      { next: { revalidate: 300 } }
    );
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}
