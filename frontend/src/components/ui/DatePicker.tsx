"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { es } from "react-day-picker/locale";

type Props = {
  label?: string;
  value: string; // ISO date "YYYY-MM-DD" or ""
  onChange: (iso: string) => void;
  disabled?: boolean;
  error?: string;
};

function parseIso(iso: string): Date | undefined {
  if (!iso) return undefined;
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function toIso(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(iso: string): string {
  if (!iso) return "";
  const date = parseIso(iso);
  if (!date) return iso;
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function DatePicker({ label, value, onChange, disabled, error }: Props) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(parseIso(value) ?? new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync displayed month when value changes externally
  useEffect(() => {
    if (value) setMonth(parseIso(value) ?? new Date());
  }, [value]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const selected = parseIso(value);

  const triggerClass = [
    "w-full rounded-lg border px-3 py-2 text-sm text-left transition-colors",
    "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500",
    "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
    error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white",
    !value ? "text-gray-400" : "text-gray-900",
  ].join(" ");

  return (
    <div className="space-y-1" ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}

      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((o) => !o)}
          className={triggerClass}
        >
          <span className="flex items-center justify-between gap-2">
            <span>{value ? formatDisplay(value) : "Seleccionar fecha"}</span>
            <svg className="h-4 w-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.75} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </span>
        </button>

        {open && (
          <div className="absolute z-50 mt-1 rounded-xl border border-gray-200 bg-white shadow-lg">
            <DayPicker
              mode="single"
              locale={es}
              selected={selected}
              month={month}
              onMonthChange={setMonth}
              onSelect={(date) => {
                if (date) {
                  onChange(toIso(date));
                  setOpen(false);
                }
              }}
              classNames={{
                root: "p-3",
                months: "flex flex-col",
                month_caption: "flex items-center justify-between px-1 mb-2",
                caption_label: "text-sm font-semibold text-gray-900 capitalize",
                nav: "flex items-center gap-1",
                button_previous: "p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer",
                button_next: "p-1 rounded-lg hover:bg-gray-100 text-gray-500 cursor-pointer",
                month_grid: "w-full border-collapse",
                weekdays: "flex",
                weekday: "w-9 text-center text-xs font-medium text-gray-400 pb-1",
                week: "flex mt-1",
                day: "w-9 h-9 flex items-center justify-center",
                day_button: [
                  "w-9 h-9 rounded-full text-sm transition-colors cursor-pointer",
                  "hover:bg-indigo-50 hover:text-indigo-700",
                  "focus:outline-none focus:ring-2 focus:ring-indigo-500",
                ].join(" "),
                selected: "bg-indigo-600 text-white rounded-full hover:bg-indigo-700",
                today: "font-bold text-indigo-600",
                outside: "text-gray-300",
                disabled: "opacity-30 cursor-not-allowed",
              }}
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
