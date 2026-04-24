"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  addLeadNote,
  assignLead,
  changeLeadStatus,
  getAssignableUsers,
  getLead,
  getLeadActivity,
  getLeadNotes,
  updateLead,
} from "@/lib/api/leads";
import { useTranslations } from "@/lib/i18n";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import DatePicker from "@/components/ui/DatePicker";
import FollowUpQuickActions from "@/components/ui/FollowUpQuickActions";
import Spinner from "@/components/ui/Spinner";
import PropertiesTab from "./_components/PropertiesTab";
import type { ActivityEntry, LeadDetail, LeadStatus, Note } from "@/types/lead";
import type { UserSummary } from "@/types/api";

type Tab = "overview" | "notes" | "activity" | "properties";

const ALL_STATUSES: LeadStatus[] = [
  "NEW", "CONTACT_ATTEMPTED", "CONTACTED", "QUALIFIED",
  "APPOINTMENT_SCHEDULED", "APPLICATION_IN_PROGRESS",
  "CLOSED_WON", "CLOSED_LOST", "UNRESPONSIVE",
];

// ── Sub-components ────────────────────────────────────────────────────────────

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-800">{value ?? "—"}</dd>
    </div>
  );
}

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatBudget(min: number | null | undefined, max: number | null | undefined): string | null {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `desde ${fmt(min)}`;
  return `hasta ${fmt(max!)}`;
}

