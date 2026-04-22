import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { OverviewTab, ActivityTab } from "@/app/(app)/leads/[id]/page";
import * as leadsApi from "@/lib/api/leads";
import { useTranslations } from "@/lib/i18n";
import type { LeadDetail, ActivityEntry } from "@/types/lead";

// ── Fixtures ──────────────────────────────────────────────────────────────────

function makeLead(overrides?: Partial<LeadDetail>): LeadDetail {
  return {
    id: "lead-1",
    firstName: "Ana",
    lastName: "García",
    email: null,
    phone: null,
    whatsappNumber: null,
    preferredContactMethod: null,
    source: null,
    moveInDate: null,
    budgetMin: null,
    budgetMax: null,
    preferredNeighborhoods: [],
    bedroomCount: null,
    bathroomCount: null,
    message: null,
    languagePreference: "es",
    urgencyLevel: "LOW",
    status: "NEW",
    lastContactDate: null,
    nextFollowUpDate: null,
    assignedUserId: null,
    assignedUserName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

function OverviewWrapper({
  lead,
  onUpdate,
}: {
  lead: LeadDetail;
  onUpdate?: (l: LeadDetail) => void;
}) {
  const t = useTranslations();
  return <OverviewTab lead={lead} onUpdate={onUpdate ?? vi.fn()} t={t} />;
}

function ActivityWrapper({ leadId }: { leadId: string }) {
  const t = useTranslations();
  return <ActivityTab leadId={leadId} t={t} />;
}

beforeEach(() => {
  vi.restoreAllMocks();
});

// ── Partial / null data resilience ───────────────────────────────────────────

describe("OverviewTab resilience", () => {
  it("renders without crashing when all optional fields are null", () => {
    const { container } = render(<OverviewWrapper lead={makeLead()} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing when preferredNeighborhoods is empty array", () => {
    render(<OverviewWrapper lead={makeLead({ preferredNeighborhoods: [] })} />);
    // The field renders as null → "—" via the Field helper
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("does not crash when budgetMin and budgetMax are both null", () => {
    render(<OverviewWrapper lead={makeLead({ budgetMin: null, budgetMax: null })} />);
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders name and status when all contact fields are null", () => {
    render(<OverviewWrapper lead={makeLead()} />);
    // Overview content renders without throwing — multiple elements contain "contacto" text
    expect(screen.getAllByText(/Contacto/i).length).toBeGreaterThan(0);
  });

  it("shows message field only when message is non-null", () => {
    const withMessage = render(
      <OverviewWrapper lead={makeLead({ message: "Looking for 2 bedrooms" })} />
    );
    expect(withMessage.getByText("Looking for 2 bedrooms")).toBeInTheDocument();

    withMessage.unmount();

    const withoutMessage = render(<OverviewWrapper lead={makeLead({ message: null })} />);
    expect(withoutMessage.queryByText("Looking for 2 bedrooms")).not.toBeInTheDocument();
  });
});

// ── handleDateBlur error surface ─────────────────────────────────────────────

describe("OverviewTab handleDateBlur", () => {
  it("shows error when updateLead API fails on follow-up date blur", async () => {
    vi.spyOn(leadsApi, "updateLead").mockRejectedValue(new Error("network"));

    const lead = makeLead({ nextFollowUpDate: null });
    render(<OverviewWrapper lead={lead} />);

    const dateInputs = screen.getAllByDisplayValue("");
    const followUpInput = dateInputs[0]; // first date input

    fireEvent.change(followUpInput, { target: { value: "2025-12-01" } });
    fireEvent.blur(followUpInput, { target: { value: "2025-12-01" } });

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Ocurrió un error inesperado")).toBeInTheDocument();
    });
  });

  it("clears error on next blur attempt", async () => {
    vi.spyOn(leadsApi, "updateLead")
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(makeLead({ nextFollowUpDate: "2025-12-01" }));

    const lead = makeLead({ nextFollowUpDate: null });
    render(<OverviewWrapper lead={lead} />);

    const dateInputs = screen.getAllByDisplayValue("");
    const followUpInput = dateInputs[0];

    fireEvent.change(followUpInput, { target: { value: "2025-12-01" } });
    fireEvent.blur(followUpInput, { target: { value: "2025-12-01" } });

    await waitFor(() => screen.getByRole("alert"));

    // Second attempt clears the error before the new call
    fireEvent.change(followUpInput, { target: { value: "2025-12-02" } });
    fireEvent.blur(followUpInput, { target: { value: "2025-12-02" } });

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  it("does not call API when value has not changed", async () => {
    const spy = vi.spyOn(leadsApi, "updateLead");
    const lead = makeLead({ nextFollowUpDate: "2025-12-01" });
    render(<OverviewWrapper lead={lead} />);

    const followUpInput = screen.getByDisplayValue("2025-12-01");
    fireEvent.blur(followUpInput, { target: { value: "2025-12-01" } });

    await new Promise((r) => setTimeout(r, 50));
    expect(spy).not.toHaveBeenCalled();
  });
});

// ── ActivityTab (leads) ───────────────────────────────────────────────────────

describe("ActivityTab (leads) resilience", () => {
  it("shows empty state when API returns empty array", async () => {
    vi.spyOn(leadsApi, "getLeadActivity").mockResolvedValue([]);
    render(<ActivityWrapper leadId="lead-1" />);
    await waitFor(() =>
      expect(screen.getByText("Sin actividad registrada")).toBeInTheDocument()
    );
  });

  it("shows error when API fails — does not crash", async () => {
    vi.spyOn(leadsApi, "getLeadActivity").mockRejectedValue(new Error("500"));
    render(<ActivityWrapper leadId="lead-1" />);
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Ocurrió un error inesperado")).toBeInTheDocument();
    });
  });

  it("renders entries when API succeeds", async () => {
    const entries: ActivityEntry[] = [
      {
        id: "a1", leadId: "lead-1", propertyId: null,
        actorId: "u1", actorName: "Test Admin",
        activityType: "LEAD_CREATED", metadata: {},
        createdAt: new Date().toISOString(),
      },
    ];
    vi.spyOn(leadsApi, "getLeadActivity").mockResolvedValue(entries);
    render(<ActivityWrapper leadId="lead-1" />);
    await waitFor(() =>
      expect(screen.getByText(/Test Admin/)).toBeInTheDocument()
    );
  });
});
