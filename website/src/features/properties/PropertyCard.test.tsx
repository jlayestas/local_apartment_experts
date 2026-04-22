import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/utils";
import PropertyCard from "./PropertyCard";
import type { PropertySummary } from "@/types/property";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

const base: PropertySummary = {
  id: "1",
  title: "Brickell Apartment",
  slug: "brickell-apartment",
  neighborhood: "Brickell",
  city: "Miami",
  state: "FL",
  price: 2500,
  priceFrequency: "MONTHLY",
  propertyType: "APARTMENT",
  bedrooms: 2,
  bathrooms: 2,
  squareFeet: 900,
  featured: false,
  contactPhone: null,
  publishedAt: "2024-01-01T00:00:00Z",
  coverImageUrl: null,
};

describe("PropertyCard", () => {
  it("renders the property title", () => {
    renderWithProviders(<PropertyCard property={base} />);
    expect(screen.getByText("Brickell Apartment")).toBeInTheDocument();
  });

  it("renders neighborhood and city together", () => {
    renderWithProviders(<PropertyCard property={base} />);
    expect(screen.getByText("Brickell, Miami")).toBeInTheDocument();
  });

  it("renders only city when neighborhood is null", () => {
    renderWithProviders(<PropertyCard property={{ ...base, neighborhood: null }} />);
    expect(screen.getByText("Miami")).toBeInTheDocument();
  });

  it("renders the price with monthly label", () => {
    renderWithProviders(<PropertyCard property={base} />);
    // In Spanish: $2,500 / mes
    expect(screen.getByText(/\$2,500/)).toBeInTheDocument();
  });

  it("renders property type badge in Spanish by default", () => {
    renderWithProviders(<PropertyCard property={base} />);
    expect(screen.getByText("Apartamento")).toBeInTheDocument();
  });

  it("renders the Featured badge when featured is true", () => {
    renderWithProviders(<PropertyCard property={{ ...base, featured: true }} />);
    expect(screen.getByText("Destacada")).toBeInTheDocument();
  });

  it("does not render Featured badge when featured is false", () => {
    renderWithProviders(<PropertyCard property={base} />);
    expect(screen.queryByText("Destacada")).not.toBeInTheDocument();
  });

  it("links to the correct slug URL", () => {
    renderWithProviders(<PropertyCard property={base} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/listings/brickell-apartment");
  });

  it("renders cover image when coverImageUrl is provided", () => {
    const { container } = renderWithProviders(
      <PropertyCard property={{ ...base, coverImageUrl: "https://example.com/photo.jpg" }} />
    );
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/photo.jpg");
  });

  it("renders placeholder SVG when no coverImageUrl", () => {
    const { container } = renderWithProviders(<PropertyCard property={base} />);
    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders beds and baths labels", () => {
    renderWithProviders(<PropertyCard property={base} />);
    // ES: "2 hab." and "2 baños"
    expect(screen.getByText("2 hab.")).toBeInTheDocument();
    expect(screen.getByText("2 baños")).toBeInTheDocument();
  });

  it("renders square footage when provided", () => {
    renderWithProviders(<PropertyCard property={base} />);
    expect(screen.getByText("900 sq ft")).toBeInTheDocument();
  });

  it("does not render square footage when squareFeet is null", () => {
    renderWithProviders(<PropertyCard property={{ ...base, squareFeet: null }} />);
    expect(screen.queryByText(/sq ft/)).not.toBeInTheDocument();
  });
});
