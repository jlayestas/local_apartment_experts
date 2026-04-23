"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addLeadPropertyLink, getRecommendedProperties } from "@/lib/api/leads";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useTranslations } from "@/lib/i18n";
import type { LeadPropertyLink, RecommendedProperty } from "@/types/lead";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(
  price: number | null,
  frequency: string | null,
  freqMap: Record<string, string>
): string {
  if (price == null) return "—";
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
  const freq = frequency ? freqMap[frequency] : "";
  return freq ? `${formatted}/${freq}` : formatted;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function scoreClasses(score: number): string {
  if (score >= 60) return "bg-emerald-100 text-emerald-700";
  if (score >= 25) return "bg-amber-100 text-amber-700";
  if (score > 0)   return "bg-gray-100 text-gray-600";
  return "bg-red-100 text-red-600";
}

function isPositiveReason(reason: string): boolean {
  return !reason.includes("not") && !reason.includes("above");
}

// ── StatCell ─────────────────────────────────────────────────────────────────

function StatCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-gray-800">{value}</dd>
    </div>
  );
}

// ── RecommendedPropertyCard ───────────────────────────────────────────────────

type CardProps = {
  rec: RecommendedProperty;
  isLinked: boolean;
  isSaving: boolean;
  saveError: string | null;
  onSave: () => void;
  t: ReturnType<typeof useTranslations>;
};

function RecommendedPropertyCard({
  rec,
  isLinked,
  isSaving,
  saveError,
  onSave,
  t,
}: CardProps) {
  const p = rec.property;
  const rt = t.leads.detail.properties.recommendations;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 truncate min-w-0">
          {p.title}
        </h4>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold tabular-nums ${scoreClasses(rec.score)}`}
        >
          {rec.score} {rt.scoreLabel}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Location */}
        <p className="flex items-center gap-1.5 text-xs text-gray-500">
          <svg
            className="h-3.5 w-3.5 shrink-0 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
          {[p.neighborhood, p.city].filter(Boolean).join(", ") || "—"}
        </p>

        {/* Stats grid */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4">
          <StatCell
            label={rt.price}
            value={formatPrice(p.price, p.priceFrequency, t.properties.priceFrequency)}
          />
          <StatCell
            label={rt.beds}
            value={p.bedrooms != null ? String(p.bedrooms) : "—"}
          />
          <StatCell
            label={rt.baths}
            value={p.bathrooms != null ? String(p.bathrooms) : "—"}
          />
          <StatCell
            label={rt.available}
            value={formatDate(p.availableDate)}
          />
        </dl>

        {/* Match reasons */}
        {rec.matchReasons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {rec.matchReasons.map((reason) => {
              const positive = isPositiveReason(reason);
              const label =
                rt.matchReasonLabels[
                  reason as keyof typeof rt.matchReasonLabels
                ] ?? reason;
              return (
                <span
                  key={reason}
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
                    positive
                      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                      : "border-red-100 bg-red-50 text-red-600"
                  }`}
                >
                  {positive ? "✓" : "✗"} {label}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center gap-2 flex-wrap border-t border-gray-100 bg-gray-50 px-5 py-3">
        {/* View Property */}
        <Link
          href={`/properties/${p.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12s3.375-6.75 9.75-6.75S21.75 12 21.75 12s-3.375 6.75-9.75 6.75S2.25 12 2.25 12z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {rt.viewProperty}
        </Link>

        {/* Save to Lead */}
        <Button
          size="sm"
          variant={isLinked ? "secondary" : "primary"}
          disabled={isLinked || isSaving}
          isLoading={isSaving}
          onClick={onSave}
        >
          {isSaving
            ? rt.saving
            : isLinked
            ? `✓ ${rt.saved}`
            : rt.saveToLead}
        </Button>

        {/* WhatsApp — placeholder */}
        <button
          type="button"
          disabled
          title={rt.whatsappTooltip}
          className="ml-auto inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-400 opacity-50"
        >
          <svg
            className="h-3.5 w-3.5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          {rt.whatsapp}
        </button>
      </div>

      {saveError && (
        <p className="px-5 pb-3 text-xs text-red-600">{saveError}</p>
      )}
    </div>
  );
}

// ── RecommendedPropertiesSection ──────────────────────────────────────────────

type Props = {
  leadId: string;
  linkedIds: Set<string>;
  onLinked: (link: LeadPropertyLink) => void;
};

export default function RecommendedPropertiesSection({
  leadId,
  linkedIds,
  onLinked,
}: Props) {
  const t = useTranslations();
  const rt = t.leads.detail.properties.recommendations;

  const [recs, setRecs] = useState<RecommendedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveErrors, setSaveErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getRecommendedProperties(leadId)
      .then(setRecs)
      .catch(() => setFetchError(true))
      .finally(() => setIsLoading(false));
  }, [leadId]);

  async function handleSave(rec: RecommendedProperty) {
    const propId = rec.property.id;
    setSavingId(propId);
    setSaveErrors((prev) => {
      const next = { ...prev };
      delete next[propId];
      return next;
    });
    try {
      const link = await addLeadPropertyLink(leadId, {
        propertyId: propId,
        linkType: "SUGGESTED",
      });
      onLinked(link);
    } catch {
      setSaveErrors((prev) => ({ ...prev, [propId]: rt.saveError }));
    } finally {
      setSavingId(null);
    }
  }

  // ── States ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-5 w-5 text-indigo-400" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        {rt.loadError}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {rt.sectionTitle}
        </h4>
        {recs.length > 0 && (
          <span className="text-xs text-gray-400">
            {recs.length} {rt.results}
          </span>
        )}
      </div>

      {/* Empty state */}
      {recs.length === 0 && (
        <p className="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          {rt.noRecommendations}
        </p>
      )}

      {/* Cards */}
      {recs.map((rec) => (
        <RecommendedPropertyCard
          key={rec.property.id}
          rec={rec}
          isLinked={linkedIds.has(rec.property.id)}
          isSaving={savingId === rec.property.id}
          saveError={saveErrors[rec.property.id] ?? null}
          onSave={() => handleSave(rec)}
          t={t}
        />
      ))}
    </div>
  );
}
