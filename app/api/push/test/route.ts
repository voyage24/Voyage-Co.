import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { sendPushToCustomer } from "@/lib/push";

export const dynamic = "force-dynamic";

// Diagnostic: sends a test push to the signed-in member and reports what
// happened — whether VAPID is configured on the server, how many device
// subscriptions are stored, and how many were delivered.
export async function POST() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const subs = await prisma.pushSubscription.count({ where: { customerId: customer.id } });
  const result = await sendPushToCustomer(customer.id, {
    title: "Test notification",
    body: "If you can see this, push is working. ✨",
    url: "/account",
  });

  return NextResponse.json({ ok: true, configured: result.configured, subscriptions: subs, sent: result.sent });
}
