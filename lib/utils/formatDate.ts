const DEFAULT_LOCALE = "en-PK";
const TIME_ZONE = "Asia/Karachi";

/**
 * Formats a date as e.g. "12 March 2026".
 * @param date - Date instance or ISO string.
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}

/**
 * Formats a date as e.g. "12 Mar 2026, 10:30 am".
 * @param date - Date instance or ISO string.
 */
export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}

/**
 * Formats only the time portion, e.g. "10:30 am".
 * @param date - Date instance or ISO string.
 */
export function formatTime(date: Date | string): string {
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  }).format(new Date(date));
}

/**
 * Returns day number and short month parts for calendar-style badges.
 * @param date - Date instance or ISO string.
 */
export function dateParts(date: Date | string): { day: string; month: string; year: string } {
  const d = new Date(date);
  const fmt = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(DEFAULT_LOCALE, { ...opts, timeZone: TIME_ZONE }).format(d);
  return { day: fmt({ day: "2-digit" }), month: fmt({ month: "short" }), year: fmt({ year: "numeric" }) };
}

/**
 * Converts a date to the value expected by `<input type="datetime-local">` in Pakistan time.
 * @param date - Date instance or ISO string.
 */
export function toDateTimeLocal(date: Date | string): string {
  const d = new Date(new Date(date).toLocaleString("en-US", { timeZone: TIME_ZONE }));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/**
 * Parses a `datetime-local` value entered in Pakistan time (UTC+5) into a Date.
 * @param value - String in `YYYY-MM-DDTHH:mm` format.
 */
export function fromDateTimeLocal(value: string): Date {
  return new Date(`${value}:00+05:00`);
}

/**
 * Formats a number as Pakistani Rupees, e.g. "Rs 45,000".
 * @param amount - Amount in PKR.
 */
export function formatCurrency(amount: number): string {
  return `Rs ${new Intl.NumberFormat("en-PK").format(amount)}`;
}
