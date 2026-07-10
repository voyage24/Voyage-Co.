import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/admin/session";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

const PUBLIC_PATHS = ["/admin/login", "/api/admin/auth/login", "/admin/setup", "/api/admin/setup"];

// Edge runtime cannot run Prisma, so middleware only does a cheap
// presence check on the session cookie — the real DB-backed validation
// happens in the Node.js runtime, in app/admin/(dashboard)/layout.tsx for
// pages and via requireAdmin() in each /api/admin/** route handler.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some(p => pathname === p)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    // Carry the requested page so login can return there (e.g. the Mail app).
    if (pathname !== "/admin") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Forward the requested path so server layouts can apply role-based access
  // (layouts don't otherwise know which page is rendering).
  const headers = new Headers(req.headers);
  headers.set("x-admin-path", pathname);
  return NextResponse.next({ request: { headers } });
}
