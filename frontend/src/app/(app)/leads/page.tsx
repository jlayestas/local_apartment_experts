"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getLeads, getAssignableUsers } from "@/lib/api/leads";
import { useTranslations } from "@/lib/i18n";
import { formatLocalDate, localToday } from "@/lib/utils/date";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { LeadFilters, LeadSource, LeadStatus, LeadSummary } from "@/types/lead";
import type { PagedResponse, UserSummary } from "@/types/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: LeadStatus[] = [
  "NEW",
  "CONTACT_ATTEMPTED",
  "CONTACTED",
  "QUALIFIED",
  "APPOINTMENT_SCHEDULED",
  "APPLICATION_IN_PROGRESS",
  "CLOSED_WON",
  "CLOSED_LOST",
  "UNRESPONSIVE",
];

const ALL_SOURCES: LeadSource[] = [
  "WEBSITE",
  "REFERRAL",
  "FACEBOOK",
  "WALKIN",
  "OTHER",
];

const DEFAULT_FILTERS: LeadFilters = { page: 0, size: 20 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasActiveFilters(f: LeadFilters): boolean {
  return !!(
    f.search ||
    f.status ||
    f.assignedUserId ||
    f.source ||
    f.followUpDue
  );
}

function formatDate(iso: string): string {
  // createdAt is a full datetime — safe to parse with new Date()
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── FilterBar ─────────────────────────────────────────────────────────────────

type FilterBarProps = {
  filters: LeadFilters;
  users: UserSummary[];
  onFiltersChange: (next: LeadFilters) => void;
  t: ReturnType<typeof useTranslations>;
};

function FilterBar({ filters, users, onFiltersChange, t }: FilterBarProps) {
  // Local search input value — only committed to filters on submit / Enter
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const prevSearch = useRef(filters.search ?? "");

  // Keep the input in sync if filters are cleared externally
  useEffect(() => {
    if (!filters.search && prevSearch.current) {
      setSearchInput("");
    }
    prevSearch.current = filters.search ?? "";
  }, [filters.search]);

  function commitSearch(e: React.FormEvent) {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput.trim() || undefined, page: 0 });
  }

  function setFilter<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) {
    onFiltersChange({ ...filters, [key]: value, page: 0 });
  }

  function clearAll() {
    setSearchInput("");
    onFiltersChange(DEFAULT_FILTERS);
  }

  const selectClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      {/* Row 1: search */}
      <form onSubmit={commitSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t.leads.searchPlaceholder}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button type="submit" variant="secondary" size="sm">
          {t.common.search}
        </Button>
      </form>

      {/* Row 2: categorical filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status */}
        <select
          value={filters.status ?? ""}
          onChange={(e) =>
            setFilter("status", (e.target.value as LeadStatus) || undefined)
          }
          className={selectClass}
        >
          <option value="">{t.leads.filters.allStatuses}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t.leads.status[s]}
            </option>
          ))}
        </select>

        {/* Agent */}
        <select
          value={filters.assignedUserId ?? ""}
          onChange={(e) => setFilter("assignedUserId", e.target.value || undefined)}
          className={selectClass}
        >
          <option value="">{t.leads.filters.allAgents}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.firstName} {u.lastName}
            </option>
          ))}
        </select>

        {/* Source */}
        <select
          value={filters.source ?? ""}
          onChange={(e) =>
            setFilter("source", (e.target.value as LeadSource) || undefined)
          }
          className={selectClass}
        >
          <option value="">{t.leads.filters.allSources}</option>
          {ALL_SOURCES.map((s) => (
            <option key={s} value={s}>
              {t.leads.source[s]}
            </option>
          ))}
        </select>

        {/* Follow-up due toggle */}
        <label className="flex cursor-pointer items-center gap-2 select-none text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.followUpDue === true}
            onChange={(e) => setFilter("followUpDue", e.target.checked || undefined)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          {t.leads.filters.followUpDue}
        </label>

        {/* Clear — only shown when any filter is active */}
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            {t.leads.filters.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}

// ── LeadsTable ────────────────────────────────────────────────────────────────

type LeadsTableProps = {
  leads: LeadSummary[];
  t: ReturnType<typeof useTranslations>;
};

function LeadCard({ lead, t }: { lead: LeadSummary; t: ReturnType<typeof useTranslations> }) {
  return (
    <Link
      href={`/leads/${lead.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-4 active:bg-gray-50"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {lead.firstName} {lead.lastName}
          </p>
          {lead.phone && (
            <p className="mt-0.5 text-sm text-gray-500">{lead.phone}</p>
          )}
        </div>
        <Badge variant="status" value={lead.status} label={t.leads.status[lead.status]} />
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <span>
          {lead.assignedUserName ?? (
            <span className="italic">{t.leads.detail.overview.unassigned}</span>
          )}
        </span>
        {lead.nextFollowUpDate ? (
          <FollowUpDate iso={lead.nextFollowUpDate} status={lead.status} />
        ) : (
          <span>—</span>
        )}
      </div>
    </Link>
  );
}

function LeadsTable({ leads, t }: LeadsTableProps) {
  const router = useRouter();

  const COLUMNS = [
    t.leads.table.name,
    t.leads.table.phone,
    t.leads.table.email,
    t.leads.table.source,
    t.leads.table.status,
    t.leads.table.agent,
    t.leads.table.followUp,
    t.leads.table.created,
  ];

  return (
    <>
      {/* Mobile card list */}
      <div className="sm:hidden space-y-3 p-4">
        {leads.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">{t.leads.noLeads}</p>
        ) : (
          leads.map((lead) => <LeadCard key={lead.id} lead={lead} t={t} />)
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-gray-400 whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr>
                <td
                  colSpan={COLUMNS.length}
                  className="px-5 py-12 text-center text-sm text-gray-400"
                >
                  {t.leads.noLeads}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => router.push(`/leads/${lead.id}`)}
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                    <Link
                      href={`/leads/${lead.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-indigo-600 transition-colors"
                    >
                      {lead.firstName} {lead.lastName}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                    {lead.phone ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 max-w-[200px] truncate">
                    {lead.email ?? <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                    {lead.source ? t.leads.source[lead.source] : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Badge variant="status" value={lead.status} label={t.leads.status[lead.status]} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                    {lead.assignedUserName ?? (
                      <span className="italic text-gray-400">
                        {t.leads.detail.overview.unassigned}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {lead.nextFollowUpDate ? (
                      <FollowUpDate iso={lead.nextFollowUpDate} status={lead.status} />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}

const CLOSED_STATUSES = new Set(["CLOSED_WON", "CLOSED_LOST", "UNRESPONSIVE"]);

function FollowUpDate({ iso, status }: { iso: string; status: string }) {
  const isOverdue = iso <= localToday() && !CLOSED_STATUSES.has(status);
  return (
    <span className={isOverdue ? "font-medium text-red-600" : "text-gray-600"}>
      {formatLocalDate(iso)}
    </span>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

type PaginationProps = {
  page: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
  onPage: (p: number) => void;
  t: ReturnType<typeof useTranslations>;
};

function Pagination({ page, totalPages, totalElements, isLast, onPage, t }: PaginationProps) {
  const pg = t.leads.pagination;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p className="text-xs text-gray-400">
        {totalElements} {pg.results}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 0}
            onClick={() => onPage(page - 1)}
          >
            ← {pg.previous}
          </Button>
          <span className="px-2 text-xs text-gray-500">
            {page + 1} {pg.pageOf} {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={isLast}
            onClick={() => onPage(page + 1)}
          >
            {pg.next} →
          </Button>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: PagedResponse<LeadSummary> };

function filtersFromSearchParams(params: URLSearchParams): LeadFilters {
  const filters: LeadFilters = { page: 0, size: 20 };
  const status = params.get("status");
  const assignedUserId = params.get("assignedUserId");
  const source = params.get("source");
  const followUpDue = params.get("followUpDue");
  const search = params.get("search");
  if (status) filters.status = status as LeadStatus;
  if (assignedUserId) filters.assignedUserId = assignedUserId;
  if (source) filters.source = source as LeadSource;
  if (followUpDue === "true") filters.followUpDue = true;
  if (search) filters.search = search;
  return filters;
}

export default function LeadsPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();

  const initialFilters = filtersFromSearchParams(searchParams);

  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [filters, setFilters] = useState<LeadFilters>(initialFilters);
  const [users, setUsers] = useState<UserSummary[]>([]);

  const load = useCallback((f: LeadFilters) => {
    setPageState({ status: "loading" });
    getLeads(f)
      .then((data) => setPageState({ status: "ready", data }))
      .catch(() => setPageState({ status: "error" }));
  }, []);

  // Initial load — also fetch assignable users for the agent filter dropdown
  useEffect(() => {
    load(initialFilters);
    getAssignableUsers().then(setUsers).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load]);

  function handleFiltersChange(next: LeadFilters) {
    setFilters(next);
    load(next);
  }

  function handlePage(page: number) {
    const next = { ...filters, page };
    setFilters(next);
    load(next);
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t.leads.title}</h1>
        <Link href="/leads/new">
          <Button>{t.leads.newLead}</Button>
        </Link>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters}
        users={users}
        onFiltersChange={handleFiltersChange}
        t={t}
      />

      {/* Table card */}
      <div className="rounded-xl border border-gray-200 bg-white">
        {pageState.status === "loading" && (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-6 w-6 text-indigo-500" />
          </div>
        )}

        {pageState.status === "error" && (
          <div className="flex items-center justify-between px-5 py-4">
            <p className="text-sm text-red-600">{t.common.error}</p>
            <Button variant="secondary" size="sm" onClick={() => load(filters)}>
              {t.common.retry}
            </Button>
          </div>
        )}

        {pageState.status === "ready" && (
          <>
            <LeadsTable leads={pageState.data.content} t={t} />
            <Pagination
              page={pageState.data.page}
              totalPages={pageState.data.totalPages}
              totalElements={pageState.data.totalElements}
              isLast={pageState.data.last}
              onPage={handlePage}
              t={t}
            />
          </>
        )}
      </div>
    </div>
  );
}
