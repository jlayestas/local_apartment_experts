import { api } from "./client";
import type { UserDetail, CreateUserPayload, UpdateUserPayload } from "@/types/user";

export function listUsers(): Promise<UserDetail[]> {
  return api.get<UserDetail[]>("/users");
}

export function getUser(id: string): Promise<UserDetail> {
  return api.get<UserDetail>(`/users/${id}`);
}

export function createUser(payload: CreateUserPayload): Promise<UserDetail> {
  return api.post<UserDetail>("/users", payload);
}

export function updateUser(id: string, payload: UpdateUserPayload): Promise<UserDetail> {
  return api.patch<UserDetail>(`/users/${id}`, payload);
}

export function resetUserPassword(id: string, newPassword: string): Promise<void> {
  return api.patch<void>(`/users/${id}/password`, { newPassword });
}
