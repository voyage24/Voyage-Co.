import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueResetToken, sendResetEmail } from "@/lib/customer/reset";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";
import { rateLimit } from "@/lib/security/rate-limit";

// Starts a password reset. Always returns ok (even for unknown addresses) so it
// can't be used to probe which emails have accounts.
export async function POST(req: Request) {
  const { email, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }
  // Cap reset-email sends per IP so nobody can spam a victim's inbox.
  const limit = await rateLimit(`forgot:ip:${clientIp(req) ?? "unknown"}`, 5, 15 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many requests. Please wait a little and try again." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }
  const normalized = String(email ?? "").trim().toLowerCase();
  if (normalized) {
    const customer = await prisma.customer.findUnique({ where: { email: normalized } });
    if (customer) {
      try {
        const token = await issueResetToken(customer.id);
        await sendResetEmail(customer, token);
      } catch (err) {
        console.error("Password reset email failed:", err);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
