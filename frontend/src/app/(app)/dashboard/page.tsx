"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardSummary, getRecentLeads } from "@/lib/api/dashboard";
import { getLeads } from "@/lib/api/leads";
import { useAuthContext } from "@/lib/auth/context";
import { useTranslations } from "@/lib/i18n";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import type { DashboardSummary } from "@/types/api";
import type { LeadSummary } from "@/types/lead";

// ── Summary card ──────────────────────────────────────────────────────────────

type CardAccent = "blue" | "amber" | "yellow" | "red";

const ACCENT_CLASSES: Record<CardAccent, { icon: string; value: string; bg: string }> = {
  blue:   { icon: "text-blue-500",   value: "text-blue-700",  bg: "bg-blue-50"   },
  amber:  { icon: "text-amber-500",  value: "text-amber-700", bg: "bg-amber-50"  },
  yellow: { icon: "text-yellow-500", value: "text-yellow-700",bg: "bg-yellow-50" },
  red:    { icon: "text-red-500",    value: "text-red-700",   bg: "bg-red-50"    },
};

function SummaryCard({
  label,
  value,
  accent,
  icon,
  href,
}: {
  label: string;
  value: number;
  accent: CardAccent;
  icon: React.ReactNode;
  href?: string;
}) {
  const cls = ACCENT_CLASSES[accent];
  const inner = (
    <>
      <div className={`rounded-lg p-2.5 ${cls.bg}`}>
        <span className={cls.icon}>{icon}</span>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 leading-tight">{label}</p>
        <p className={`mt-1 text-3xl font-bold tabular-nums ${cls.value}`}>{value}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md active:opacity-90"
      >
        {inner}
      </Link>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
      {inner}
    </div>
  );
}

// ── Icons (inline SVG, no external dependency) ────────────────────────────────

function IconSparkle() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9H20M4 12H3m15.07-6.07-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z" />
    </svg>
  );
}

function IconUserOff() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h11m2-4l-4-4" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  );
}

// ── Recent leads table ────────────────────────────────────────────────────────

function RecentLeadsTable({
  leads,
  t,
}: {
  leads: LeadSummary[];
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      {/* Mobile card list */}
      <div className="sm:hidden divide-y divide-gray-100">
        {leads.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-400">{t.common.noData}</p>
        ) : (
          leads.map((lead) => (
            <Link
              key={lead.id}
              href={`/leads/${lead.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 active:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {lead.firstName} {lead.lastName}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                  {lead.assignedUserName ?? (
                    <span className="italic">{t.leads.detail.overview.unassigned}</span>
                  )}
                </p>
              </div>
              <Badge variant="status" value={lead.status} label={t.leads.status[lead.status]} />
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left">
              {[
                t.leads.table.name,
                t.leads.table.status,
                t.leads.table.urgency,
                t.leads.table.agent,
                t.leads.table.created,
              ].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                  {t.common.noData}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link
                      href={`/leads/${lead.id}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {lead.firstName} {lead.lastName}
                    </Link>
                    {lead.email && (
                      <p className="mt-0.5 text-xs text-gray-400">{lead.email}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="status" value={lead.status} label={t.leads.status[lead.status]} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="urgency" value={lead.urgencyLevel} label={t.leads.urgency[lead.urgencyLevel]} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {lead.assignedUserName ?? (
                      <span className="italic text-gray-400">
                        {t.leads.detail.overview.unassigned}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(lead.createdAt).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
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

// ── My follow-ups today ───────────────────────────────────────────────────────

function MyFollowUps({
  userId,
  t,
}: {
  userId: string;
  t: ReturnType<typeof useTranslations>;
}) {
  const [leads, setLeads] = useState<LeadSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const mf = t.dashboard.myFollowUps;
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    getLeads({ followUpDue: true, assignedUserId: userId, size: 10 })
      .then((res) => setLeads(res.content))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [userId]);

  const viewAllHref = `/leads?followUpDue=true&assignedUserId=${userId}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h2 className="font-semibold text-gray-900">{mf.title}</h2>
        <Link
          href={viewAllHref}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {mf.viewAll} →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Spinner className="h-5 w-5 text-indigo-500" />
        </div>
      ) : leads.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-gray-400">{mf.empty}</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {leads.map((lead) => {
            const isOverdue = !!lead.nextFollowUpDate && lead.nextFollowUpDate < today;
            return (
              <li key={lead.id}>
                <Link
                  href={`/leads/${lead.id}`}
                  className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors active:bg-gray-100"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {lead.firstName} {lead.lastName}
                    </p>
                    {lead.nextFollowUpDate && (
                      <p className={`mt-0.5 text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-400"}`}>
                        {new Date(lead.nextFollowUpDate).toLocaleDateString("es-MX", {
                          day: "numeric",
                          month: "short",
                        })}
                        {isOverdue && ` · ${mf.overdue}`}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0">
                    <Badge variant="status" value={lead.status} label={t.leads.status[lead.status]} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

type PageState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; summary: DashboardSummary; leads: LeadSummary[] };

export default function DashboardPage() {
  const t = useTranslations();
  const { user } = useAuthContext();
  const [state, setState] = useState<PageState>({ status: "loading" });

  const load = useCallback(() => {
    setState({ status: "loading" });
    Promise.all([getDashboardSummary(), getRecentLeads()])
      .then(([summary, leads]) => setState({ status: "ready", summary, leads }))
      .catch(() => setState({ status: "error" }));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ── Loading ──

  if (state.status === "loading") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8 text-indigo-500" />
      </div>
    );
  }

  // ── Error ──

  if (state.status === "error") {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t.dashboard.title}</h1>
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm text-red-700">{t.common.error}</p>
          <Button variant="secondary" size="sm" onClick={load}>
            {t.common.retry}
          </Button>
        </div>
      </div>
    );
  }

  // ── Ready ──

  const { summary, leads } = state;

  const cards: Array<{
    label: string;
    value: number;
    accent: CardAccent;
    icon: React.ReactNode;
    href?: string;
  }> = [
    {
      label: t.dashboard.summary.newLeads,
      value: summary.newLeadsCount,
      accent: "blue",
      icon: <IconSparkle />,
      href: "/leads?status=NEW",
    },
    {
      label: t.dashboard.summary.unassigned,
      value: summary.unassignedLeadsCount,
      accent: "amber",
      icon: <IconUserOff />,
    },
    {
      label: t.dashboard.summary.dueToday,
      value: summary.dueTodayCount,
      accent: "yellow",
      icon: <IconClock />,
      href: "/leads?followUpDue=true",
    },
    {
      label: t.dashboard.summary.overdue,
      value: summary.overdueCount,
      accent: "red",
      icon: <IconAlert />,
      href: "/leads?followUpDue=true",
    },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">{t.dashboard.title}</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </div>

      {/* My follow-ups today — shown to all logged-in users */}
      {user && <MyFollowUps userId={user.id} t={t} />}

      {/* Recent leads */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="font-semibold text-gray-900">{t.dashboard.recentLeads}</h2>
          <Link
            href="/leads"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
          >
            {t.dashboard.viewAll} →
          </Link>
        </div>
        <RecentLeadsTable leads={leads} t={t} />
      </div>
    </div>
  );
}
