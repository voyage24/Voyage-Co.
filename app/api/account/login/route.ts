import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME, CUSTOMER_SESSION_TTL_MS } from "@/lib/customer/session";
import { rateLimit, clearRateLimit } from "@/lib/security/rate-limit";
import { clientIp } from "@/lib/security/turnstile";

const TOO_MANY = (retryAfter: number) =>
  NextResponse.json(
    { error: "Too many attempts. Please wait a little and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  const normalized = String(email).trim().toLowerCase();

  // Throttle by IP (broad) and by target email (defeats targeted brute force).
  const ip = clientIp(req) ?? "unknown";
  const ipLimit = await rateLimit(`login:ip:${ip}`, 20, 10 * 60 * 1000);
  if (!ipLimit.ok) return TOO_MANY(ipLimit.retryAfter);
  const emailLimit = await rateLimit(`login:email:${normalized}`, 6, 15 * 60 * 1000);
  if (!emailLimit.ok) return TOO_MANY(emailLimit.retryAfter);

  const customer = await prisma.customer.findUnique({ where: { email: normalized } });
  const ok = customer ? await bcrypt.compare(String(password), customer.passwordHash) : false;
  if (!customer || !ok) {
    return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
  }

  if (!customer.emailVerified) {
    return NextResponse.json(
      { error: "Please confirm your email first — check your inbox for the link.", unverified: true },
      { status: 403 },
    );
  }

  await clearRateLimit(`login:email:${normalized}`);
  await prisma.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date() } });
  const { token } = await createCustomerSession(customer.id);
  const res = NextResponse.json({ ok: true, customer: { id: customer.id, email: customer.email, name: customer.name } });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
  return res;
}
