import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME, CUSTOMER_SESSION_TTL_MS } from "@/lib/customer/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const { name, email, password } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
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
  const customer = await prisma.customer.create({
    data: { email: normalized, passwordHash, name: name?.trim() || null },
  });

  const { token, expiresAt } = await createCustomerSession(customer.id);
  const res = NextResponse.json({ ok: true, customer: { id: customer.id, email: customer.email, name: customer.name } });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
  return res;
}
