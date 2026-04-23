export type LeadStatus =
  | "NEW"
  | "CONTACT_ATTEMPTED"
  | "CONTACTED"
  | "QUALIFIED"
  | "APPOINTMENT_SCHEDULED"
  | "APPLICATION_IN_PROGRESS"
  | "CLOSED_WON"
  | "CLOSED_LOST"
  | "UNRESPONSIVE";

export type LeadSource = "WEBSITE" | "REFERRAL" | "FACEBOOK" | "WALKIN" | "OTHER";
export type UrgencyLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ContactMethod = "EMAIL" | "PHONE" | "WHATSAPP";

export type LeadSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  status: LeadStatus;
  source: LeadSource | null;
  urgencyLevel: UrgencyLevel;
  assignedUserId: string | null;
  assignedUserName: string | null;
  nextFollowUpDate: string | null;
  createdAt: string;
};

export type LeadDetail = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  preferredContactMethod: ContactMethod | null;
  source: LeadSource | null;
  moveInDate: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredNeighborhoods: string[];
  bedroomCount: number | null;
  bathroomCount: number | null;
  message: string | null;
  languagePreference: string;
  urgencyLevel: UrgencyLevel;
  status: LeadStatus;
  lastContactDate: string | null;
  nextFollowUpDate: string | null;
  assignedUserId: string | null;
  assignedUserName: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Note = {
  id: string;
  leadId: string;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  leadId: string | null;
  propertyId: string | null;
  actorId: string | null;
  actorName: string | null;
  activityType: string;
  metadata: Record<string, unknown>;
  createdAt: string;
};

// ── Request payloads ──────────────────────────────────────────────────────────

export type CreateLeadInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  preferredContactMethod?: ContactMethod;
  source?: LeadSource;
  moveInDate?: string;
  budgetMin?: number;
  budgetMax?: number;
  preferredNeighborhoods?: string[];
  bedroomCount?: number;
  bathroomCount?: number;
  message?: string;
  languagePreference?: string;
  urgencyLevel?: UrgencyLevel;
  lastContactDate?: string;
  nextFollowUpDate?: string;
  assignedUserId?: string;
};

export type UpdateLeadInput = Partial<Omit<CreateLeadInput, never>> & {
  status?: LeadStatus;
  clearNextFollowUpDate?: boolean;
};

export type LinkType = "SUGGESTED" | "INTERESTED" | "TOURED" | "REJECTED";

/** Lightweight property info embedded in a lead-property link response. */
export type LinkedPropertySummary = {
  id: string;
  title: string;
  slug: string;
  city: string;
  neighborhood: string | null;
  propertyType: string;
  price: number | null;
  priceFrequency: string | null;
  bedrooms: number | null;
  status: string;
};

export type LeadPropertyLink = {
  id: string;
  leadId: string;
  propertyId: string;
  linkType: LinkType;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  property: LinkedPropertySummary;
};

export type RecommendedProperty = {
  property: import("@/types/property").PropertySummary;
  score: number;
  matchReasons: string[];
};

export type CreateLeadPropertyLinkInput = {
  propertyId: string;
  linkType: LinkType;
  note?: string;
};

export type UpdateLeadPropertyLinkInput = {
  linkType?: LinkType;
  note?: string;
};

export type LeadFilters = {
  search?: string;
  status?: LeadStatus;
  assignedUserId?: string;
  source?: LeadSource;
  followUpDue?: boolean;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  size?: number;
};
