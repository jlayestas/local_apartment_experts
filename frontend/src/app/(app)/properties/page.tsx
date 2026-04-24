"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getProperties } from "@/lib/api/properties";
import { useTranslations } from "@/lib/i18n";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import type { PropertyFilters, PropertyStatus, PropertySummary, PropertyType } from "@/types/property";
import type { PagedResponse } from "@/types/api";

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_STATUSES: PropertyStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];
const ALL_TYPES: PropertyType[] = [
  "APARTMENT", "HOUSE", "STUDIO", "CONDO", "TOWNHOUSE", "COMMERCIAL", "OTHER",
];
const DEFAULT_FILTERS: PropertyFilters = { page: 0, size: 20 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function hasActiveFilters(f: PropertyFilters): boolean {
  return !!(f.search || f.status || f.propertyType || f.featured);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(price: number | null, frequency: string | null, t: ReturnType<typeof useTranslations>): string {
  if (price == null) return "—";
  const formatted = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
  const freq = frequency ? t.properties.priceFrequency[frequency] : "";
  return freq ? `${formatted} ${freq}` : formatted;
}

// ── FilterBar ─────────────────────────────────────────────────────────────────

type FilterBarProps = {
  filters: PropertyFilters;
  onFiltersChange: (next: PropertyFilters) => void;
  t: ReturnType<typeof useTranslations>;
};

function FilterBar({ filters, onFiltersChange, t }: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const prevSearch = useRef(filters.search ?? "");

  useEffect(() => {
    if (!filters.search && prevSearch.current) setSearchInput("");
    prevSearch.current = filters.search ?? "";
  }, [filters.search]);

  function commitSearch(e: React.FormEvent) {
    e.preventDefault();
    onFiltersChange({ ...filters, search: searchInput.trim() || undefined, page: 0 });
  }

  function setFilter<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
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
      <form onSubmit={commitSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t.properties.searchPlaceholder}
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button type="submit" variant="secondary" size="sm">
          {t.common.search}
        </Button>
      </form>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={filters.status ?? ""}
          onChange={(e) => setFilter("status", (e.target.value as PropertyStatus) || undefined)}
          className={selectClass}
        >
          <option value="">{t.properties.filters.allStatuses}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{t.properties.status[s]}</option>
          ))}
        </select>

        <select
          value={filters.propertyType ?? ""}
          onChange={(e) => setFilter("propertyType", (e.target.value as PropertyType) || undefined)}
          className={selectClass}
        >
          <option value="">{t.properties.filters.allTypes}</option>
          {ALL_TYPES.map((type) => (
            <option key={type} value={type}>{t.properties.propertyType[type]}</option>
          ))}
        </select>

        <label className="flex cursor-pointer items-center gap-2 select-none text-sm text-gray-600">
          <input
            type="checkbox"
            checked={filters.featured === true}
            onChange={(e) => setFilter("featured", e.target.checked || undefined)}
            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          {t.properties.filters.featured}
        </label>

        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline underline-offset-2"
          >
            {t.properties.filters.clearFilters}
          </button>
        )}
      </div>
    </div>
  );
}

// ── PropertiesTable ───────────────────────────────────────────────────────────

function PropertiesTable({
  properties,
  t,
}: {
  properties: PropertySummary[];
  t: ReturnType<typeof useTranslations>;
}) {
  const router = useRouter();
  const pt = t.properties;

  const COLUMNS = [
    pt.table.ref,
    pt.table.title,
    pt.table.location,
    pt.table.type,
    pt.table.beds,
    pt.table.price,
    pt.table.status,
    pt.table.featured,
    pt.table.created,
  ];

  return (
    <div className="overflow-x-auto">
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
          {properties.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-5 py-12 text-center text-sm text-gray-400">
                {pt.noProperties}
              </td>
            </tr>
          ) : (
            properties.map((property) => (
              <tr
                key={property.id}
                onClick={() => router.push(`/properties/${property.id}`)}
                className="cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-5 py-3.5 whitespace-nowrap">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-gray-500">
                    {property.referenceCode}
                  </span>
                </td>

                <td className="px-5 py-3.5 font-medium text-gray-900 max-w-[220px] truncate">
                  <Link
                    href={`/properties/${property.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="hover:text-indigo-600 transition-colors"
                  >
                    {property.title}
                  </Link>
                </td>

                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                  {[property.neighborhood, property.city].filter(Boolean).join(", ") || property.city}
                </td>

                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                  {pt.propertyType[property.propertyType] ?? property.propertyType}
                </td>

                <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                  {property.bedrooms != null ? property.bedrooms : <span className="text-gray-300">—</span>}
                </td>

                <td className="px-5 py-3.5 text-gray-700 whitespace-nowrap">
                  {formatPrice(property.price, property.priceFrequency, t)}
                </td>

                <td className="px-5 py-3.5 whitespace-nowrap">
                  <Badge
                    variant="propertyStatus"
                    value={property.status}
                    label={pt.status[property.status]}
                  />
                </td>

                <td className="px-5 py-3.5 text-center">
                  {property.featured ? (
                    property.status === "PUBLISHED" ? (
                      <span className="text-yellow-500" title={pt.form.featured}>★</span>
                    ) : (
                      <span className="text-gray-400" title={pt.form.featuredDraft}>★</span>
                    )
                  ) : (
                    <span className="text-gray-200">★</span>
                  )}
                </td>

                <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                  {formatDate(property.createdAt)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page,
  totalPages,
  totalElements,
  isLast,
  onPage,
  t,
}: {
  page: number;
  totalPages: number;
  totalElements: number;
  isLast: boolean;
  onPage: (p: number) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const pg = t.properties.pagination;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
      <p className="text-xs text-gray-400">
        {totalElements} {pg.results}
      </p>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onPage(page - 1)}>
            ← {pg.previous}
          </Button>
          <span className="px-2 text-xs text-gray-500">
            {page + 1} {pg.pageOf} {totalPages}
          </span>
          <Button variant="secondary" size="sm" disabled={isLast} onClick={() => onPage(page + 1)}>
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
  | { status: "ready"; data: PagedResponse<PropertySummary> };

export default function PropertiesPage() {
  const t = useTranslations();
  const [pageState, setPageState] = useState<PageState>({ status: "loading" });
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);

  const load = useCallback((f: PropertyFilters) => {
    setPageState({ status: "loading" });
    getProperties(f)
      .then((data) => setPageState({ status: "ready", data }))
      .catch(() => setPageState({ status: "error" }));
  }, []);

  useEffect(() => {
    load(DEFAULT_FILTERS);
  }, [load]);

  function handleFiltersChange(next: PropertyFilters) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t.properties.title}</h1>
        <Link href="/properties/new">
          <Button>{t.properties.newProperty}</Button>
        </Link>
      </div>

      <FilterBar filters={filters} onFiltersChange={handleFiltersChange} t={t} />

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
            <PropertiesTable properties={pageState.data.content} t={t} />
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
