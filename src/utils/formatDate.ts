/**
 * Locale-safe date formatting utilities.
 *
 * Using `toLocaleDateString()` without an explicit locale causes React hydration
 * errors because the server and client may resolve the default locale differently
 * (e.g. "9/1/2024" on the server vs "01/09/2024" on the client).
 *
 * Always use these helpers instead of bare `toLocaleDateString()`.
 */

/** Short date – e.g. "Sep 1, 2024" */
export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Numeric date – e.g. "9/1/2024"  (explicit en-US so server === client) */
export function formatDateNumeric(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US");
}

/** Date with custom options – always pinned to en-US */
export function formatDateCustom(
  date: string | Date,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Date(date).toLocaleDateString("en-US", options);
}
