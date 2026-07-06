import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Native Apple Wallet (.pkpass) generation. A valid pass must be signed with an
// Apple "Pass Type ID" certificate, which requires a paid Apple Developer
// account — it can't be produced without those credentials. When they're added
// (APPLE_PASS_CERT / APPLE_PASS_KEY / APPLE_PASS_TEAM_ID / APPLE_PASS_TYPE_ID),
// wire up passkit-generator here. Until then we return 501 so the client falls
// back to the shareable QR pass, which works on every device today.
export async function GET() {
  if (!process.env.APPLE_PASS_CERT) {
    return NextResponse.json(
      { error: "Native Wallet passes are not configured.", needs: ["APPLE_PASS_CERT", "APPLE_PASS_KEY", "APPLE_PASS_TEAM_ID", "APPLE_PASS_TYPE_ID"] },
      { status: 501 },
    );
  }
  // TODO: build + sign the .pkpass with passkit-generator and return it as
  // application/vnd.apple.pkpass once certificates are provisioned.
  return NextResponse.json({ error: "Not implemented." }, { status: 501 });
}
