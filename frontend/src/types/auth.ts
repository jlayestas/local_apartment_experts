export type UserRole = "ADMIN" | "AGENT";

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  language: string;
};
