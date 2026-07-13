import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

// POST { token } — join a group via its invite token. Idempotent.
export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { token } = await req.json().catch(() => ({}));
  if (!token || typeof token !== "string") return NextResponse.json({ error: "Invalid invite" }, { status: 400 });

  const group = await prisma.groupTrip.findUnique({ where: { shareToken: token }, select: { id: true } });
  if (!group) return NextResponse.json({ error: "This invite is no longer valid" }, { status: 404 });

  await prisma.groupMember.upsert({
    where: { groupId_customerId: { groupId: group.id, customerId: customer.id } },
    update: {},
    create: { groupId: group.id, customerId: customer.id, role: "member" },
  });
  return NextResponse.json({ ok: true, id: group.id });
}
