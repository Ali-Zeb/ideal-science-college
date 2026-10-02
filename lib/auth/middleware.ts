import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ADMIN_ROLES, COLLEGE_ROLES, STAFF_LOGIN_PATH, STUDENT_LOGIN_PATH, STUDENT_REGISTER_PATH, homeFor } from "./config";
import type { UserRole } from "@/types";

function redirectTo(req: NextRequest, path: string, withCallback = true) {
  const url = new URL(path, req.url);
  if (withCallback) url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  return NextResponse.redirect(url);
}

/**
 * Edge middleware that protects the three dashboards:
 * - `/admin/*`   → staff with role owner/admin
 * - `/college/*` → any active staff role
 * - `/portal/*`  → student accounts (login/register pages stay public)
 * Signed-in users visiting a login page are sent to their own dashboard.
 */
export async function authMiddleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const isStudentAuthPage = pathname === STUDENT_LOGIN_PATH || pathname === STUDENT_REGISTER_PATH;
  const isStaffLogin = pathname === STAFF_LOGIN_PATH;

  if ((isStudentAuthPage || isStaffLogin) && token) {
    return redirectTo(req, homeFor(token.kind, token.role), false);
  }
  if (isStudentAuthPage || isStaffLogin) return NextResponse.next();

  if (pathname.startsWith("/portal")) {
    if (!token || token.kind !== "student") return redirectTo(req, STUDENT_LOGIN_PATH);
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/college")) {
    if (!token || token.kind !== "staff") return redirectTo(req, STAFF_LOGIN_PATH);
    const allowed = pathname.startsWith("/admin") ? ADMIN_ROLES : COLLEGE_ROLES;
    if (!allowed.includes(token.role as UserRole)) return redirectTo(req, "/college", false);
  }

  return NextResponse.next();
}
