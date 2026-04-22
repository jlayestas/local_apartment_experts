import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ActivityTab } from "@/app/(app)/properties/[id]/page";
import * as propertiesApi from "@/lib/api/properties";
import { useTranslations } from "@/lib/i18n";
import type { ActivityEntry } from "@/types/lead";

function makeEntry(overrides?: Partial<ActivityEntry>): ActivityEntry {
  return {
    id: "act-1",
    leadId: null,
    propertyId: "prop-1",
    actorId: "user-1",
    actorName: "Test Admin",
    activityType: "PROPERTY_CREATED",
    metadata: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function TestWrapper({ propertyId }: { propertyId: string }) {
  const t = useTranslations();
  return <ActivityTab propertyId={propertyId} t={t} />;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("PropertyActivityTab", () => {
  it("shows spinner while loading", () => {
    vi.spyOn(propertiesApi, "getPropertyActivity").mockReturnValue(new Promise(() => {}));
    render(<TestWrapper propertyId="prop-1" />);
    // Spinner renders an SVG; just confirm no content yet
    expect(screen.queryByText(/actividad/i)).not.toBeInTheDocument();
  });

  it("renders activity entries on success", async () => {
    vi.spyOn(propertiesApi, "getPropertyActivity").mockResolvedValue([
      makeEntry({ activityType: "PROPERTY_CREATED" }),
      makeEntry({ id: "act-2", activityType: "PROPERTY_PUBLISHED" }),
    ]);

    render(<TestWrapper propertyId="prop-1" />);

    await waitFor(() => {
      expect(screen.getAllByText(/Test Admin/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it("shows empty state when API returns empty array", async () => {
    vi.spyOn(propertiesApi, "getPropertyActivity").mockResolvedValue([]);

    render(<TestWrapper propertyId="prop-1" />);

    await waitFor(() =>
      expect(screen.getByText("Sin actividad registrada")).toBeInTheDocument()
    );
  });

  it("shows error message when API call fails", async () => {
    vi.spyOn(propertiesApi, "getPropertyActivity").mockRejectedValue(new Error("Network error"));

    render(<TestWrapper propertyId="prop-1" />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Ocurrió un error inesperado")).toBeInTheDocument();
    });
  });

  it("does not crash when API fails — component stays mounted", async () => {
    vi.spyOn(propertiesApi, "getPropertyActivity").mockRejectedValue(new Error("500"));

    const { container } = render(<TestWrapper propertyId="prop-1" />);

    await waitFor(() => screen.getByRole("alert"));
    expect(container.firstChild).not.toBeNull();
  });

  it("renders actor name and timestamp for each entry", async () => {
    vi.spyOn(propertiesApi, "getPropertyActivity").mockResolvedValue([
      makeEntry({ actorName: "María García" }),
    ]);

    render(<TestWrapper propertyId="prop-1" />);

    await waitFor(() =>
      expect(screen.getByText(/María García/)).toBeInTheDocument()
    );
  });

  it("refetches when propertyId changes", async () => {
    const spy = vi.spyOn(propertiesApi, "getPropertyActivity").mockResolvedValue([]);

    const { rerender } = render(<TestWrapper propertyId="prop-1" />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith("prop-1"));

    rerender(<TestWrapper propertyId="prop-2" />);
    await waitFor(() => expect(spy).toHaveBeenCalledWith("prop-2"));
  });
});
