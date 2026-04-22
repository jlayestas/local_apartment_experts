"use client";

import { useTranslations } from "@/lib/i18n";

export const AMENITY_KEYS = [
  "POOL", "GYM", "ROOFTOP", "ELEVATOR", "DOORMAN", "CONCIERGE",
  "BALCONY", "STORAGE", "PARKING", "SECURITY",
  "WASHER", "DRYER", "DISHWASHER", "MICROWAVE", "REFRIGERATOR",
  "AIR_CONDITIONING", "FURNISHED", "WIFI", "CABLE_TV",
] as const;

export type AmenityKey = (typeof AMENITY_KEYS)[number];

type Props = {
  selected: string[];
  onChange: (selected: string[]) => void;
};

export default function AmenityPicker({ selected, onChange }: Props) {
  const t = useTranslations();

  function toggle(key: string) {
    onChange(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key]
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {AMENITY_KEYS.map((key) => {
        const checked = selected.includes(key);
        return (
          <label
            key={key}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors select-none
              ${checked
                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
              }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={checked}
              onChange={() => toggle(key)}
            />
            <span className={`h-3.5 w-3.5 shrink-0 rounded border transition-colors ${
              checked ? "border-indigo-500 bg-indigo-500" : "border-gray-300 bg-white"
            }`}>
              {checked && (
                <svg viewBox="0 0 10 10" className="h-3.5 w-3.5 text-white" fill="none">
                  <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {t.properties.amenity[key as AmenityKey]}
          </label>
        );
      })}
    </div>
  );
}
