import { api } from "./client";
import type { AuthUser } from "@/types/auth";

export function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<AuthUser> {
  return api.post<AuthUser>("/auth/login", credentials);
}

export function logoutUser(): Promise<void> {
  return api.post<void>("/auth/logout");
}

export function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>("/auth/me");
}
