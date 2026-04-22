import { api } from "./client";
import type { DashboardSummary } from "@/types/api";
import type { LeadSummary } from "@/types/lead";

export function getDashboardSummary(): Promise<DashboardSummary> {
  return api.get<DashboardSummary>("/dashboard/summary");
}

export function getRecentLeads(): Promise<LeadSummary[]> {
  return api.get<LeadSummary[]>("/dashboard/recent-leads");
}
