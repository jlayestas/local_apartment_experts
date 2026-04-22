import type { SelectHTMLAttributes } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
};

const BASE_SELECT =
  "block w-full rounded-lg border bg-white px-4 py-3 text-sm text-gray-900 " +
  "transition-colors duration-150 appearance-none " +
  "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent " +
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export default function Select({
  label,
  options,
  placeholder,
  error,
  id,
  className = "",
  ...props
}: Props) {
  const selectId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* Wrapper provides the custom chevron — the native select is kept for accessibility */}
      <div className="relative">
        <select
          id={selectId}
          className={`${BASE_SELECT} pr-10 ${error ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-gray-300"} ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      </div>

      {error && (
        <p id={`${selectId}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
