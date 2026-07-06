import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME, CUSTOMER_SESSION_TTL_MS } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

// Verifies a Google Identity Services ID token, then signs the member in —
// linking to an existing account by email or creating one. Google has already
// verified the email, so the new account is marked verified. Needs
// NEXT_PUBLIC_GOOGLE_CLIENT_ID (public, safe to expose).
export async function POST(req: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) return NextResponse.json({ error: "Google sign-in is not configured." }, { status: 501 });

  const { credential } = await req.json().catch(() => ({}));
  if (!credential) return NextResponse.json({ error: "Missing credential" }, { status: 400 });

  let payload;
  try {
    const client = new OAuth2Client(clientId);
    const ticket = await client.verifyIdToken({ idToken: credential, audience: clientId });
    payload = ticket.getPayload();
  } catch {
    return NextResponse.json({ error: "Could not verify Google sign-in." }, { status: 401 });
  }
  if (!payload?.email || !payload.email_verified) {
    return NextResponse.json({ error: "Google account email is not verified." }, { status: 401 });
  }

  const email = payload.email.toLowerCase();
  let customer = await prisma.customer.findUnique({ where: { email } });
  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        email,
        name: payload.name || payload.given_name || null,
        // OAuth accounts have no usable password; store a random unusable hash.
        passwordHash: `google:${crypto.randomBytes(24).toString("hex")}`,
        emailVerified: new Date(),
        lastLoginAt: new Date(),
      },
    });
  } else {
    await prisma.customer.update({ where: { id: customer.id }, data: { lastLoginAt: new Date(), emailVerified: customer.emailVerified ?? new Date() } });
  }

  const { token } = await createCustomerSession(customer.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
  return res;
}
