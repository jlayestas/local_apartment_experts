import { api } from "./client";
import type { PagedResponse, UserSummary } from "@/types/api";
import type {
  ActivityEntry,
  CreateLeadInput,
  CreateLeadPropertyLinkInput,
  LeadDetail,
  LeadFilters,
  LeadPropertyLink,
  LeadSummary,
  Note,
  RecommendedProperty,
  UpdateLeadInput,
  UpdateLeadPropertyLinkInput,
} from "@/types/lead";

// ── Lead CRUD ─────────────────────────────────────────────────────────────────

export function createLead(input: CreateLeadInput): Promise<LeadDetail> {
  return api.post<LeadDetail>("/leads", input);
}

export function getLeads(
  filters: LeadFilters = {}
): Promise<PagedResponse<LeadSummary>> {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });

  const qs = params.toString();
  return api.get<PagedResponse<LeadSummary>>(`/leads${qs ? `?${qs}` : ""}`);
}

export function getLead(id: string): Promise<LeadDetail> {
  return api.get<LeadDetail>(`/leads/${id}`);
}

export function updateLead(id: string, input: UpdateLeadInput): Promise<LeadDetail> {
  return api.patch<LeadDetail>(`/leads/${id}`, input);
}

// ── Workflow actions ───────────────────────────────────────────────────────────

export function changeLeadStatus(
  id: string,
  status: string,
  note?: string
): Promise<LeadDetail> {
  return api.post<LeadDetail>(`/leads/${id}/status`, { status, note });
}

export function assignLead(
  id: string,
  assignedUserId: string
): Promise<LeadDetail> {
  return api.post<LeadDetail>(`/leads/${id}/assign`, { assignedUserId });
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export function getLeadNotes(leadId: string): Promise<Note[]> {
  return api.get<Note[]>(`/leads/${leadId}/notes`);
}

export function addLeadNote(leadId: string, body: string): Promise<Note> {
  return api.post<Note>(`/leads/${leadId}/notes`, { body });
}

// ── Activity ──────────────────────────────────────────────────────────────────

export function getLeadActivity(leadId: string): Promise<ActivityEntry[]> {
  return api.get<ActivityEntry[]>(`/leads/${leadId}/activities`);
}

// ── Lead ↔ Property links ─────────────────────────────────────────────────────

export function getLeadPropertyLinks(leadId: string): Promise<LeadPropertyLink[]> {
  return api.get<LeadPropertyLink[]>(`/leads/${leadId}/properties`);
}

export function addLeadPropertyLink(
  leadId: string,
  input: CreateLeadPropertyLinkInput
): Promise<LeadPropertyLink> {
  return api.post<LeadPropertyLink>(`/leads/${leadId}/properties`, input);
}

export function updateLeadPropertyLink(
  leadId: string,
  linkId: string,
  input: UpdateLeadPropertyLinkInput
): Promise<LeadPropertyLink> {
  return api.patch<LeadPropertyLink>(`/leads/${leadId}/properties/${linkId}`, input);
}

export function removeLeadPropertyLink(
  leadId: string,
  linkId: string
): Promise<void> {
  return api.delete<void>(`/leads/${leadId}/properties/${linkId}`);
}

// ── Recommendations ───────────────────────────────────────────────────────────

export function getRecommendedProperties(
  leadId: string,
  limit = 3
): Promise<RecommendedProperty[]> {
  return api.get<RecommendedProperty[]>(
    `/leads/${leadId}/recommended-properties?limit=${limit}`
  );
}

// ── Users (for assignment dropdown) ───────────────────────────────────────────

export function getAssignableUsers(): Promise<UserSummary[]> {
  return api.get<UserSummary[]>("/users/assignable");
}
