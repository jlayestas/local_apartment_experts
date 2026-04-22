import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: ReactNode;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 " +
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 " +
  "disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.98]";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-teal-600 text-white shadow-sm hover:bg-teal-700 active:bg-teal-800",
  secondary:
    "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300",
  outline:
    "border border-teal-600 text-teal-600 bg-transparent hover:bg-teal-50 active:bg-teal-100",
  ghost:
    "text-gray-600 bg-transparent hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm leading-none",
  md: "px-5 py-2.5 text-sm leading-none",
  lg: "px-7 py-3.5 text-base leading-none",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: Props) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`${BASE} ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
}
