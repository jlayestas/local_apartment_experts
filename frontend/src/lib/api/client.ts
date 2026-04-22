import type { ApiResponse } from "@/types/api";

/**
 * Typed error thrown when the backend returns a non-2xx response.
 * Check `status` to distinguish 400 (validation) from 401 (auth) from 404 etc.
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Base fetch wrapper.
 *
 * - Prepends /api/v1 to all paths (the Next.js rewrite proxies to the backend).
 * - Always includes credentials so the session cookie is forwarded.
 * - Unwraps the backend's ApiResponse<T> envelope.
 * - Redirects to /login on 401.
 * - Throws ApiError for all other non-2xx responses.
 */
export async function fetchApi<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // 204 No Content — return undefined
  if (response.status === 204) {
    return undefined as T;
  }

  // 401 — session expired or not authenticated; hard-redirect to login
  // Skip redirect if already on /login to avoid an infinite reload loop.
  if (response.status === 401) {
    if (typeof window !== "undefined" && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    throw new ApiError(401, "Unauthorized");
  }

  const body: ApiResponse<T> = await response.json().catch(() => ({
    success: false,
    data: null as unknown as T,
    message: "Failed to parse response",
    timestamp: new Date().toISOString(),
  }));

  if (!response.ok) {
    throw new ApiError(response.status, body.message ?? "An error occurred");
  }

  return body.data;
}

/** Convenience wrappers for common HTTP verbs. */
export const api = {
  get: <T>(path: string) => fetchApi<T>(path),

  post: <T>(path: string, body?: unknown) =>
    fetchApi<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    fetchApi<T>(path, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown) =>
    fetchApi<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string) => fetchApi<T>(path, { method: "DELETE" }),
};
