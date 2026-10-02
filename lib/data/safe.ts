import "server-only";
import { connectDB, isDbConfigured } from "@/lib/db/connect";

/**
 * Runs a read-only query for public pages. If the database is not configured
 * or unreachable, logs the error and returns `fallback` so the page still
 * renders with its empty state instead of crashing.
 * @param label - Short name used in the server log.
 * @param fallback - Value returned on failure.
 * @param query - Async query to run after connecting.
 * @param preview - Optional preview content returned only when no database is configured.
 */
export async function safeQuery<T>(label: string, fallback: T, query: () => Promise<T>, preview?: () => T): Promise<T> {
  if (!isDbConfigured()) return preview ? preview() : fallback;
  try {
    await connectDB();
    return await query();
  } catch (error) {
    console.error(`[data:${label}]`, error);
    return fallback;
  }
}

/**
 * Connects and runs a query for authenticated dashboards. Errors propagate to
 * the nearest `error.tsx` boundary so staff see that something went wrong.
 * @param query - Async query to run after connecting.
 */
export async function dbQuery<T>(query: () => Promise<T>): Promise<T> {
  await connectDB();
  return query();
}
