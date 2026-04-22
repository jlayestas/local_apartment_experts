/** Envelope returned by every backend endpoint. */
export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: string;
};

/** Envelope returned by paginated backend endpoints. */
export type PagedResponse<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
};

export type DashboardSummary = {
  newLeadsCount: number;
  unassignedLeadsCount: number;
  dueTodayCount: number;
  overdueCount: number;
};

export type UserSummary = {
  id: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "AGENT";
};
