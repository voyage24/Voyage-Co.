import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { RP_ID, challengeCookie } from "@/lib/webauthn";

// Usernameless (discoverable-credential) sign-in: no allowCredentials, so the
// authenticator offers whichever passkey the member has for this site.
export async function POST() {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
    allowCredentials: [],
  });

  const res = NextResponse.json(options);
  const ck = challengeCookie(options.challenge);
  res.cookies.set(ck.name, ck.value, ck.options);
  return res;
}
