type DateFormatStyle = "short" | "medium" | "long";

const DATE_FORMAT_OPTIONS: Record<DateFormatStyle, Intl.DateTimeFormatOptions> =
  {
    short: { month: "short", day: "numeric", year: "numeric" },
    medium: { month: "long", day: "numeric", year: "numeric" },
    long: { month: "long", day: "numeric", year: "numeric", weekday: "long" },
  };

function formatDate(
  date: Date | string,
  style: DateFormatStyle = "short",
  locale = "en-US"
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString(locale, DATE_FORMAT_OPTIONS[style]);
}

function formatDateSimple(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString();
}

export { DATE_FORMAT_OPTIONS, formatDate, formatDateSimple };
export type { DateFormatStyle };
