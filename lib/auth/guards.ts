import "server-only";
import { getServerSession, type Session } from "next-auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db/connect";
import { Student, User } from "@/lib/db/models";
import { authOptions } from "./options";
import { ADMIN_ROLES, COLLEGE_ROLES, STAFF_LOGIN_PATH, STUDENT_LOGIN_PATH } from "./config";
import type { UserRole } from "@/types";

export class AuthError extends Error {
  constructor(message = "You are not allowed to perform this action.") {
    super(message);
    this.name = "AuthError";
  }
}

/** Returns the current session or null. */
export function getSession(): Promise<Session | null> {
  return getServerSession(authOptions);
}

async function isActiveAccount(session: Session): Promise<boolean> {
  await connectDB();
  const model = session.user.kind === "staff" ? User : Student;
  const doc = await (model as typeof User).findById(session.user.id).select("isActive role").lean();
  if (!doc || doc.isActive === false) return false;
  // Pick up role changes made after the token was issued.
  if (session.user.kind === "staff") session.user.role = doc.role as UserRole;
  return true;
}

/**
 * Ensures a signed-in, active staff member with one of `roles`.
 * Use in server actions and route handlers; throws `AuthError` on failure.
 * @param roles - Allowed roles (defaults to every staff role).
 */
export async function requireStaff(roles: UserRole[] = COLLEGE_ROLES): Promise<Session> {
  const session = await getSession();
  if (!session || session.user.kind !== "staff") throw new AuthError("Please sign in to continue.");
  if (!(await isActiveAccount(session))) throw new AuthError("Your account is inactive.");
  if (!roles.includes(session.user.role as UserRole)) throw new AuthError();
  return session;
}

/**
 * Ensures a signed-in, active student account. Throws `AuthError` on failure.
 */
export async function requireStudent(): Promise<Session> {
  const session = await getSession();
  if (!session || session.user.kind !== "student") throw new AuthError("Please sign in to your student portal.");
  if (!(await isActiveAccount(session))) throw new AuthError("Your account is inactive.");
  return session;
}

/**
 * Page-level guard for dashboard layouts: redirects instead of throwing.
 * @param area - Which dashboard is being opened.
 */
export async function guardPage(area: "admin" | "college" | "portal"): Promise<Session> {
  const session = await getSession();
  if (area === "portal") {
    if (!session || session.user.kind !== "student" || !(await isActiveAccount(session))) {
      redirect(`${STUDENT_LOGIN_PATH}?callbackUrl=/portal`);
    }
    return session;
  }
  if (!session || session.user.kind !== "staff" || !(await isActiveAccount(session))) {
    redirect(`${STAFF_LOGIN_PATH}?callbackUrl=/${area}`);
  }
  const allowed = area === "admin" ? ADMIN_ROLES : COLLEGE_ROLES;
  if (!allowed.includes(session.user.role as UserRole)) redirect("/college?denied=1");
  return session;
}

/** Converts thrown errors into a user-facing message for action results. */
export function toErrorMessage(error: unknown): string {
  if (error instanceof AuthError) return error.message;
  console.error(error);
  return "Something went wrong. Please try again.";
}
