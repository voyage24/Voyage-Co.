import { NextResponse } from "next/server";
import { resetPassword } from "@/lib/customer/reset";
import { createCustomerSession, CUSTOMER_COOKIE_NAME, CUSTOMER_SESSION_TTL_MS } from "@/lib/customer/session";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

// Completes a password reset: validates the token, sets the new password, and
// signs the member in (they've just proven identity via the emailed link).
export async function POST(req: Request) {
  const { token, password, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const customer = await resetPassword(String(token ?? ""), password);
  if (!customer) {
    return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
  }

  const { token: sessionToken } = await createCustomerSession(customer.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, sessionToken, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
  return res;
}
