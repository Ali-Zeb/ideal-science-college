/**
 * Converts text into a URL-safe slug.
 * @param text - Input text, e.g. "Annual Prize Day 2026".
 * @returns e.g. "annual-prize-day-2026".
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
