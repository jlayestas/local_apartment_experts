import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/(auth)/login/page";
import * as authApi from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { AuthUser } from "@/types/auth";

const mockLogin = vi.fn();
vi.mock("@/lib/auth/context", () => ({
  useAuthContext: () => ({ login: mockLogin, user: null, logout: vi.fn() }),
}));

// Actual Spanish strings from es.ts
const T = {
  submitBtn: "Ingresar",
  submitBtnLoading: "Ingresando...",
  invalidCredentials: "Correo o contraseña incorrectos",
  accountDisabled: "Tu cuenta está desactivada. Contacta al administrador.",
  genericError: "No se pudo iniciar sesión. Intenta de nuevo.",
  emailLabel: "Correo electrónico",
  passwordLabel: "Contraseña",
};

const mockUser: AuthUser = {
  id: "1", email: "admin@test.local",
  firstName: "Test", lastName: "Admin",
  role: "ADMIN", language: "es",
};

beforeEach(() => {
  vi.restoreAllMocks();
  mockLogin.mockReset();
});

describe("LoginPage", () => {
  it("renders the brand mark", () => {
    render(<LoginPage />);
    expect(screen.getByText("Local AE")).toBeInTheDocument();
    expect(screen.getByText("CRM")).toBeInTheDocument();
  });

  it("renders email and password inputs", () => {
    render(<LoginPage />);
    expect(screen.getByRole("textbox", { name: T.emailLabel })).toBeInTheDocument();
    expect(screen.getByLabelText(T.passwordLabel)).toBeInTheDocument();
  });

  it("renders the submit button with correct text", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: T.submitBtn })).toBeInTheDocument();
  });

  it("does not show error message on initial render", () => {
    render(<LoginPage />);
    expect(screen.queryByText(T.invalidCredentials)).not.toBeInTheDocument();
  });

  it("calls loginUser with entered credentials on submit", async () => {
    const user = userEvent.setup();
    const spy = vi.spyOn(authApi, "loginUser").mockResolvedValue(mockUser);

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "admin@test.local");
    await user.type(screen.getByLabelText(T.passwordLabel), "TestAdmin1!");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith({
        email: "admin@test.local",
        password: "TestAdmin1!",
      });
    });
  });

  it("calls auth context login on successful authentication", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "loginUser").mockResolvedValue(mockUser);

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "admin@test.local");
    await user.type(screen.getByLabelText(T.passwordLabel), "TestAdmin1!");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
    });
  });

  it("shows invalid credentials error on 401", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "loginUser").mockRejectedValue(new ApiError(401, "Bad credentials"));

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "x@x.com");
    await user.type(screen.getByLabelText(T.passwordLabel), "wrong");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(screen.getByText(T.invalidCredentials)).toBeInTheDocument();
    });
  });

  it("shows account disabled error on 403", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "loginUser").mockRejectedValue(new ApiError(403, "Account disabled"));

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "disabled@test.local");
    await user.type(screen.getByLabelText(T.passwordLabel), "Pass1234!");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(screen.getByText(T.accountDisabled)).toBeInTheDocument();
    });
  });

  it("shows generic error on 500 or unexpected failure", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "loginUser").mockRejectedValue(new ApiError(500, "Server error"));

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "x@x.com");
    await user.type(screen.getByLabelText(T.passwordLabel), "pass");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(screen.getByText(T.genericError)).toBeInTheDocument();
    });
  });

  it("shows generic error on non-ApiError (network failure)", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "loginUser").mockRejectedValue(new Error("Network error"));

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "x@x.com");
    await user.type(screen.getByLabelText(T.passwordLabel), "pass");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(screen.getByText(T.genericError)).toBeInTheDocument();
    });
  });

  it("disables submit button while loading", async () => {
    const user = userEvent.setup();
    let resolve!: (v: AuthUser) => void;
    vi.spyOn(authApi, "loginUser").mockImplementation(
      () => new Promise((r) => { resolve = r; })
    );

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "x@x.com");
    await user.type(screen.getByLabelText(T.passwordLabel), "pass");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(screen.getByRole("button")).toBeDisabled();
    });

    // Resolve so we don't leave a dangling promise
    resolve(mockUser);
  });

  it("re-enables submit button after error", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "loginUser").mockRejectedValue(new ApiError(401, "Bad credentials"));

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "x@x.com");
    await user.type(screen.getByLabelText(T.passwordLabel), "bad");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: T.submitBtn })).not.toBeDisabled();
    });
  });

  it("clears previous error when submitting again", async () => {
    const user = userEvent.setup();
    vi.spyOn(authApi, "loginUser")
      .mockRejectedValueOnce(new ApiError(401, "Bad credentials"))
      .mockResolvedValueOnce(mockUser);

    render(<LoginPage />);

    await user.type(screen.getByRole("textbox", { name: T.emailLabel }), "x@x.com");
    await user.type(screen.getByLabelText(T.passwordLabel), "wrong");
    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => expect(screen.getByText(T.invalidCredentials)).toBeInTheDocument());

    await user.click(screen.getByRole("button", { name: T.submitBtn }));

    await waitFor(() => {
      expect(screen.queryByText(T.invalidCredentials)).not.toBeInTheDocument();
    });
  });
});
