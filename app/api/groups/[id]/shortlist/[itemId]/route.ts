import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getMembership, displayName } from "@/lib/group/access";
import { notifyGroup } from "@/lib/group/notify";

export const dynamic = "force-dynamic";

// POST — toggle the current member's vote on a shortlisted item.
export async function POST(_req: Request, { params }: { params: { id: string; itemId: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  if (!(await getMembership(params.id, customer.id))) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const item = await prisma.groupShortlistItem.findFirst({ where: { id: params.itemId, groupId: params.id }, select: { id: true, title: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.groupVote.findUnique({ where: { itemId_customerId: { itemId: item.id, customerId: customer.id } } });
  if (existing) {
    await prisma.groupVote.delete({ where: { id: existing.id } });
    return NextResponse.json({ ok: true, voted: false });
  }
  await prisma.groupVote.create({ data: { itemId: item.id, customerId: customer.id } });
  const who = displayName(customer.name, customer.email);
  await notifyGroup(params.id, customer.id, "🗳️ New vote", `${who} voted for ${item.title}`).catch(() => {});
  return NextResponse.json({ ok: true, voted: true });
}

// DELETE — remove a shortlisted item (the member who added it, or the organiser).
export async function DELETE(_req: Request, { params }: { params: { id: string; itemId: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const membership = await getMembership(params.id, customer.id);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const item = await prisma.groupShortlistItem.findFirst({ where: { id: params.itemId, groupId: params.id }, select: { id: true, addedById: true } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.addedById !== customer.id && membership.role !== "owner") return NextResponse.json({ error: "Only the organiser or whoever added it can remove it" }, { status: 403 });

  await prisma.groupShortlistItem.delete({ where: { id: item.id } });
  return NextResponse.json({ ok: true });
}
