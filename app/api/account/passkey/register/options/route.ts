import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { isoUint8Array } from "@simplewebauthn/server/helpers";
import type { AuthenticatorTransportFuture } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { RP_NAME, RP_ID, challengeCookie } from "@/lib/webauthn";

export async function POST() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const existing = await prisma.webauthnCredential.findMany({ where: { customerId: customer.id } });
  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: isoUint8Array.fromUTF8String(customer.id),
    userName: customer.email,
    userDisplayName: customer.name || customer.email,
    attestationType: "none",
    excludeCredentials: existing.map(c => ({
      id: c.credentialId,
      transports: c.transports ? (c.transports.split(",") as AuthenticatorTransportFuture[]) : undefined,
    })),
    authenticatorSelection: { residentKey: "preferred", userVerification: "preferred" },
  });

  const res = NextResponse.json(options);
  const ck = challengeCookie(options.challenge);
  res.cookies.set(ck.name, ck.value, ck.options);
  return res;
}
