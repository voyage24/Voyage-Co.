import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { RP_ID, EXPECTED_ORIGINS, PK_CHALLENGE_COOKIE } from "@/lib/webauthn";

export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const expectedChallenge = req.cookies.get(PK_CHALLENGE_COOKIE)?.value;
  if (!expectedChallenge || !body?.response) return NextResponse.json({ error: "Challenge expired — please try again." }, { status: 400 });

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge,
      expectedOrigin: EXPECTED_ORIGINS,
      expectedRPID: RP_ID,
    });
  } catch {
    return NextResponse.json({ error: "Could not register this passkey." }, { status: 400 });
  }
  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Verification failed." }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;
  try {
    await prisma.webauthnCredential.create({
      data: {
        customerId: customer.id,
        credentialId: credential.id,
        publicKey: isoBase64URL.fromBuffer(credential.publicKey),
        counter: credential.counter,
        transports: (credential.transports || []).join(",") || null,
        deviceName: typeof body.deviceName === "string" && body.deviceName.trim() ? body.deviceName.trim().slice(0, 60) : null,
      },
    });
  } catch {
    return NextResponse.json({ error: "This passkey is already registered." }, { status: 409 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PK_CHALLENGE_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
