import "server-only";
import { createHash, randomInt, timingSafeEqual } from "node:crypto";
import { VerificationCode } from "@/lib/db/models";
import { isEmailConfigured, sendEmail } from "@/lib/email/send";
import { verificationCodeEmail } from "@/lib/email/templates";

type Purpose = "verify-email" | "reset-password";
type Kind = "staff" | "student";

const CODE_TTL_MS = 15 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;

const hashCode = (code: string) =>
  createHash("sha256").update(`${code}:${process.env.NEXTAUTH_SECRET ?? ""}`).digest("hex");

/**
 * Generates a fresh 6-digit code, stores its hash, and emails it.
 * Enforces a 60-second resend cooldown.
 * @returns `{ ok: false, retryAfter }` if called again too soon.
 */
export async function issueCode(
  email: string,
  name: string,
  accountKind: Kind,
  purpose: Purpose,
): Promise<{ ok: true } | { ok: false; retryAfter: number }> {
  const existing = await VerificationCode.findOne({ email, accountKind, purpose }).lean();
  if (existing?.updatedAt) {
    const elapsed = Date.now() - new Date(existing.updatedAt).getTime();
    if (elapsed < RESEND_COOLDOWN_MS) return { ok: false, retryAfter: Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000) };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await VerificationCode.updateOne(
    { email, accountKind, purpose },
    { $set: { codeHash: hashCode(code), attempts: 0, expiresAt: new Date(Date.now() + CODE_TTL_MS) } },
    { upsert: true },
  );

  if (!isEmailConfigured() && process.env.NODE_ENV !== "production") {
    console.info(`[dev] ${purpose} code for ${email}: ${code}`);
  }
  const { subject, html } = verificationCodeEmail(name, code, purpose);
  await sendEmail({ to: email, subject, html });
  return { ok: true };
}

/**
 * Checks a submitted code. Wrong guesses are counted; after 5 the code is
 * destroyed and a new one must be requested. Valid codes are single-use.
 */
export async function consumeCode(
  email: string,
  accountKind: Kind,
  purpose: Purpose,
  code: string,
): Promise<"ok" | "invalid" | "expired" | "locked"> {
  const doc = await VerificationCode.findOne({ email, accountKind, purpose });
  if (!doc || doc.expiresAt.getTime() < Date.now()) return "expired";
  if (doc.attempts >= MAX_ATTEMPTS) {
    await doc.deleteOne();
    return "locked";
  }

  const a = Buffer.from(doc.codeHash, "hex");
  const b = Buffer.from(hashCode(code), "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    doc.attempts += 1;
    await doc.save();
    return doc.attempts >= MAX_ATTEMPTS ? "locked" : "invalid";
  }

  await doc.deleteOne();
  return "ok";
}

export const CODE_ERRORS = {
  invalid: "That code is incorrect. Please check your email and try again.",
  expired: "This code has expired. Request a new one.",
  locked: "Too many wrong attempts. Request a new code.",
} as const;
