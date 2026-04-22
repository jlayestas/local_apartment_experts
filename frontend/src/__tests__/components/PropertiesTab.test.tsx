import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PropertiesTab from "@/app/(app)/leads/[id]/_components/PropertiesTab";
import * as leadsApi from "@/lib/api/leads";
import * as propertiesApi from "@/lib/api/properties";
import type { LeadPropertyLink } from "@/types/lead";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const LEAD_ID = "lead-uuid-1";
const PROP_ID = "prop-uuid-1";
const LINK_ID = "link-uuid-1";

function makeLink(overrides?: Partial<LeadPropertyLink>): LeadPropertyLink {
  return {
    id: LINK_ID,
    leadId: LEAD_ID,
    propertyId: PROP_ID,
    linkType: "SUGGESTED",
    note: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    property: {
      id: PROP_ID,
      title: "Apto Polanco 2hab",
      slug: "apto-polanco-2hab",
      city: "CDMX",
      neighborhood: "Polanco",
      propertyType: "APARTMENT",
      price: 9000,
      priceFrequency: "MONTHLY",
      bedrooms: 2,
      status: "PUBLISHED",
    },
    ...overrides,
  };
}

beforeEach(() => {
  vi.restoreAllMocks();
  // Default: empty list
  vi.spyOn(leadsApi, "getLeadPropertyLinks").mockResolvedValue([]);
});

// ── Loading ───────────────────────────────────────────────────────────────────

describe("PropertiesTab loading", () => {
  it("fetches links for the given leadId on mount", async () => {
    const spy = vi.spyOn(leadsApi, "getLeadPropertyLinks").mockResolvedValue([]);
    render(<PropertiesTab leadId={LEAD_ID} />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith(LEAD_ID));
  });

  it("shows empty state when no links exist", async () => {
    render(<PropertiesTab leadId={LEAD_ID} />);
    await waitFor(() =>
      expect(screen.getByText("No hay propiedades vinculadas a este prospecto")).toBeInTheDocument()
    );
  });

  it("renders a link card for each existing link", async () => {
    vi.spyOn(leadsApi, "getLeadPropertyLinks").mockResolvedValue([makeLink()]);
    render(<PropertiesTab leadId={LEAD_ID} />);
    await waitFor(() =>
      expect(screen.getByText("Apto Polanco 2hab")).toBeInTheDocument()
    );
  });
});

// ── Remove (unlink) ───────────────────────────────────────────────────────────

describe("PropertiesTab unlink", () => {
  it("removes card from UI after successful unlink", async () => {
    const user = userEvent.setup();
    vi.spyOn(leadsApi, "getLeadPropertyLinks").mockResolvedValue([makeLink()]);
    vi.spyOn(leadsApi, "removeLeadPropertyLink").mockResolvedValue(undefined);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<PropertiesTab leadId={LEAD_ID} />);
    await waitFor(() => screen.getByText("Apto Polanco 2hab"));

    await user.click(screen.getByText("Desvincular"));

    await waitFor(() =>
      expect(screen.queryByText("Apto Polanco 2hab")).not.toBeInTheDocument()
    );
  });

  it("shows removeError and keeps card when unlink API fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(leadsApi, "getLeadPropertyLinks").mockResolvedValue([makeLink()]);
    vi.spyOn(leadsApi, "removeLeadPropertyLink").mockRejectedValue(new Error("network"));
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<PropertiesTab leadId={LEAD_ID} />);
    await waitFor(() => screen.getByText("Apto Polanco 2hab"));

    await user.click(screen.getByText("Desvincular"));

    await waitFor(() => {
      expect(screen.getByText("No se pudo desvincular la propiedad")).toBeInTheDocument();
      expect(screen.getByText("Apto Polanco 2hab")).toBeInTheDocument();
    });
  });

  it("does not crash when confirm is cancelled", async () => {
    const user = userEvent.setup();
    vi.spyOn(leadsApi, "getLeadPropertyLinks").mockResolvedValue([makeLink()]);
    vi.spyOn(leadsApi, "removeLeadPropertyLink");
    vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<PropertiesTab leadId={LEAD_ID} />);
    await waitFor(() => screen.getByText("Desvincular"));

    await user.click(screen.getByText("Desvincular"));

    expect(leadsApi.removeLeadPropertyLink).not.toHaveBeenCalled();
    expect(screen.getByText("Apto Polanco 2hab")).toBeInTheDocument();
  });
});

// ── Add / link ────────────────────────────────────────────────────────────────

describe("PropertiesTab link property", () => {
  it("shows link error when addLeadPropertyLink fails", async () => {
    const user = userEvent.setup();
    vi.spyOn(propertiesApi, "getProperties").mockResolvedValue({
      content: [
        {
          id: PROP_ID, title: "Apto Polanco 2hab", slug: "apto-polanco",
          city: "CDMX", neighborhood: "Polanco", propertyType: "APARTMENT",
          bedrooms: 2, price: 9000, priceFrequency: "MONTHLY",
          status: "PUBLISHED", featured: false, createdAt: new Date().toISOString(),
        },
      ],
      totalElements: 1, totalPages: 1, page: 0, size: 10,
    });
    vi.spyOn(leadsApi, "addLeadPropertyLink").mockRejectedValue(new Error("server error"));

    render(<PropertiesTab leadId={LEAD_ID} />);

    // Open search panel
    await waitFor(() => screen.getByText(/Vincular propiedad/));
    await user.click(screen.getByText(/Vincular propiedad/));

    // Type in search box
    await user.type(screen.getByPlaceholderText(/Buscar propiedad/), "Polanco");

    // Wait for result to appear
    await waitFor(() => screen.getByText("Apto Polanco 2hab"));

    // Click link button
    const linkBtn = screen.getAllByRole("button").find(
      (b) => b.textContent?.includes("SUGGESTED") || b.textContent?.includes("Suger")
    ) ?? screen.getAllByRole("button")[0];
    await user.click(linkBtn);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("No se pudo vincular la propiedad")).toBeInTheDocument();
    });
  });

  it("adds link card and closes search panel on success", async () => {
    const user = userEvent.setup();
    vi.spyOn(propertiesApi, "getProperties").mockResolvedValue({
      content: [
        {
          id: PROP_ID, title: "Apto Polanco 2hab", slug: "apto-polanco",
          city: "CDMX", neighborhood: "Polanco", propertyType: "APARTMENT",
          bedrooms: 2, price: 9000, priceFrequency: "MONTHLY",
          status: "PUBLISHED", featured: false, createdAt: new Date().toISOString(),
        },
      ],
      totalElements: 1, totalPages: 1, page: 0, size: 10,
    });
    vi.spyOn(leadsApi, "addLeadPropertyLink").mockResolvedValue(makeLink());

    render(<PropertiesTab leadId={LEAD_ID} />);

    await waitFor(() => screen.getByText(/Vincular propiedad/));
    await user.click(screen.getByText(/Vincular propiedad/));

    await user.type(screen.getByPlaceholderText(/Buscar propiedad/), "Polanco");

    await waitFor(() => screen.getByText("Apto Polanco 2hab"));

    const linkBtn = screen.getAllByRole("button").find(
      (b) => b.textContent?.includes("Suger") || b.textContent?.includes("+")
    ) ?? screen.getAllByRole("button").at(-1)!;
    await user.click(linkBtn);

    await waitFor(() => {
      // Search panel should be closed (cancel button gone)
      expect(screen.queryByPlaceholderText(/Buscar propiedad/)).not.toBeInTheDocument();
    });
  });
});
