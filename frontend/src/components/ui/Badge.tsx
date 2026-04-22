const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-700",
  CONTACT_ATTEMPTED: "bg-yellow-100 text-yellow-800",
  CONTACTED: "bg-amber-100 text-amber-800",
  QUALIFIED: "bg-green-100 text-green-700",
  APPOINTMENT_SCHEDULED: "bg-purple-100 text-purple-700",
  APPLICATION_IN_PROGRESS: "bg-indigo-100 text-indigo-700",
  CLOSED_WON: "bg-emerald-100 text-emerald-700",
  CLOSED_LOST: "bg-red-100 text-red-700",
  UNRESPONSIVE: "bg-gray-100 text-gray-600",
};

const URGENCY_COLORS: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
};

const PROPERTY_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  ARCHIVED: "bg-red-100 text-red-600",
};

type BadgeVariant = "status" | "urgency" | "propertyStatus" | "neutral";

type BadgeProps = {
  /** The raw enum value, e.g. "NEW" or "PUBLISHED". */
  value: string;
  /** Controls which color palette to use. */
  variant?: BadgeVariant;
  /** Optional human-readable label. Falls back to the raw value. */
  label?: string;
};

function colorClass(variant: BadgeVariant, value: string): string {
  if (variant === "status") return STATUS_COLORS[value] ?? "bg-gray-100 text-gray-600";
  if (variant === "urgency") return URGENCY_COLORS[value] ?? "bg-gray-100 text-gray-600";
  if (variant === "propertyStatus") return PROPERTY_STATUS_COLORS[value] ?? "bg-gray-100 text-gray-600";
  return "bg-gray-100 text-gray-600";
}

export default function Badge({ value, variant = "neutral", label }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass(variant, value)}`}
    >
      {label ?? value}
    </span>
  );
}
