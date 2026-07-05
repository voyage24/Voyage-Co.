import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { createCustomerSession, CUSTOMER_COOKIE_NAME, CUSTOMER_SESSION_TTL_MS } from "@/lib/customer/session";
import { RP_ID, EXPECTED_ORIGINS, PK_CHALLENGE_COOKIE } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const expectedChallenge = req.cookies.get(PK_CHALLENGE_COOKIE)?.value;
  if (!expectedChallenge || !body?.response?.id) return NextResponse.json({ error: "Challenge expired — please try again." }, { status: 400 });

  const cred = await prisma.webauthnCredential.findUnique({ where: { credentialId: body.response.id } });
  if (!cred) return NextResponse.json({ error: "Passkey not recognised." }, { status: 400 });

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: EXPECTED_ORIGINS,
      expectedRPID: RP_ID,
      credential: {
        id: cred.credentialId,
        publicKey: isoBase64URL.toBuffer(cred.publicKey),
        counter: cred.counter,
        transports: cred.transports ? (cred.transports.split(",") as AuthenticatorTransportFuture[]) : undefined,
      },
    });
  } catch {
    return NextResponse.json({ error: "Sign-in failed." }, { status: 401 });
  }
  if (!verification.verified) return NextResponse.json({ error: "Sign-in failed." }, { status: 401 });

  await prisma.webauthnCredential.update({ where: { id: cred.id }, data: { counter: verification.authenticationInfo.newCounter } });
  await prisma.customer.update({ where: { id: cred.customerId }, data: { lastLoginAt: new Date() } }).catch(() => {});

  const { token } = await createCustomerSession(cred.customerId);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax",
    path: "/", maxAge: CUSTOMER_SESSION_TTL_MS / 1000,
  });
  res.cookies.set(PK_CHALLENGE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
