import { NextRequest, NextResponse } from "next/server";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

export const runtime = "nodejs";

const PUBLIC_PATHS = ["/admin/login", "/api/admin/auth/login", "/admin/setup", "/api/admin/setup"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some(p => pathname === p)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) {
    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
