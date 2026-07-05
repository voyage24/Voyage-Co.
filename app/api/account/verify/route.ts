import { NextRequest, NextResponse } from "next/server";
import { consumeVerifyToken, sendWelcomeAndNotify } from "@/lib/customer/verify";

// Target of the "Confirm my email" link. Verifies the token, then sends the
// welcome + team-alert emails and bounces the visitor to the sign-in page.
// We intentionally do NOT create a session here (email clients pre-fetch links),
// so the member simply signs in once, now that their address is confirmed.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  const customer = await consumeVerifyToken(token);
  if (!customer) {
    return NextResponse.redirect(new URL("/verify?status=invalid", req.url));
  }
  await sendWelcomeAndNotify(customer);
  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
