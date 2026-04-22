import { apiClient } from "./client";

export interface PublicInquiryPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  message?: string;
}

export function submitPublicLead(payload: PublicInquiryPayload): Promise<void> {
  return apiClient.post<void>("/api/v1/public/leads", payload);
}
