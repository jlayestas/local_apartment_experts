import { api } from "./client";
import type { PagedResponse } from "@/types/api";
import type { ActivityEntry } from "@/types/lead";
import type {
  CreatePropertyInput,
  PropertyDetail,
  PropertyFilters,
  PropertyImage,
  PropertySummary,
  UpdatePropertyInput,
} from "@/types/property";

// ── Property CRUD ─────────────────────────────────────────────────────────────

export function createProperty(input: CreatePropertyInput): Promise<PropertyDetail> {
  return api.post<PropertyDetail>("/properties", input);
}

export function getProperties(
  filters: PropertyFilters = {}
): Promise<PagedResponse<PropertySummary>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return api.get<PagedResponse<PropertySummary>>(`/properties${qs ? `?${qs}` : ""}`);
}

export function getProperty(id: string): Promise<PropertyDetail> {
  return api.get<PropertyDetail>(`/properties/${id}`);
}

export function updateProperty(
  id: string,
  input: UpdatePropertyInput
): Promise<PropertyDetail> {
  return api.patch<PropertyDetail>(`/properties/${id}`, input);
}

// ── Property images ───────────────────────────────────────────────────────────

export function getPropertyImages(propertyId: string): Promise<PropertyImage[]> {
  return api.get<PropertyImage[]>(`/properties/${propertyId}/images`);
}

export async function uploadPropertyImage(
  propertyId: string,
  file: File,
  altText?: string
): Promise<PropertyImage> {
  const form = new FormData();
  form.append("file", file);
  if (altText?.trim()) form.append("altText", altText.trim());

  // Multipart: fetch directly (do not set Content-Type — browser must set it with boundary)
  const response = await fetch(`/api/v1/properties/${propertyId}/images`, {
    method: "POST",
    credentials: "include",
    body: form,
  });

  if (response.status === 401) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  const body = await response.json();
  if (!response.ok) throw new Error(body.message ?? "Upload failed");
  return body.data as PropertyImage;
}

export function updatePropertyImageAltText(
  propertyId: string,
  imageId: string,
  altText: string
): Promise<PropertyImage> {
  return api.patch<PropertyImage>(`/properties/${propertyId}/images/${imageId}`, { altText });
}

export function deletePropertyImage(propertyId: string, imageId: string): Promise<void> {
  return api.delete<void>(`/properties/${propertyId}/images/${imageId}`);
}

export function setPropertyImageCover(
  propertyId: string,
  imageId: string
): Promise<PropertyImage> {
  return api.patch<PropertyImage>(`/properties/${propertyId}/images/${imageId}/cover`);
}

export function reorderPropertyImages(
  propertyId: string,
  orderedIds: string[]
): Promise<PropertyImage[]> {
  return api.put<PropertyImage[]>(`/properties/${propertyId}/images/reorder`, { orderedIds });
}

// ── Activity ──────────────────────────────────────────────────────────────────

export function getPropertyActivity(propertyId: string): Promise<ActivityEntry[]> {
  return api.get<ActivityEntry[]>(`/properties/${propertyId}/activities`);
}

// ── Lifecycle actions ─────────────────────────────────────────────────────────

export function publishProperty(id: string): Promise<PropertyDetail> {
  return api.post<PropertyDetail>(`/properties/${id}/publish`);
}

export function unpublishProperty(id: string): Promise<PropertyDetail> {
  return api.post<PropertyDetail>(`/properties/${id}/unpublish`);
}

export function archiveProperty(id: string): Promise<PropertyDetail> {
  return api.post<PropertyDetail>(`/properties/${id}/archive`);
}
