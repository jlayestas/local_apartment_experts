/**
 * Parses a YYYY-MM-DD string as a LOCAL date.
 * Using `new Date("YYYY-MM-DD")` treats the string as UTC midnight, which
 * shifts the displayed day by one in negative-offset timezones (e.g. Mexico).
 */
export function parseLocalDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Formats a YYYY-MM-DD string for display without timezone shift.
 */
export function formatLocalDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  return parseLocalDate(iso).toLocaleDateString("es-MX", opts);
}

/**
 * Returns today's date as YYYY-MM-DD in local time (not UTC).
 */
export function localToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
