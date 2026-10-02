import "server-only";
import { headers } from "next/headers";
import { connectDB } from "@/lib/db/connect";
import { RateLimit } from "@/lib/db/models";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Fixed-window rate limiter backed by MongoDB, so limits hold across
 * serverless instances. Expired windows are removed by a TTL index.
 * @param key - Unique bucket key, e.g. `login:203.0.113.4`.
 * @param limit - Max attempts per window.
 * @param windowSeconds - Window length in seconds.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  await connectDB();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  const existing = await RateLimit.findOne({ key }).lean();
  if (!existing || existing.expiresAt <= now) {
    await RateLimit.updateOne({ key }, { $set: { count: 1, expiresAt } }, { upsert: true });
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  const updated = await RateLimit.findOneAndUpdate({ key }, { $inc: { count: 1 } }, { new: true }).lean();
  const count = updated?.count ?? limit + 1;
  const retryAfterSeconds = Math.ceil((existing.expiresAt.getTime() - now.getTime()) / 1000);
  return { allowed: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds };
}

/**
 * Clears a rate-limit bucket (e.g. after a successful login).
 * @param key - Bucket key passed to `rateLimit`.
 */
export async function resetRateLimit(key: string): Promise<void> {
  await connectDB();
  await RateLimit.deleteOne({ key });
}

/**
 * Best-effort client IP from proxy headers (Vercel sets `x-forwarded-for`).
 */
export async function getClientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/**
 * Extracts the client IP from a raw headers object (used inside NextAuth `authorize`).
 * @param reqHeaders - Request headers as a plain record.
 */
export function ipFromHeaders(reqHeaders: Record<string, string | string[] | undefined> | undefined): string {
  const fwd = reqHeaders?.["x-forwarded-for"];
  const value = Array.isArray(fwd) ? fwd[0] : fwd;
  return value?.split(",")[0]?.trim() || "unknown";
}
