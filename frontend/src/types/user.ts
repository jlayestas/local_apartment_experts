import type { UserRole } from "./auth";

export interface UserDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  language: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  language?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  language?: string;
  active?: boolean;
}