function OverviewTab({
  lead,
  onUpdate,
  onSaved,
  t,
}: {
  lead: LeadDetail;
  onUpdate: (updated: LeadDetail) => void;
  onSaved: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const ov = t.leads.detail.overview;

  // Local controlled state for date fields so the input is responsive while saving.
  const [followUpDate, setFollowUpDate] = useState(lead.nextFollowUpDate ?? "");
  const [lastContactDate, setLastContactDate] = useState(lead.lastContactDate ?? "");
  const [isUpdatingDate, setIsUpdatingDate] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Sync if the parent lead prop changes (e.g. after a save).
  useEffect(() => {
    setFollowUpDate(lead.nextFollowUpDate ?? "");
  }, [lead.nextFollowUpDate]);

  useEffect(() => {
    setLastContactDate(lead.lastContactDate ?? "");
  }, [lead.lastContactDate]);

  const CLOSED_STATUSES = new Set(["CLOSED_WON", "CLOSED_LOST", "UNRESPONSIVE"]);
  const today = new Date().toISOString().slice(0, 10);
  const followUpIsOverdue =
    !!followUpDate && followUpDate <= today && !CLOSED_STATUSES.has(lead.status);

  async function handleDateSave(
    field: "nextFollowUpDate" | "lastContactDate",
    value: string | null,
    original: string | null
  ) {
    if ((value || null) === original) return;
    setIsUpdatingDate(true);
    setDateError(null);
    try {
      const payload = !value && field === "nextFollowUpDate"
        ? { clearNextFollowUpDate: true }
        : { [field]: value };
      const updated = await updateLead(lead.id, payload);
      onUpdate(updated);
      onSaved();
    } catch {
      setDateError(t.common.error);
    } finally {
      setIsUpdatingDate(false);
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {/* Contact */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="font-medium text-gray-900">{ov.contact}</h3>
        <dl className="space-y-3">
          <Field label={t.leads.form.email} value={lead.email} />
          <Field label={t.leads.form.phone} value={lead.phone} />
          <Field label={t.leads.form.whatsapp} value={lead.whatsappNumber} />
          <Field
            label={t.leads.form.preferredContact}
            value={lead.preferredContactMethod
              ? t.leads.contact[lead.preferredContactMethod]
              : null}
          />
          <Field label={ov.language} value={lead.languagePreference} />
        </dl>
      </div>

      {/* Property */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="font-medium text-gray-900">{ov.property}</h3>
        <dl className="space-y-3">
          <Field label={ov.budget} value={formatBudget(lead.budgetMin, lead.budgetMax)} />
          <Field label={ov.bedsBaths} value={`${lead.bedroomCount ?? "—"} / ${lead.bathroomCount ?? "—"}`} />
          <Field label={ov.moveIn} value={formatDate(lead.moveInDate)} />
          <Field
            label={ov.neighborhoods}
            value={lead.preferredNeighborhoods.join(", ") || null}
          />
          {lead.message && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{ov.message}</dt>
              <dd className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{lead.message}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Assignment & follow-up */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="font-medium text-gray-900">{ov.assignment}</h3>
        <dl className="space-y-3">
          <Field
            label={ov.assignedTo}
            value={lead.assignedUserName ?? (
              <span className="text-gray-400 italic">{ov.unassigned}</span>
            )}
          />

          {dateError && (
            <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              {dateError}
            </p>
          )}

          {/* Follow-up date — inline editable */}
          <div>
            <dt className={`text-xs font-medium uppercase tracking-wide ${followUpIsOverdue ? "text-red-500" : "text-gray-400"}`}>
              {ov.followUpDate}{followUpIsOverdue && " · vencido"}
            </dt>
            <dd className="mt-0.5">
              <DatePicker
                value={followUpDate}
                onChange={(v) => {
                  setFollowUpDate(v);
                  handleDateSave("nextFollowUpDate", v || null, lead.nextFollowUpDate);
                }}
                disabled={isUpdatingDate}
              />
              <FollowUpQuickActions
                onSelect={(v) => {
                  setFollowUpDate(v ?? "");
                  handleDateSave("nextFollowUpDate", v, lead.nextFollowUpDate);
                }}
                labels={{
                  today: t.leads.form.followUpToday,
                  plus1: t.leads.form.followUpPlus1,
                  plus3: t.leads.form.followUpPlus3,
                  plus7: t.leads.form.followUpPlus7,
                  clear: t.leads.form.followUpClear,
                }}
              />
            </dd>
          </div>

          {/* Last-contact date — inline editable */}
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              {ov.lastContact}
            </dt>
            <dd className="mt-0.5">
              <DatePicker
                value={lastContactDate}
                onChange={(v) => {
                  setLastContactDate(v);
                  handleDateSave("lastContactDate", v || null, lead.lastContactDate);
                }}
                disabled={isUpdatingDate}
              />
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

function NotesTab({
  leadId,
  t,
}: {
  leadId: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [body, setBody] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getLeadNotes(leadId)
      .then(setNotes)
      .catch(() => setLoadError(true))
      .finally(() => setIsLoading(false));
  }, [leadId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      const note = await addLeadNote(leadId, body.trim());
      setNotes((prev) => [note, ...prev]);
      setBody("");
    } catch {
      setSaveError(t.common.error);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }

  if (loadError) {
    return (
      <p role="alert" className="py-8 text-center text-sm text-red-500">
        {t.common.error}
      </p>
    );
  }

  const nt = t.leads.detail.notes;

  return (
    <div className="space-y-4">
      {/* Add note form */}
      <form
        onSubmit={handleAdd}
        className="rounded-xl border border-gray-200 bg-white p-4 space-y-3"
      >
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder={nt.placeholder}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="flex items-center justify-end gap-3">
          {saveError && (
            <p role="alert" className="text-sm text-red-600">{saveError}</p>
          )}
          <Button type="submit" size="sm" isLoading={isSaving} disabled={!body.trim()}>
            {isSaving ? nt.saving : nt.save}
          </Button>
        </div>
      </form>

      {/* Notes list */}
      {notes.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">{nt.empty}</p>
      ) : (
        notes.map((note) => (
          <div key={note.id} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">{note.authorName}</span>
              <span className="text-xs text-gray-400">
                {new Date(note.createdAt).toLocaleString("es-MX")}
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{note.body}</p>
          </div>
        ))
      )}
    </div>
  );
}

function ActivityTab({
  leadId,
  t,
}: {
  leadId: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    getLeadActivity(leadId)
      .then(setEntries)
      .catch(() => setError(true))
      .finally(() => setIsLoading(false));
  }, [leadId]);

  if (isLoading) {
    return <div className="flex justify-center py-8"><Spinner /></div>;
  }

  if (error) {
    return (
      <p role="alert" className="py-8 text-center text-sm text-red-500">
        {t.common.error}
      </p>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        {t.leads.detail.activity.empty}
      </p>
    );
  }

  function describeActivity(entry: ActivityEntry): string {
    const type = t.leads.activityType[entry.activityType] ?? entry.activityType;
    const meta = entry.metadata as Record<string, string>;

    if (entry.activityType === "STATUS_CHANGED" && meta.from && meta.to) {
      return `${type}: ${t.leads.status[meta.from] ?? meta.from} → ${t.leads.status[meta.to] ?? meta.to}`;
    }
    if (entry.activityType === "ASSIGNED" && meta.assignedToName) {
      return `${type}: ${meta.assignedToName}`;
    }
    return type;
  }

  return (
    <div className="space-y-1">
      {entries.map((entry) => (
        <div key={entry.id} className="flex gap-4 rounded-lg px-4 py-3 hover:bg-gray-50">
          <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-400" />
          <div className="flex-1">
            <p className="text-sm text-gray-800">{describeActivity(entry)}</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {entry.actorName && `${entry.actorName} · `}
              {new Date(entry.createdAt).toLocaleString("es-MX")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const t = useTranslations();
  const router = useRouter();

  const [lead, setLead] = useState<LeadDetail | null>(null);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<"notFound" | "error" | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [headerError, setHeaderError] = useState<string | null>(null);

  useEffect(() => {
    setLoadError(null);
    Promise.all([getLead(id), getAssignableUsers()])
      .then(([l, u]) => {
        setLead(l);
        setUsers(u);
      })
      .catch((err) => {
        setLoadError(err?.status === 404 ? "notFound" : "error");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  function invalidateDashboard() {
    router.refresh();
  }

  async function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!lead || isUpdating) return;
    const status = e.target.value as LeadStatus;
    if (status === lead.status) return;
    setIsUpdating(true);
    setHeaderError(null);
    try {
      const updated = await changeLeadStatus(id, status);
      setLead(updated);
      invalidateDashboard();
    } catch {
      setHeaderError(t.common.error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleAssign(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!lead || isUpdating) return;
    const userId = e.target.value;
    if (!userId || userId === lead.assignedUserId) return;
    setIsUpdating(true);
    setHeaderError(null);
    try {
      const updated = await assignLead(id, userId);
      setLead(updated);
      invalidateDashboard();
    } catch {
      setHeaderError(t.common.error);
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  if (loadError === "notFound") {
    return (
      <p className="py-16 text-center text-sm text-gray-400">
        {t.leads.detail.notFound}
      </p>
    );
  }

  if (loadError === "error" || !lead) {
    return (
      <p role="alert" className="py-16 text-center text-sm text-red-500">
        {t.common.error}
      </p>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: t.leads.detail.tabs.overview },
    { key: "notes", label: t.leads.detail.tabs.notes },
    { key: "activity", label: t.leads.detail.tabs.activity },
    { key: "properties", label: t.leads.detail.tabs.properties },
  ];

  const actions = t.leads.detail.actions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="mb-2 text-sm text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ← {t.common.back}
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
              {lead.firstName} {lead.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {t.leads.detail.lastUpdated}:{" "}
              {new Date(lead.updatedAt).toLocaleString("es-MX")}
            </p>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            {/* Edit button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push(`/leads/${id}/edit`)}
            >
              {t.common.edit}
            </Button>

            {/* Status selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 shrink-0">{actions.changeStatus}</span>
              <select
                value={lead.status}
                onChange={handleStatusChange}
                disabled={isUpdating}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>{t.leads.status[s]}</option>
                ))}
              </select>
            </div>

            {/* Assign selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 shrink-0">{actions.assign}</span>
              <select
                value={lead.assignedUserId ?? ""}
                onChange={handleAssign}
                disabled={isUpdating}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                <option value="">{t.leads.detail.overview.unassigned}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.firstName} {u.lastName}
                  </option>
                ))}
              </select>
            </div>

            {isUpdating && <Spinner className="h-4 w-4 text-indigo-500" />}
            {headerError && (
              <p role="alert" className="text-xs text-red-600">{headerError}</p>
            )}
          </div>
        </div>

        {/* Status + urgency badges */}
        <div className="mt-3 flex gap-2">
          <Badge variant="status" value={lead.status} label={t.leads.status[lead.status]} />
          <Badge variant="urgency" value={lead.urgencyLevel} label={t.leads.urgency[lead.urgencyLevel]} />
          {lead.source && (
            <Badge value={lead.source} label={t.leads.source[lead.source]} />
          )}
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="border-b border-gray-200 overflow-x-auto">
          <nav className="flex -mb-px gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  pb-3 text-sm font-medium transition-colors border-b-2 cursor-pointer
                  ${
                    activeTab === tab.key
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-6">
          {activeTab === "overview" && <OverviewTab lead={lead} onUpdate={setLead} onSaved={invalidateDashboard} t={t} />}
          {activeTab === "notes" && <NotesTab leadId={id} t={t} />}
          {activeTab === "activity" && <ActivityTab leadId={id} t={t} />}
          {activeTab === "properties" && <PropertiesTab leadId={id} />}
        </div>
      </div>
    </div>
  );
}
