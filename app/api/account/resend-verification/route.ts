import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { issueVerifyToken, sendVerificationEmail } from "@/lib/customer/verify";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

// Re-sends the verification email for an unverified account. Always returns ok
// (even if the address is unknown or already verified) so it can't be used to
// probe which emails have accounts.
export async function POST(req: Request) {
  const { email, turnstileToken } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }
  const normalized = String(email ?? "").trim().toLowerCase();
  if (normalized) {
    const customer = await prisma.customer.findUnique({ where: { email: normalized } });
    if (customer && !customer.emailVerified) {
      try {
        const token = await issueVerifyToken(customer.id);
        await sendVerificationEmail(customer, token);
      } catch (err) {
        console.error("Resend verification failed:", err);
      }
    }
  }
  return NextResponse.json({ ok: true });
}
