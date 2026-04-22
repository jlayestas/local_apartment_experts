import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fetchApi, ApiError } from "@/lib/api/client";

function mockFetch(status: number, body: unknown, ok = status >= 200 && status < 300) {
  return vi.spyOn(global, "fetch").mockResolvedValueOnce({
    status,
    ok,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
  // Prevent window.location.href assignment from throwing in jsdom
  Object.defineProperty(window, "location", {
    value: { pathname: "/dashboard", href: "" },
    writable: true,
  });
});

describe("fetchApi", () => {
  it("returns unwrapped data on successful response", async () => {
    mockFetch(200, { success: true, data: { id: "1", name: "Test" }, message: null });
    const result = await fetchApi<{ id: string; name: string }>("/test");
    expect(result).toEqual({ id: "1", name: "Test" });
  });

  it("prepends /api/v1 to the path", async () => {
    const spy = mockFetch(200, { success: true, data: "ok", message: null });
    await fetchApi("/auth/me");
    expect(spy).toHaveBeenCalledWith("/api/v1/auth/me", expect.any(Object));
  });

  it("includes credentials: include in all requests", async () => {
    const spy = mockFetch(200, { success: true, data: null, message: null });
    await fetchApi("/test");
    expect(spy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("returns undefined for 204 No Content", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      status: 204,
      ok: true,
      json: () => Promise.reject(new Error("no body")),
    } as unknown as Response);
    const result = await fetchApi<void>("/test");
    expect(result).toBeUndefined();
  });

  it("throws ApiError with status 401 on unauthorized response", async () => {
    mockFetch(401, { success: false, data: null, message: "Unauthorized" }, false);
    await expect(fetchApi("/protected")).rejects.toMatchObject({
      name: "ApiError",
      status: 401,
    });
  });

  it("redirects to /login on 401 when not already on /login", async () => {
    window.location.pathname = "/dashboard";
    mockFetch(401, { success: false, data: null, message: "Unauthorized" }, false);
    await expect(fetchApi("/protected")).rejects.toThrow();
    expect(window.location.href).toBe("/login");
  });

  it("does NOT redirect when already on /login to avoid loop", async () => {
    window.location.pathname = "/login";
    mockFetch(401, { success: false, data: null, message: "Unauthorized" }, false);
    await expect(fetchApi("/auth/login")).rejects.toThrow();
    expect(window.location.href).not.toBe("/login");
  });

  it("throws ApiError with correct status on 404", async () => {
    mockFetch(404, { success: false, data: null, message: "Not found" }, false);
    await expect(fetchApi("/missing")).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
      message: "Not found",
    });
  });

  it("throws ApiError with correct status on 400 validation error", async () => {
    mockFetch(400, { success: false, data: null, message: "Validation failed" }, false);
    await expect(fetchApi("/leads")).rejects.toMatchObject({
      name: "ApiError",
      status: 400,
      message: "Validation failed",
    });
  });

  it("falls back to generic message when response body fails to parse", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      status: 500,
      ok: false,
      json: () => Promise.reject(new Error("bad json")),
    } as unknown as Response);
    await expect(fetchApi("/crash")).rejects.toMatchObject({
      status: 500,
      message: "Failed to parse response",
    });
  });

  it("sets Content-Type: application/json header", async () => {
    const spy = mockFetch(200, { success: true, data: null, message: null });
    await fetchApi("/test");
    expect(spy).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ "Content-Type": "application/json" }),
      })
    );
  });
});

describe("ApiError", () => {
  it("has name ApiError", () => {
    const err = new ApiError(404, "Not found");
    expect(err.name).toBe("ApiError");
  });

  it("exposes the HTTP status code", () => {
    const err = new ApiError(422, "Unprocessable");
    expect(err.status).toBe(422);
  });

  it("is an instance of Error", () => {
    expect(new ApiError(500, "Server error")).toBeInstanceOf(Error);
  });
});
