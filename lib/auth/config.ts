import type { UserRole } from "@/types";

/**
 * Route-access rules shared by middleware (edge) and server guards.
 * Kept free of Node-only imports so it can run in the edge runtime.
 */

export const STAFF_LOGIN_PATH = "/login";
export const STUDENT_LOGIN_PATH = "/portal/login";
export const STUDENT_REGISTER_PATH = "/portal/register";

/** Roles allowed into the Admin dashboard (system administration). */
export const ADMIN_ROLES: UserRole[] = ["owner", "admin"];

/** Roles allowed into the College dashboard (day-to-day college operations). */
export const COLLEGE_ROLES: UserRole[] = ["owner", "admin", "staff"];

/** Returns the default landing page for a signed-in account. */
export function homeFor(kind: "staff" | "student", role: string): string {
  if (kind === "student") return "/portal";
  return ADMIN_ROLES.includes(role as UserRole) ? "/admin" : "/college";
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;
