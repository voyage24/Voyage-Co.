import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false, notifications: [], unread: 0 });
  const [notifications, unread] = await Promise.all([
    prisma.memberNotification.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, take: 30 }),
    prisma.memberNotification.count({ where: { customerId: customer.id, read: false } }),
  ]);
  return NextResponse.json({ loggedIn: true, unread, notifications: notifications.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })) });
}

// Mark notifications read (all, or a single id).
export async function POST(req: NextRequest) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const where = body.id
    ? { id: String(body.id), customerId: customer.id }
    : { customerId: customer.id, read: false };
  await prisma.memberNotification.updateMany({ where, data: { read: true } });
  return NextResponse.json({ ok: true });
}
