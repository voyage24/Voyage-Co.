import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

// Create (or return) a capability link to share a trip with a companion.
export async function POST(_req: Request, { params }: { params: { ref: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const booking = await prisma.booking.findFirst({ where: { reference: params.ref, customerId: customer.id } });
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let token = booking.shareToken;
  if (!token) {
    token = crypto.randomBytes(9).toString("base64url");
    await prisma.booking.update({ where: { id: booking.id }, data: { shareToken: token } });
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://voyagesco.com";
  return NextResponse.json({ ok: true, url: `${base}/trip/${token}` });
}
