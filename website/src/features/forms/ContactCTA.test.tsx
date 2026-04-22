import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import ContactCTA from "./ContactCTA";
import * as leadsApi from "@/lib/api/leads";

vi.mock("@/lib/api/leads", () => ({
  submitPublicLead: vi.fn(),
}));

const mockSubmit = vi.mocked(leadsApi.submitPublicLead);

beforeEach(() => {
  mockSubmit.mockReset();
});

async function fillRequired(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/Nombre|First Name/i), "Ana");
  await user.type(screen.getByLabelText(/Apellido|Last Name/i), "García");
  await user.type(screen.getByLabelText(/Teléfono|Phone/i), "3051234567");
}

describe("ContactCTA", () => {
  it("renders required field indicators on name and phone fields", () => {
    renderWithProviders(<ContactCTA />);
    // Each required label gets a * via Input component
    const asterisks = screen.getAllByText("*");
    // firstName, lastName, phone = 3 required fields
    expect(asterisks.length).toBeGreaterThanOrEqual(3);
  });

  it("renders the required note", () => {
    renderWithProviders(<ContactCTA />);
    expect(screen.getByText(/Campos obligatorios|Required fields/i)).toBeInTheDocument();
  });

  it("renders email and message as optional", () => {
    renderWithProviders(<ContactCTA />);
    // "Opcional" appears at least once (email hint + message label)
    const optionalLabels = screen.getAllByText(/Opcional|Optional/i);
    expect(optionalLabels.length).toBeGreaterThanOrEqual(1);
  });

  it("shows validation error when submitting with empty required fields", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactCTA />);
    await user.click(screen.getByRole("button", { name: /Solicitar|Request/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("shows validation error when only first name is filled", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ContactCTA />);
    await user.type(screen.getByLabelText(/Nombre|First Name/i), "Ana");
    await user.click(screen.getByRole("button", { name: /Solicitar|Request/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("calls submitPublicLead with only required fields when email and message are empty", async () => {
    mockSubmit.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<ContactCTA />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: /Solicitar|Request/i }));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
    expect(mockSubmit).toHaveBeenCalledWith({
      firstName: "Ana",
      lastName: "García",
      phone: "3051234567",
    });
  });

  it("shows success state after successful submission", async () => {
    mockSubmit.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<ContactCTA />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: /Solicitar|Request/i }));
    expect(await screen.findByText(/¡Listo!|You're all set/i)).toBeInTheDocument();
  });

  it("shows generic error message on API failure", async () => {
    mockSubmit.mockRejectedValue(new Error("Network error"));
    const user = userEvent.setup();
    renderWithProviders(<ContactCTA />);
    await fillRequired(user);
    await user.click(screen.getByRole("button", { name: /Solicitar|Request/i }));
    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(/No pudimos|couldn't send/i);
  });

  it("does not block submission when email is provided alongside required fields", async () => {
    mockSubmit.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<ContactCTA />);
    await fillRequired(user);
    await user.type(screen.getByLabelText(/Correo|Email/i), "ana@example.com");
    await user.click(screen.getByRole("button", { name: /Solicitar|Request/i }));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ email: "ana@example.com" })
    );
  });

  it("includes message when provided", async () => {
    mockSubmit.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithProviders(<ContactCTA />);
    await fillRequired(user);
    await user.type(screen.getByRole("textbox", { name: /Mensaje|Message/i }), "Looking for 2BR");
    await user.click(screen.getByRole("button", { name: /Solicitar|Request/i }));
    await waitFor(() => expect(mockSubmit).toHaveBeenCalledOnce());
    expect(mockSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Looking for 2BR" })
    );
  });
});
