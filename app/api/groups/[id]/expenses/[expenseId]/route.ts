import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getMembership } from "@/lib/group/access";

export const dynamic = "force-dynamic";

// DELETE — remove an expense (whoever logged it, or the organiser).
export async function DELETE(_req: Request, { params }: { params: { id: string; expenseId: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const membership = await getMembership(params.id, customer.id);
  if (!membership) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const expense = await prisma.groupExpense.findFirst({ where: { id: params.expenseId, groupId: params.id }, select: { id: true, paidById: true } });
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (expense.paidById !== customer.id && membership.role !== "owner") return NextResponse.json({ error: "Only the organiser or whoever logged it can remove it" }, { status: 403 });

  await prisma.groupExpense.delete({ where: { id: expense.id } });
  return NextResponse.json({ ok: true });
}
