"use client";

import { useState, useMemo, useEffect } from "react";
import PropertyCard from "./PropertyCard";
import FilterPanel from "./FilterPanel";
import SearchAutocomplete from "./SearchAutocomplete";
import type { PropertyFilters, PropertySummary, SortOption } from "@/types/property";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { applyFilters, applySort, buildChips, type Chip } from "./listingsUtils";

const PAGE_SIZE = 6;
const EMPTY_FILTERS: PropertyFilters = {};

type Props = {
  initialProperties: PropertySummary[];
  /** Pre-populates the search filter — passed from the URL ?search= param. */
  initialSearch?: string;
};

export default function ListingsClient({ initialProperties, initialSearch }: Props) {
  const { t } = useLanguage();
  const [filters, setFilters]       = useState<PropertyFilters>(
    initialSearch ? { search: initialSearch } : EMPTY_FILTERS
  );
  const [sort, setSort]             = useState<SortOption>("newest");
  const [page, setPage]             = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: "newest",     label: t("listings.sort_newest")    },
    { value: "price_asc",  label: t("listings.sort_price_asc") },
    { value: "price_desc", label: t("listings.sort_price_desc")},
  ];

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024) setDrawerOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const chips       = buildChips(filters, t);
  const activeCount = chips.length;

  const filtered = useMemo(
    () => applySort(applyFilters(initialProperties, filters), sort),
    [initialProperties, filters, sort]
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilterChange(next: PropertyFilters) {
    setFilters(next);
    setPage(0);
  }

  function clearFilters() {
    setFilters(EMPTY_FILTERS);
    setPage(0);
  }

  function removeChip(key: keyof PropertyFilters) {
    const next = { ...filters };
    delete next[key];
    setFilters(next);
    setPage(0);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {t("listings.title")}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("listings.subtitle")}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
          {filtered.length === 1 ? t("listings.property_found") : t("listings.properties_found")}
        </p>

        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value as SortOption); setPage(0); }}
              className="appearance-none rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-gray-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label={t("listings.open_filters")}
            className="lg:hidden flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
            {t("listings.filters")}
            {activeCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-600 text-[10px] font-bold text-white">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip.key)}
              className="inline-flex items-center gap-1 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-100 transition-colors"
            >
              {chip.label}
              <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
          >
            {t("listings.clear_all")}
          </button>
        </div>
      )}

      {/* Main content: sidebar + grid */}
      <div className="flex gap-8">
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 rounded-xl border border-gray-200 bg-white p-5">
            <FilterPanel
              filters={filters}
              onChange={handleFilterChange}
              onClear={clearFilters}
              activeCount={activeCount}
            />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                </svg>
              </div>
              <p className="mt-4 font-semibold text-gray-700">
                {initialProperties.length === 0
                  ? t("listings.no_properties")
                  : t("listings.no_results")}
              </p>
              <p className="mt-1.5 max-w-xs text-sm text-gray-400">
                {initialProperties.length === 0
                  ? t("listings.no_properties_hint")
                  : t("listings.no_results_hint")}
              </p>
              {initialProperties.length > 0 && filters.search && (
                <p className="mt-1 max-w-xs text-xs text-gray-400">
                  {t("listings.no_results_examples")}
                </p>
              )}
              {initialProperties.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
                >
                  {t("listings.clear_filters")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {pageItems.map((p) => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-gray-100 pt-6">
                  <p className="text-sm text-gray-500">
                    {t("listings.showing")}{" "}
                    <span className="font-medium text-gray-800">
                      {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}
                    </span>{" "}
                    {t("listings.of")}{" "}
                    <span className="font-medium text-gray-800">{filtered.length}</span>
                  </p>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                    >
                      {t("listings.prev")}
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setPage(i)}
                        className={`hidden sm:flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition-colors
                          ${i === page
                            ? "border-teal-600 bg-teal-600 text-white"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <span className="sm:hidden px-3 py-2 text-sm text-gray-500">
                      {page + 1} / {totalPages}
                    </span>

                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                    >
                      {t("listings.next")}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t("listings.filters")}
            className="fixed inset-y-0 left-0 z-50 flex w-80 max-w-full flex-col bg-white shadow-xl lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <span className="font-semibold text-gray-900">{t("listings.filters")}</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label={t("listings.close_filters")}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <FilterPanel
                filters={filters}
                onChange={handleFilterChange}
                onClear={clearFilters}
                activeCount={activeCount}
              />
            </div>

            <div className="border-t border-gray-100 px-5 py-4 space-y-2">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="w-full rounded-xl bg-teal-600 py-3 text-sm font-semibold text-white hover:bg-teal-700 transition-colors"
              >
                {filtered.length === 1
                  ? t("listings.view_property",   { n: filtered.length })
                  : t("listings.view_properties", { n: filtered.length })}
              </button>
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => { clearFilters(); setDrawerOpen(false); }}
                  className="w-full rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  {t("listings.clear_filters")}
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
