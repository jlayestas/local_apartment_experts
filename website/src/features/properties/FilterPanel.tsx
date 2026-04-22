"use client";

import { useState } from "react";
import type { PropertyFilters, PropertyType } from "@/types/property";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const AMENITY_KEYS = [
  "POOL", "GYM", "ROOFTOP", "ELEVATOR", "DOORMAN", "CONCIERGE",
  "BALCONY", "STORAGE", "PARKING", "SECURITY",
  "WASHER", "DRYER", "DISHWASHER", "MICROWAVE", "REFRIGERATOR",
  "AIR_CONDITIONING", "FURNISHED", "WIFI", "CABLE_TV",
] as const;

type Props = {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onClear: () => void;
  activeCount: number;
};

function Divider() {
  return <hr className="border-gray-100" />;
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
      {children}
    </p>
  );
}


export default function FilterPanel({ filters, onChange, onClear, activeCount }: Props) {
  const { t } = useLanguage();
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);

  const PROPERTY_TYPE_OPTIONS = [
    { value: "APARTMENT", label: t("type.APARTMENT") },
    { value: "HOUSE",     label: t("type.HOUSE")     },
    { value: "STUDIO",    label: t("type.STUDIO")    },
    { value: "CONDO",     label: t("type.CONDO")     },
    { value: "TOWNHOUSE", label: t("type.TOWNHOUSE") },
    { value: "OTHER",     label: t("type.OTHER")     },
  ];

  const BEDROOM_OPTIONS = [
    { value: "1", label: t("bed.1") },
    { value: "2", label: t("bed.2") },
    { value: "3", label: t("bed.3") },
    { value: "4", label: t("bed.4") },
  ];

  const BATHROOM_OPTIONS = [
    { value: "1", label: t("bath.1") },
    { value: "2", label: t("bath.2") },
    { value: "3", label: t("bath.3") },
  ];

  function set<K extends keyof PropertyFilters>(key: K, value: PropertyFilters[K]) {
    onChange({ ...filters, [key]: value ?? undefined, page: 0 });
  }

  function numericVal(v: string): number | undefined {
    const n = Number(v);
    return v === "" || isNaN(n) ? undefined : n;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">{t("filter.filters")}</span>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors"
          >
            {t("filter.clear", { n: activeCount })}
          </button>
        )}
      </div>

      <Divider />

      <div className="space-y-3">
        <GroupLabel>{t("filter.search")}</GroupLabel>
        <Input
          placeholder={t("filter.search_placeholder")}
          value={filters.search ?? ""}
          onChange={(e) => set("search", e.target.value || undefined)}
        />
      </div>

      <Divider />

      <div className="space-y-3">
        <GroupLabel>{t("filter.location")}</GroupLabel>
        <Input
          label={t("filter.city")}
          placeholder={t("filter.city_placeholder")}
          value={filters.city ?? ""}
          onChange={(e) => set("city", e.target.value || undefined)}
        />
        <Input
          label={t("filter.neighborhood")}
          placeholder={t("filter.neighborhood_placeholder")}
          value={filters.neighborhood ?? ""}
          onChange={(e) => set("neighborhood", e.target.value || undefined)}
        />
      </div>

      <Divider />

      <div className="space-y-3">
        <GroupLabel>{t("filter.monthly_rent")}</GroupLabel>
        <div className="grid grid-cols-2 gap-2">
          <Input
            label={t("filter.min")}
            type="number"
            min={0}
            prefix="$"
            placeholder="0"
            value={filters.minPrice ?? ""}
            onChange={(e) => set("minPrice", numericVal(e.target.value))}
          />
          <Input
            label={t("filter.max")}
            type="number"
            min={0}
            prefix="$"
            placeholder={t("filter.no_max")}
            value={filters.maxPrice ?? ""}
            onChange={(e) => set("maxPrice", numericVal(e.target.value))}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-3">
        <GroupLabel>{t("filter.property")}</GroupLabel>
        <Select
          label={t("filter.type")}
          placeholder={t("filter.any_type")}
          options={PROPERTY_TYPE_OPTIONS}
          value={filters.propertyType ?? ""}
          onChange={(e) =>
            set("propertyType", (e.target.value as PropertyType) || undefined)
          }
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            label={t("filter.bedrooms")}
            placeholder={t("filter.any")}
            options={BEDROOM_OPTIONS}
            value={filters.bedrooms != null ? String(filters.bedrooms) : ""}
            onChange={(e) => set("bedrooms", numericVal(e.target.value))}
          />
          <Select
            label={t("filter.bathrooms")}
            placeholder={t("filter.any")}
            options={BATHROOM_OPTIONS}
            value={filters.bathrooms != null ? String(filters.bathrooms) : ""}
            onChange={(e) => set("bathrooms", numericVal(e.target.value))}
          />
        </div>
      </div>

      <Divider />

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setAmenitiesOpen((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <GroupLabel>{t("filter.amenities")}</GroupLabel>
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${amenitiesOpen ? "rotate-180" : ""}`}
            fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {amenitiesOpen && (
          <div className="grid grid-cols-1 gap-1.5 pt-1">
            {AMENITY_KEYS.map((key) => {
              const checked = filters.amenities?.includes(key) ?? false;
              return (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs transition-colors select-none
                    ${checked
                      ? "border-teal-300 bg-teal-50 text-teal-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={checked}
                    onChange={() => {
                      const current = filters.amenities ?? [];
                      set("amenities", checked
                        ? current.filter((a) => a !== key)
                        : [...current, key]
                      );
                    }}
                  />
                  <span className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border ${checked ? "border-teal-500 bg-teal-500" : "border-gray-300 bg-white"}`}>
                    {checked && (
                      <svg viewBox="0 0 10 10" className="h-2.5 w-2.5 text-white" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {t(`amenity.${key}` as Parameters<typeof t>[0])}
                </label>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
