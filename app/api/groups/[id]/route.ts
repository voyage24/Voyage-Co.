import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getGroupSnapshot } from "@/lib/group/access";

export const dynamic = "force-dynamic";

// GET — the full workspace snapshot (members, shortlist+votes, expenses,
// balances, chat, photos, bookings). Members only.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const snapshot = await getGroupSnapshot(params.id, customer.id);
  if (!snapshot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, group: snapshot });
}

// DELETE — owner disbands the group (cascades to all its data).
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const group = await prisma.groupTrip.findUnique({ where: { id: params.id }, select: { ownerId: true } });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (group.ownerId !== customer.id) return NextResponse.json({ error: "Only the organiser can delete this trip" }, { status: 403 });
  await prisma.groupTrip.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
