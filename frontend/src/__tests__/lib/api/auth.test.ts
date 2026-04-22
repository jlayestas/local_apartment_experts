import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUser, logoutUser, getMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { AuthUser } from "@/types/auth";

const mockUser: AuthUser = {
  id: "uuid-1",
  email: "admin@test.local",
  firstName: "Test",
  lastName: "Admin",
  role: "ADMIN",
  language: "es",
};

function mockFetch(status: number, body: unknown) {
  return vi.spyOn(global, "fetch").mockResolvedValueOnce({
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  } as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(window, "location", {
    value: { pathname: "/dashboard", href: "" },
    writable: true,
  });
});

describe("loginUser", () => {
  it("returns AuthUser on success", async () => {
    mockFetch(200, { success: true, data: mockUser, message: null });
    const result = await loginUser({ email: "admin@test.local", password: "TestAdmin1!" });
    expect(result).toMatchObject({ email: "admin@test.local", role: "ADMIN" });
  });

  it("posts credentials to /auth/login", async () => {
    const spy = mockFetch(200, { success: true, data: mockUser, message: null });
    await loginUser({ email: "admin@test.local", password: "TestAdmin1!" });
    expect(spy).toHaveBeenCalledWith(
      "/api/v1/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "admin@test.local", password: "TestAdmin1!" }),
      })
    );
  });

  it("throws ApiError 401 on bad credentials", async () => {
    mockFetch(401, { success: false, data: null, message: "Bad credentials" });
    await expect(loginUser({ email: "x@x.com", password: "wrong" })).rejects.toMatchObject({
      status: 401,
    });
  });

  it("throws ApiError 403 on disabled account", async () => {
    mockFetch(403, { success: false, data: null, message: "Account is disabled" });
    await expect(loginUser({ email: "x@x.com", password: "pass" })).rejects.toMatchObject({
      status: 403,
    });
  });
});

describe("logoutUser", () => {
  it("posts to /auth/logout", async () => {
    const spy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      status: 204,
      ok: true,
      json: () => Promise.reject(new Error("no body")),
    } as unknown as Response);
    await logoutUser();
    expect(spy).toHaveBeenCalledWith(
      "/api/v1/auth/logout",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("resolves without error on success", async () => {
    vi.spyOn(global, "fetch").mockResolvedValueOnce({
      status: 200,
      ok: true,
      json: () => Promise.resolve({ success: true, data: null, message: "Logged out" }),
    } as Response);
    await expect(logoutUser()).resolves.not.toThrow();
  });
});

describe("getMe", () => {
  it("returns the current user profile", async () => {
    mockFetch(200, { success: true, data: mockUser, message: null });
    const result = await getMe();
    expect(result).toMatchObject({ id: "uuid-1", email: "admin@test.local" });
  });

  it("throws ApiError 401 when not authenticated", async () => {
    mockFetch(401, { success: false, data: null, message: "Authentication required" });
    await expect(getMe()).rejects.toMatchObject({ status: 401 });
  });
});
