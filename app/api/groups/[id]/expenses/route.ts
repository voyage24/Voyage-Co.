import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getMembership, displayName } from "@/lib/group/access";
import { notifyGroup } from "@/lib/group/notify";
import { categorizeExpense, isExpenseCategory } from "@/lib/group/expense-category";

export const dynamic = "force-dynamic";

// POST — log a shared expense. { description, amount (INR), paidById?, splitAmong?[] }
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  if (!(await getMembership(params.id, customer.id))) return NextResponse.json({ error: "Not a member" }, { status: 403 });

  const { description, amount, paidById, splitAmong, category } = await req.json().catch(() => ({}));
  if (!description || typeof description !== "string" || !description.trim()) return NextResponse.json({ error: "What was it for?" }, { status: 400 });
  const amt = Math.round(Number(amount));
  if (!(amt > 0)) return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });
  // Explicit category wins; otherwise auto-detect from the description.
  const cat = isExpenseCategory(category) ? category : categorizeExpense(description);

  // Validate the payer and the split are members of this group.
  const members = await prisma.groupMember.findMany({ where: { groupId: params.id }, select: { customerId: true } });
  const memberIds = new Set(members.map(m => m.customerId));
  const payer = typeof paidById === "string" && memberIds.has(paidById) ? paidById : customer.id;
  const among = Array.isArray(splitAmong) ? splitAmong.filter((x: unknown) => typeof x === "string" && memberIds.has(x)) : [];
  const split = among.length ? among : Array.from(memberIds);

  const desc = description.trim().slice(0, 160);
  await prisma.groupExpense.create({ data: { groupId: params.id, description: desc, amount: amt, category: cat, paidById: payer, splitAmong: split } });
  const who = displayName(customer.name, customer.email);
  await notifyGroup(params.id, customer.id, "💸 New shared expense", `${who} added “${desc}” · ₹${amt.toLocaleString("en-IN")}`).catch(() => {});
  return NextResponse.json({ ok: true });
}
