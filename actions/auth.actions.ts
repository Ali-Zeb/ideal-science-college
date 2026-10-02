"use server";

import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connect";
import { Student, User } from "@/lib/db/models";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/lib/validators/auth.schema";
import { emailAddress } from "@/lib/validators/fields";
import { emailDomainAcceptsMail } from "@/lib/email/verify-domain";
import { CODE_ERRORS, consumeCode, issueCode } from "@/lib/auth/codes";
import { getSession, toErrorMessage } from "@/lib/auth/guards";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { fail, ok, validationError } from "@/lib/actions";
import type { ActionResult } from "@/types";

const BCRYPT_ROUNDS = 12;

/**
 * Registers a student portal account. The account stays locked until the
 * 6-digit code emailed to the address is verified.
 */
export async function registerStudent(input: unknown): Promise<ActionResult<{ email: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { name, email, phone, password } = parsed.data;

  try {
    await connectDB();
    const ip = await getClientIp();
    const limit = await rateLimit(`register:${ip}`, 5, 60 * 60);
    if (!limit.allowed) return fail("Too many sign-up attempts from your network. Please try again later.");

    if (!(await emailDomainAcceptsMail(email))) {
      return { success: false, error: "This email domain cannot receive mail.", fieldErrors: { email: ["Enter a real, working email address"] } };
    }

    const existing = await Student.findOne({ email }).select("emailVerified");
    if (existing?.emailVerified) {
      return { success: false, error: "An account with this email already exists.", fieldErrors: { email: ["Already registered — sign in instead"] } };
    }

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    if (existing) {
      // Unverified account: allow the owner of the inbox to restart sign-up.
      await Student.updateOne({ _id: existing._id }, { $set: { name, phone, password: hashed } });
    } else {
      await Student.create({ name, email, phone, password: hashed });
    }

    await issueCode(email, name, "student", "verify-email");
    return ok({ email }, "We sent a 6-digit code to your email.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Verifies a student's email with the emailed 6-digit code. */
export async function verifyStudentEmail(input: unknown): Promise<ActionResult<null>> {
  const parsed = verifyEmailSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { email, code } = parsed.data;

  try {
    await connectDB();
    const student = await Student.findOne({ email }).select("emailVerified");
    if (!student) return fail("No sign-up found for this email.");
    if (student.emailVerified) return ok(null, "Email already verified. You can sign in.");

    const result = await consumeCode(email, "student", "verify-email", code);
    if (result !== "ok") return { success: false, error: CODE_ERRORS[result], fieldErrors: { code: [CODE_ERRORS[result]] } };

    student.emailVerified = new Date();
    await student.save();
    return ok(null, "Email verified! You can now sign in.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Re-sends the email verification code (60-second cooldown). */
export async function resendVerificationCode(rawEmail: unknown): Promise<ActionResult<null>> {
  const parsed = emailAddress().safeParse(rawEmail);
  if (!parsed.success) return fail("Enter a valid email address.");
  try {
    await connectDB();
    const student = await Student.findOne({ email: parsed.data }).select("name emailVerified").lean();
    if (!student || student.emailVerified) return ok(null, "If this email needs verification, a new code has been sent.");
    const res = await issueCode(parsed.data, student.name, "student", "verify-email");
    if (!res.ok) return fail(`Please wait ${res.retryAfter} seconds before requesting another code.`);
    return ok(null, "A new code has been sent to your email.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/**
 * Starts a password reset. Always responds the same way whether or not the
 * account exists, so the form cannot be used to discover registered emails.
 */
export async function requestPasswordReset(input: unknown): Promise<ActionResult<null>> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { email, accountKind } = parsed.data;
  const generic = ok(null, "If an account exists for this email, a reset code has been sent.");

  try {
    await connectDB();
    const ip = await getClientIp();
    const limit = await rateLimit(`reset:${ip}`, 8, 60 * 60);
    if (!limit.allowed) return fail("Too many requests. Please try again later.");

    const account =
      accountKind === "staff"
        ? await User.findOne({ email, isActive: true }).select("name").lean()
        : await Student.findOne({ email, isActive: true, emailVerified: { $ne: null } }).select("name").lean();
    if (!account) return generic;

    const res = await issueCode(email, account.name, accountKind, "reset-password");
    if (!res.ok) return fail(`Please wait ${res.retryAfter} seconds before requesting another code.`);
    return generic;
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Completes a password reset using the emailed code. */
export async function resetPassword(input: unknown): Promise<ActionResult<null>> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);
  const { email, accountKind, code, password } = parsed.data;

  try {
    await connectDB();
    const result = await consumeCode(email, accountKind, "reset-password", code);
    if (result !== "ok") return { success: false, error: CODE_ERRORS[result], fieldErrors: { code: [CODE_ERRORS[result]] } };

    const hashed = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const model = accountKind === "staff" ? User : Student;
    await (model as typeof User).updateOne({ email }, { $set: { password: hashed } });
    return ok(null, "Password updated. You can now sign in.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}

/** Changes the signed-in user's password (staff or student). */
export async function changePassword(input: unknown): Promise<ActionResult<null>> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return validationError(parsed.error);

  try {
    const session = await getSession();
    if (!session) return fail("Please sign in again.");
    await connectDB();
    const model = (session.user.kind === "staff" ? User : Student) as typeof User;
    const account = await model.findById(session.user.id).select("+password");
    if (!account) return fail("Account not found.");

    const valid = await bcrypt.compare(parsed.data.currentPassword, account.password);
    if (!valid) return { success: false, error: "Current password is incorrect.", fieldErrors: { currentPassword: ["Incorrect password"] } };

    account.password = await bcrypt.hash(parsed.data.password, BCRYPT_ROUNDS);
    await account.save();
    return ok(null, "Password changed successfully.");
  } catch (error) {
    return fail(toErrorMessage(error));
  }
}
