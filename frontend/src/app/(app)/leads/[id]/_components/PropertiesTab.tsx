"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  addLeadPropertyLink,
  getLeadPropertyLinks,
  getRecommendedProperties,
  removeLeadPropertyLink,
  updateLeadPropertyLink,
} from "@/lib/api/leads";
import { getProperties } from "@/lib/api/properties";
import { useTranslations } from "@/lib/i18n";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { LeadPropertyLink, LinkType, RecommendedProperty } from "@/types/lead";
import type { PropertySummary } from "@/types/property";

const LINK_TYPES: LinkType[] = ["SUGGESTED", "INTERESTED", "TOURED", "REJECTED"];

const LINK_TYPE_COLORS: Record<LinkType, string> = {
  SUGGESTED: "bg-blue-100 text-blue-700",
  INTERESTED: "bg-green-100 text-green-700",
  TOURED: "bg-purple-100 text-purple-700",
  REJECTED: "bg-red-100 text-red-600",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number | null, frequency: string | null, freqMap: Record<string, string>): string {
  if (price == null) return "—";
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
  const freq = frequency ? freqMap[frequency] : "";
  return freq ? `${formatted} ${freq}` : formatted;
}

// ── RecommendedPropertiesSection ──────────────────────────────────────────────

type RecommendedPropertiesSectionProps = {
  leadId: string;
  linkedIds: Set<string>;
  onLinked: (link: LeadPropertyLink) => void;
  t: ReturnType<typeof useTranslations>;
};

