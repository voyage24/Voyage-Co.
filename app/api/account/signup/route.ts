import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME, CUSTOMER_SESSION_TTL_MS } from "@/lib/customer/session";
import { issueVerifyToken, sendVerificationEmail } from "@/lib/customer/verify";
import { findReferrer, rewardReferralIfAny } from "@/lib/customer/referral";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { name, email, phone, password, turnstileToken, ref } = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }
  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Please enter your name" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "Please enter your mobile number" }, { status: 400 });
  }
  if (!password || typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();

  const existing = await prisma.customer.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const referrer = await findReferrer(ref);

  // Without SMTP configured (e.g. local dev) we can't send a verification link,
  // so activate immediately and sign in. In production, the account stays
  // unverified until the emailed link is clicked — the welcome + team-alert
  // emails only fire on verification, so bogus signups never reach the inbox.
  if (!process.env.SMTP_HOST) {
    const customer = await prisma.customer.create({
      data: { email: normalized, passwordHash, name: name.trim(), phone: phone.trim(), emailVerified: new Date(), referredById: referrer?.id ?? null },
    });
    await rewardReferralIfAny(customer);
    const { token } = await createCustomerSession(customer.id);
    const res = NextResponse.json({ ok: true, customer: { id: customer.id, email: customer.email, name: customer.name } });
    res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
      httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
      path: "/", maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
    });
    return res;
  }

  const customer = await prisma.customer.create({
    data: { email: normalized, passwordHash, name: name.trim(), phone: phone.trim(), referredById: referrer?.id ?? null },
  });
  try {
    const token = await issueVerifyToken(customer.id);
    await sendVerificationEmail(customer, token);
  } catch (err) {
    console.error("Verification email failed:", err);
  }
  return NextResponse.json({ ok: true, pendingVerification: true });
}
