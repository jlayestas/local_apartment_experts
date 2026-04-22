import type { ButtonHTMLAttributes } from "react";
import Spinner from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500 border-transparent",
  secondary:
    "bg-white text-gray-700 hover:bg-gray-50 focus-visible:ring-gray-400 border-gray-300",
  danger:
    "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 border-transparent",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-400 border-transparent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "text-xs px-3 py-1.5 gap-1.5",
  md: "text-sm px-4 py-2 gap-2",
};

export default function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center font-medium rounded-lg border
        transition-colors cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANT_CLASSES[variant]}
        ${SIZE_CLASSES[size]}
        ${className}
      `}
    >
      {isLoading && <Spinner className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}