function RecommendedPropertiesSection({ leadId, linkedIds, onLinked, t }: RecommendedPropertiesSectionProps) {
  const rt = t.leads.detail.properties.recommendations;
  const [recs, setRecs] = useState<RecommendedProperty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suggestingId, setSuggestingId] = useState<string | null>(null);
  const [suggestErrors, setSuggestErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getRecommendedProperties(leadId)
      .then(setRecs)
      .catch(() => setRecs([]))
      .finally(() => setIsLoading(false));
  }, [leadId]);

  async function handleSuggest(property: RecommendedProperty["property"]) {
    setSuggestingId(property.id);
    setSuggestErrors((prev) => ({ ...prev, [property.id]: "" }));
    try {
      const link = await addLeadPropertyLink(leadId, { propertyId: property.id, linkType: "SUGGESTED" });
      onLinked(link);
    } catch {
      setSuggestErrors((prev) => ({ ...prev, [property.id]: rt.suggestError }));
    } finally {
      setSuggestingId(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner className="h-5 w-5 text-indigo-400" />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
        {rt.sectionTitle}
      </h4>

      {recs.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-200 py-5 text-center text-xs text-gray-400">
          {rt.noRecommendations}
        </p>
      ) : (
        <ul className="space-y-2">
          {recs.map((rec) => {
            const p = rec.property;
            const alreadySuggested = linkedIds.has(p.id);
            const isSuggesting = suggestingId === p.id;
            const suggestError = suggestErrors[p.id];

            return (
              <li
                key={p.id}
                className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/properties/${p.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate block"
                    >
                      {p.title}
                    </Link>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {[p.neighborhood, p.city].filter(Boolean).join(", ")}
                      {p.bedrooms != null && ` · ${p.bedrooms} ${t.properties.table.beds}`}
                      {p.price != null && ` · ${formatPrice(p.price, p.priceFrequency, t.properties.priceFrequency)}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-indigo-700">
                      {rec.score} {rt.scoreLabel}
                    </span>
                    <Button
                      size="sm"
                      variant={alreadySuggested ? "secondary" : "primary"}
                      disabled={alreadySuggested || isSuggesting}
                      isLoading={isSuggesting}
                      onClick={() => !alreadySuggested && handleSuggest(p)}
                    >
                      {isSuggesting
                        ? rt.suggesting
                        : alreadySuggested
                        ? "✓ " + rt.alreadySuggested
                        : rt.suggest}
                    </Button>
                  </div>
                </div>

                {rec.matchReasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {rec.matchReasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full bg-white border border-indigo-100 px-2 py-0.5 text-xs text-indigo-600"
                      >
                        {rt.matchReasonLabels[reason as keyof typeof rt.matchReasonLabels] ?? reason}
                      </span>
                    ))}
                  </div>
                )}

                {suggestError && (
                  <p className="text-xs text-red-600">{suggestError}</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── PropertySearchPanel ───────────────────────────────────────────────────────

type PropertySearchPanelProps = {
  leadId: string;
  linkedIds: Set<string>;
  onLinked: (link: LeadPropertyLink) => void;
  onClose: () => void;
  t: ReturnType<typeof useTranslations>;
};

function PropertySearchPanel({ leadId, linkedIds, onLinked, onClose, t }: PropertySearchPanelProps) {
  const pt = t.leads.detail.properties;
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PropertySummary[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<LinkType>("SUGGESTED");
  const [linkError, setLinkError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(() => {
      setIsSearching(true);
      getProperties({ search: query.trim(), status: "PUBLISHED", size: 10 })
        .then((data) => setResults(data.content))
        .catch(() => setResults([]))
        .finally(() => setIsSearching(false));
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleLink(property: PropertySummary) {
    setLinkingId(property.id);
    setLinkError(null);
    try {
      const link = await addLeadPropertyLink(leadId, { propertyId: property.id, linkType });
      onLinked(link);
    } catch {
      setLinkError(pt.linkError);
    } finally {
      setLinkingId(null);
    }
  }

  const selectClass =
    "rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500";

  return (
    <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 space-y-3">
      {/* Header row */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={pt.searchPlaceholder}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {isSearching && <Spinner className="h-4 w-4 text-indigo-500 shrink-0" />}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500">{pt.linkAs}</span>
          <select
            value={linkType}
            onChange={(e) => setLinkType(e.target.value as LinkType)}
            className={selectClass}
          >
            {LINK_TYPES.map((lt) => (
              <option key={lt} value={lt}>{t.properties.linkType[lt]}</option>
            ))}
          </select>
          <button
            onClick={onClose}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {pt.cancel}
          </button>
        </div>
      </div>

      {/* Results */}
      {query.trim() && !isSearching && results.length === 0 && (
        <p className="py-3 text-center text-sm text-gray-400">{pt.noResults}</p>
      )}

      {linkError && (
        <p role="alert" className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {linkError}
        </p>
      )}

      {results.length > 0 && (
        <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white overflow-hidden">
          {results.map((p) => {
            const alreadyLinked = linkedIds.has(p.id);
            const isLinking = linkingId === p.id;
            return (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                  <p className="text-xs text-gray-500">
                    {[p.neighborhood, p.city].filter(Boolean).join(", ")}
                    {" · "}
                    {t.properties.propertyType[p.propertyType] ?? p.propertyType}
                    {p.price != null && ` · ${formatPrice(p.price, p.priceFrequency, t.properties.priceFrequency)}`}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={alreadyLinked ? "secondary" : "primary"}
                  disabled={alreadyLinked || isLinking}
                  isLoading={isLinking}
                  onClick={() => !alreadyLinked && handleLink(p)}
                >
                  {isLinking ? pt.linking : alreadyLinked ? "✓" : "+ " + t.properties.linkType[linkType]}
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// ── LinkCard ──────────────────────────────────────────────────────────────────

type LinkCardProps = {
  link: LeadPropertyLink;
  onUpdated: (link: LeadPropertyLink) => void;
  onRemoved: (linkId: string) => void;
  t: ReturnType<typeof useTranslations>;
};

function LinkCard({ link, onUpdated, onRemoved, t }: LinkCardProps) {
  const pt = t.leads.detail.properties;
  const [isUpdating, setIsUpdating] = useState(false);
  const [linkTypeError, setLinkTypeError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteValue, setNoteValue] = useState(link.note ?? "");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [saveNoteError, setSaveNoteError] = useState<string | null>(null);

  async function handleLinkTypeChange(linkType: LinkType) {
    setIsUpdating(true);
    setLinkTypeError(null);
    try {
      const updated = await updateLeadPropertyLink(link.leadId, link.id, { linkType });
      onUpdated(updated);
    } catch {
      setLinkTypeError(t.common.error);
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleRemove() {
    if (!confirm(pt.removeConfirm)) return;
    setIsRemoving(true);
    setRemoveError(null);
    try {
      await removeLeadPropertyLink(link.leadId, link.id);
      onRemoved(link.id);
    } catch {
      setRemoveError(pt.removeError);
    } finally {
      setIsRemoving(false);
    }
  }

  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    setIsSavingNote(true);
    setSaveNoteError(null);
    try {
      const updated = await updateLeadPropertyLink(link.leadId, link.id, { note: noteValue.trim() || undefined });
      onUpdated(updated);
      setNoteOpen(false);
    } catch {
      setSaveNoteError(t.common.error);
    } finally {
      setIsSavingNote(false);
    }
  }

  const p = link.property;
  const colorClass = LINK_TYPE_COLORS[link.linkType] ?? "bg-gray-100 text-gray-600";

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/properties/${p.id}`}
            className="text-sm font-medium text-gray-900 hover:text-indigo-600 transition-colors truncate block"
          >
            {p.title}
          </Link>
          <p className="mt-0.5 text-xs text-gray-500">
            {[p.neighborhood, p.city].filter(Boolean).join(", ")}
            {" · "}
            {t.properties.propertyType[p.propertyType] ?? p.propertyType}
            {p.bedrooms != null && ` · ${p.bedrooms} ${t.properties.table.beds}`}
            {p.price != null && ` · ${formatPrice(p.price, p.priceFrequency, t.properties.priceFrequency)}`}
          </p>
        </div>

        {/* Link type badge + dropdown */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-2">
            {isUpdating ? (
              <Spinner className="h-4 w-4 text-indigo-500" />
            ) : (
              <select
                value={link.linkType}
                onChange={(e) => handleLinkTypeChange(e.target.value as LinkType)}
                className={`rounded-full px-3 py-0.5 text-xs font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${colorClass}`}
              >
                {LINK_TYPES.map((lt) => (
                  <option key={lt} value={lt}>{t.properties.linkType[lt]}</option>
                ))}
              </select>
            )}
          </div>
          {linkTypeError && (
            <span className="text-xs text-red-600">{linkTypeError}</span>
          )}
        </div>
      </div>

      {/* Note */}
      {link.note && !noteOpen && (
        <p
          className="text-xs text-gray-500 italic cursor-pointer hover:text-gray-700"
          onClick={() => { setNoteValue(link.note ?? ""); setNoteOpen(true); }}
        >
          {link.note}
        </p>
      )}

      {noteOpen && (
        <form onSubmit={handleSaveNote} className="space-y-2">
          <textarea
            value={noteValue}
            onChange={(e) => setNoteValue(e.target.value)}
            rows={2}
            autoFocus
            placeholder={pt.notePlaceholder}
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" isLoading={isSavingNote}>
              {isSavingNote ? pt.savingNote : pt.saveNote}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => setNoteOpen(false)}>
              {pt.cancel}
            </Button>
            {saveNoteError && (
              <span className="text-xs text-red-600">{saveNoteError}</span>
            )}
          </div>
        </form>
      )}

      {/* Bottom actions */}
      <div className="flex items-center gap-3">
        {!noteOpen && (
          <button
            onClick={() => { setNoteValue(link.note ?? ""); setNoteOpen(true); }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {link.note ? "✏ " : "+ "}{pt.note}
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {removeError && (
            <span className="text-xs text-red-600">{removeError}</span>
          )}
          <button
            onClick={handleRemove}
            disabled={isRemoving}
            className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
          >
            {isRemoving ? pt.removing : pt.remove}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PropertiesTab ─────────────────────────────────────────────────────────────

export default function PropertiesTab({ leadId }: { leadId: string }) {
  const t = useTranslations();
  const pt = t.leads.detail.properties;

  const [links, setLinks] = useState<LeadPropertyLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    getLeadPropertyLinks(leadId)
      .then(setLinks)
      .finally(() => setIsLoading(false));
  }, [leadId]);

  const linkedIds = new Set(links.map((l) => l.propertyId));

  function handleLinked(link: LeadPropertyLink) {
    setLinks((prev) => [link, ...prev]);
    setShowSearch(false);
  }

  function handleUpdated(updated: LeadPropertyLink) {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  function handleRemoved(linkId: string) {
    setLinks((prev) => prev.filter((l) => l.id !== linkId));
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-6 w-6 text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Recommendations */}
      <RecommendedPropertiesSection
        leadId={leadId}
        linkedIds={linkedIds}
        onLinked={handleLinked}
        t={t}
      />

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          {pt.sectionTitle}
          {links.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-normal text-gray-500">
              {links.length}
            </span>
          )}
        </h3>
        {!showSearch && (
          <Button size="sm" variant="secondary" onClick={() => setShowSearch(true)}>
            + {pt.linkProperty}
          </Button>
        )}
      </div>

      {/* Search panel */}
      {showSearch && (
        <PropertySearchPanel
          leadId={leadId}
          linkedIds={linkedIds}
          onLinked={handleLinked}
          onClose={() => setShowSearch(false)}
          t={t}
        />
      )}

      {/* Links list */}
      {links.length === 0 && !showSearch && (
        <p className="py-10 text-center text-sm text-gray-400">{pt.empty}</p>
      )}

      {links.map((link) => (
        <LinkCard
          key={link.id}
          link={link}
          onUpdated={handleUpdated}
          onRemoved={handleRemoved}
          t={t}
        />
      ))}
    </div>
  );
}
