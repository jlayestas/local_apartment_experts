import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import LanguageSwitcher from "./LanguageSwitcher";

describe("LanguageSwitcher", () => {
  it("renders Español and English labels", () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByText("Español")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
  });

  it("renders flag emoji for each language", () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByText("🇪🇸")).toBeInTheDocument();
    expect(screen.getByText("🇺🇸")).toBeInTheDocument();
  });

  it("marks the active language button with aria-pressed=true", () => {
    renderWithProviders(<LanguageSwitcher />);
    // Default lang is "es"
    const esButton = screen.getByText("Español").closest("button")!;
    const enButton = screen.getByText("English").closest("button")!;
    expect(esButton).toHaveAttribute("aria-pressed", "true");
    expect(enButton).toHaveAttribute("aria-pressed", "false");
  });

  it("switches active state when English is clicked", () => {
    renderWithProviders(<LanguageSwitcher />);
    const enButton = screen.getByText("English").closest("button")!;
    fireEvent.click(enButton);
    expect(enButton).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("Español").closest("button")).toHaveAttribute("aria-pressed", "false");
  });

  it("has aria-label on each button", () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByRole("button", { name: "Español" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "English" })).toBeInTheDocument();
  });
});
