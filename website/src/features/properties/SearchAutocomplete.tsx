"use client";

import { Fragment, useId, useMemo, useState } from "react";
import type { PropertySummary, PropertyType } from "@/types/property";
import { useLanguage } from "@/lib/i18n/LanguageContext";

type Suggestion = {
  kind: "neighborhood" | "city" | "type";
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  /** Called when the user presses Enter (no highlighted suggestion) or clicks the button. */
  onSubmit?: (value: string) => void;
  properties: PropertySummary[];
  placeholder?: string;
  ariaLabel?: string;
  /** Render a submit button beside the input (used on homepage). */
  showButton?: boolean;
  buttonLabel?: string;
};

const PROPERTY_TYPES: PropertyType[] = [
  "APARTMENT", "HOUSE", "STUDIO", "CONDO", "TOWNHOUSE", "OTHER",
];
const MAX_SUGGESTIONS = 7;

export default function SearchAutocomplete({
  value,
  onChange,
  onSubmit,
  properties,
  placeholder,
  ariaLabel,
  showButton = false,
  buttonLabel,
}: Props) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const listId = useId();

  const suggestions = useMemo<Suggestion[]>(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) return [];

    const nbhoods = [
      ...new Set(properties.map(p => p.neighborhood).filter((n): n is string => n != null)),
    ];
    const cities = [...new Set(properties.map(p => p.city))];

    const results: Suggestion[] = [];

    for (const n of nbhoods) {
      if (n.toLowerCase().includes(q)) results.push({ kind: "neighborhood", label: n });
    }
    for (const c of cities) {
      if (c.toLowerCase().includes(q)) results.push({ kind: "city", label: c });
    }
    for (const type of PROPERTY_TYPES) {
      const label = t(`type.${type}`);
      if (label.toLowerCase().includes(q)) results.push({ kind: "type", label });
    }

    return results.slice(0, MAX_SUGGESTIONS);
  }, [value, properties, t]);

  const isOpen = open && suggestions.length > 0;

  const KIND_LABEL: Record<Suggestion["kind"], string> = {
    neighborhood: t("search.suggest_neighborhoods"),
    city:         t("search.suggest_cities"),
    type:         t("search.suggest_types"),
  };

  function select(label: string) {
    onChange(label);
    setOpen(false);
    setHighlighted(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        if (!isOpen) return;
        e.preventDefault();
        setHighlighted(h => Math.min(h + 1, suggestions.length - 1));
        break;
      case "ArrowUp":
        if (!isOpen) return;
        e.preventDefault();
        setHighlighted(h => Math.max(h - 1, -1));
        break;
      case "Enter":
        e.preventDefault();
        if (isOpen && highlighted >= 0) {
          select(suggestions[highlighted].label);
        } else {
          setOpen(false);
          onSubmit?.(value);
        }
        break;
      case "Escape":
        setOpen(false);
        setHighlighted(-1);
        break;
    }
  }

  return (
    <div className="relative w-full">
      <div className={`flex ${showButton ? "gap-2" : ""}`}>
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-gray-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
            </svg>
          </span>
          <input
            type="search"
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={isOpen ? listId : undefined}
            aria-autocomplete="list"
            aria-activedescendant={highlighted >= 0 ? `${listId}-${highlighted}` : undefined}
            aria-label={ariaLabel}
            value={value}
            placeholder={placeholder ?? t("search.placeholder")}
            onChange={e => {
              onChange(e.target.value);
              setOpen(true);
              setHighlighted(-1);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => { setOpen(false); setHighlighted(-1); }, 150)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-10 pr-4 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {showButton && (
          <button
            type="button"
            onClick={() => { setOpen(false); onSubmit?.(value); }}
            className="rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 active:scale-[0.98] active:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 whitespace-nowrap"
          >
            {buttonLabel ?? t("search.button")}
          </button>
        )}
      </div>

      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-1.5 max-h-60 overflow-y-auto rounded-xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {suggestions.map((s, i) => {
            const isFirstOfKind = i === 0 || suggestions[i - 1].kind !== s.kind;
            return (
              <Fragment key={`${s.kind}-${s.label}`}>
                {isFirstOfKind && (
                  <li
                    role="presentation"
                    aria-hidden="true"
                    className="px-3.5 pb-0.5 pt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400"
                  >
                    {KIND_LABEL[s.kind]}
                  </li>
                )}
                <li
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === highlighted}
                  onMouseDown={e => { e.preventDefault(); select(s.label); }}
                  className={`flex cursor-pointer items-center gap-2.5 px-3.5 py-2 text-sm transition-colors ${
                    i === highlighted
                      ? "bg-teal-50 text-teal-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <PinIcon />
                  {s.label}
                </li>
              </Fragment>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function PinIcon() {
  return (
    <svg
      className="h-3.5 w-3.5 shrink-0 text-gray-400"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  );
}
