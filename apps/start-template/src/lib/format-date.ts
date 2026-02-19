/**
 * Date formatting utilities with i18n support
 */

export type DateFormatStyle = "short" | "medium" | "long" | "full";

/**
 * Format a date with locale support
 * Uses the browser's Intl.DateTimeFormat for proper localization
 */
export function formatDate(
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions,
  locale?: string
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString(locale, options);
}

/**
 * Format a date in short style (e.g., "Dec 27, 2025")
 */
export function formatDateShort(
  date: Date | string | number,
  locale?: string
): string {
  return formatDate(
    date,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
    locale
  );
}

/**
 * Format a date in medium style (e.g., "December 27, 2025")
 */
export function formatDateMedium(
  date: Date | string | number,
  locale?: string
): string {
  return formatDate(
    date,
    {
      month: "long",
      day: "numeric",
      year: "numeric",
    },
    locale
  );
}

/**
 * Format a date with time (e.g., "Dec 27, 2025, 3:45 PM")
 */
export function formatDateTime(
  date: Date | string | number,
  locale?: string
): string {
  return formatDate(
    date,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
    locale
  );
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale?: string
): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffSecs = Math.round(diffMs / 1000);
  const diffMins = Math.round(diffSecs / 60);
  const diffHours = Math.round(diffMins / 60);
  const diffDays = Math.round(diffHours / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (Math.abs(diffSecs) < 60) {
    return rtf.format(diffSecs, "second");
  }
  if (Math.abs(diffMins) < 60) {
    return rtf.format(diffMins, "minute");
  }
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }
  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, "day");
  }

  return formatDateShort(dateObj, locale);
}
