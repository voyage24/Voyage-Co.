import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

// Returns (creating if needed) the customer's shareable board link.
export async function POST() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let token = customer.shareToken;
  if (!token) {
    token = crypto.randomBytes(9).toString("base64url");
    await prisma.customer.update({ where: { id: customer.id }, data: { shareToken: token } });
  }
  return NextResponse.json({ ok: true, url: `https://voyagesco.com/boards/${token}` });
}
