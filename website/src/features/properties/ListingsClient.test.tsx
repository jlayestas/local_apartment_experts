import { describe, it, expect, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/utils";
import ListingsClient from "./ListingsClient";
import type { PropertySummary } from "@/types/property";

vi.mock("next/link", () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) => (
    <a href={href} className={className}>{children}</a>
  ),
}));

function makeProperty(overrides: Partial<PropertySummary> = {}): PropertySummary {
  return {
    id: "id",
    title: "Test Property",
    slug: "test-property",
    neighborhood: null,
    city: "Miami",
    state: "FL",
    price: 2000,
    priceFrequency: "MONTHLY",
    propertyType: "APARTMENT",
    bedrooms: 2,
    bathrooms: 1,
    squareFeet: null,
    featured: false,
    contactPhone: null,
    publishedAt: "2024-01-01T00:00:00Z",
    coverImageUrl: null,
    ...overrides,
  };
}

const PROPS = [
  makeProperty({ id: "1", title: "Brickell Studio",   city: "Miami",        neighborhood: "Brickell", price: 1500, bedrooms: 1, propertyType: "STUDIO",    slug: "brickell-studio"   }),
  makeProperty({ id: "2", title: "Wynwood Loft",       city: "Miami",        neighborhood: "Wynwood",  price: 2500, bedrooms: 2, propertyType: "APARTMENT", slug: "wynwood-loft"      }),
  makeProperty({ id: "3", title: "Coral Gables House", city: "Coral Gables", neighborhood: null,       price: 4000, bedrooms: 4, propertyType: "HOUSE",     slug: "coral-gables-house" }),
];

describe("ListingsClient", () => {
  it("renders a card for each property", () => {
    renderWithProviders(<ListingsClient initialProperties={PROPS} />);
    expect(screen.getByText("Brickell Studio")).toBeInTheDocument();
    expect(screen.getByText("Wynwood Loft")).toBeInTheDocument();
    expect(screen.getByText("Coral Gables House")).toBeInTheDocument();
  });

  it("shows the total property count", () => {
    renderWithProviders(<ListingsClient initialProperties={PROPS} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows no-properties empty state when initialProperties is empty", () => {
    renderWithProviders(<ListingsClient initialProperties={[]} />);
    // ES: "No hay propiedades disponibles por el momento"
    expect(screen.getByText(/No hay propiedades|No properties available/i)).toBeInTheDocument();
  });

  it("pre-populates search input from initialSearch prop", () => {
    renderWithProviders(<ListingsClient initialProperties={PROPS} initialSearch="brickell" />);
    // Only Brickell Studio matches; the other two should not be visible
    expect(screen.getByText("Brickell Studio")).toBeInTheDocument();
    expect(screen.queryByText("Wynwood Loft")).not.toBeInTheDocument();
    expect(screen.queryByText("Coral Gables House")).not.toBeInTheDocument();
  });

  it("shows no-results empty state when filters match nothing", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListingsClient initialProperties={PROPS} />);
    const searchInput = screen.getByPlaceholderText(/Título|Title|city|ciudad/i);
    await user.type(searchInput, "xyz-no-match");
    // ES: "Sin resultados para estos filtros"
    expect(await screen.findByText(/Sin resultados|No results/i)).toBeInTheDocument();
  });

  it("shows active filter chip for search term", () => {
    renderWithProviders(<ListingsClient initialProperties={PROPS} initialSearch="brickell" />);
    expect(screen.getByText(/"brickell"/)).toBeInTheDocument();
  });

  it("removes filter when chip × is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListingsClient initialProperties={PROPS} initialSearch="brickell" />);
    // Click the chip button (contains the search label)
    const chip = screen.getByText(/"brickell"/).closest("button")!;
    await user.click(chip);
    // All three properties should now be visible again
    expect(screen.getByText("Wynwood Loft")).toBeInTheDocument();
    expect(screen.getByText("Coral Gables House")).toBeInTheDocument();
  });

  it("clears all filters when 'Clear all' is clicked", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListingsClient initialProperties={PROPS} initialSearch="brickell" />);
    await user.click(screen.getByText(/Limpiar todo|Clear all/i));
    expect(screen.getByText("Wynwood Loft")).toBeInTheDocument();
    expect(screen.getByText("Coral Gables House")).toBeInTheDocument();
  });

  it("sorts properties by price ascending", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListingsClient initialProperties={PROPS} />);
    // The sort select is the only combobox that contains a "newest" option
    const sortSelect = screen
      .getAllByRole("combobox")
      .find((el) => el.querySelector('option[value="newest"]'))!;
    await user.selectOptions(sortSelect, "price_asc");
    const links = screen.getAllByRole("link");
    expect(within(links[0]).getByText("Brickell Studio")).toBeInTheDocument();
  });

  it("sorts properties by price descending", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ListingsClient initialProperties={PROPS} />);
    const sortSelect = screen
      .getAllByRole("combobox")
      .find((el) => el.querySelector('option[value="newest"]'))!;
    await user.selectOptions(sortSelect, "price_desc");
    const links = screen.getAllByRole("link");
    expect(within(links[0]).getByText("Coral Gables House")).toBeInTheDocument();
  });
});
