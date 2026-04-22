import type { InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  prefix?: string;
};

const BASE_INPUT =
  "block w-full rounded-lg border bg-white py-3 text-sm text-gray-900 " +
  "placeholder:text-gray-400 transition-colors duration-150 " +
  "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent " +
  "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500";

export default function Input({
  label,
  hint,
  error,
  prefix,
  id,
  className = "",
  ...props
}: Props) {
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);
  const borderClass = error ? "border-red-400 bg-red-50 focus:ring-red-400" : "border-gray-300";

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && (
            <span className="ml-1 text-red-500" aria-hidden="true">*</span>
          )}
        </label>
      )}
      {prefix ? (
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-gray-400" aria-hidden="true">
            {prefix}
          </span>
          <input
            id={inputId}
            className={`${BASE_INPUT} pl-7 pr-4 ${borderClass} ${className}`}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
      ) : (
        <input
          id={inputId}
          className={`${BASE_INPUT} px-4 ${borderClass} ${className}`}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-gray-500">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${inputId}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
