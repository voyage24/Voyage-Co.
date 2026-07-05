import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer, CUSTOMER_COOKIE_NAME } from "@/lib/customer/session";

// Self-service account deletion (GDPR). Removes the account and its sessions,
// saved items, searches and itineraries (cascade). Past bookings and reviews
// are kept as transactional records but unlinked from the account (SetNull),
// so business/accounting history stays intact without a live personal link.
export async function POST() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await prisma.customer.delete({ where: { id: customer.id } });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
