import type { NextRequest } from "next/server";
import { authMiddleware } from "@/lib/auth/middleware";

export function middleware(req: NextRequest) {
  return authMiddleware(req);
}

export const config = {
  matcher: ["/admin/:path*", "/college/:path*", "/portal/:path*", "/login"],
};
