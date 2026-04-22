/**
 * Base API client for the shared backend.
 *
 * In production, set NEXT_PUBLIC_API_URL to the backend origin.
 * In development, Next.js rewrites in next.config.ts can proxy /api/* to avoid CORS.
 */
// Server-side Node fetch requires an absolute URL; fall back to localhost for dev.
// In production set NEXT_PUBLIC_API_URL to the backend's public origin.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (typeof window === "undefined" ? "http://localhost:8080" : "");

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    // Public endpoints — no credentials needed
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      message = body.message ?? message;
    } catch {
      // ignore parse failures
    }
    throw new ApiError(res.status, message);
  }

  let envelope: ApiEnvelope<T>;
  try {
    envelope = await res.json();
  } catch {
    // Backend returned a non-JSON body on a 2xx (e.g. proxy HTML page).
    // Treat it as a server error so callers get a typed ApiError, not a SyntaxError.
    throw new ApiError(res.status, `Unexpected non-JSON response from ${path}`);
  }
  return envelope.data;
}

export const apiClient = {
  get<T>(path: string, init?: RequestInit) {
    return request<T>(path, { ...init, method: "GET" });
  },
  post<T>(path: string, body: unknown, init?: RequestInit) {
    return request<T>(path, {
      ...init,
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};
