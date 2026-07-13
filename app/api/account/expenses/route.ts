import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { categorizeExpense, isExpenseCategory } from "@/lib/group/expense-category";

export const dynamic = "force-dynamic";

// GET — the member's personal travel expenses (optionally for one trip ?ref=),
// with category totals and the trips they can tag against.
export async function GET(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ loggedIn: false });
  const ref = new URL(req.url).searchParams.get("ref");

  const [rows, tripRows] = await Promise.all([
    prisma.personalExpense.findMany({ where: { customerId: customer.id, ...(ref ? { bookingRef: ref } : {}) }, orderBy: [{ spentOn: "desc" }, { createdAt: "desc" }] }),
    prisma.booking.findMany({ where: { customerId: customer.id, status: { not: "cancelled" } }, orderBy: { createdAt: "desc" }, select: { reference: true, itemTitle: true } }),
  ]);

  const total = rows.reduce((s, e) => s + e.amount, 0);
  const catMap = new Map<string, number>();
  for (const e of rows) catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
  const categoryTotals = Array.from(catMap.entries()).map(([category, t]) => ({ category, total: t })).sort((a, b) => b.total - a.total);

  return NextResponse.json({
    loggedIn: true,
    expenses: rows.map(e => ({ id: e.id, description: e.description, amount: e.amount, category: e.category, spentOn: e.spentOn, bookingRef: e.bookingRef })),
    total, categoryTotals,
    trips: tripRows.map(t => ({ reference: t.reference, title: t.itemTitle })),
  });
}

// POST — log a personal expense. { description, amount, category?, spentOn?, bookingRef? }
export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const { description, amount, category, spentOn, bookingRef } = await req.json().catch(() => ({}));
  if (!description || typeof description !== "string" || !description.trim()) return NextResponse.json({ error: "What was it for?" }, { status: 400 });
  const amt = Math.round(Number(amount));
  if (!(amt > 0)) return NextResponse.json({ error: "Enter a valid amount" }, { status: 400 });

  const cat = isExpenseCategory(category) ? category : categorizeExpense(description);
  const date = typeof spentOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(spentOn) ? spentOn : new Date().toISOString().slice(0, 10);
  // Only allow tagging to one of the member's own bookings.
  let ref: string | null = null;
  if (typeof bookingRef === "string" && bookingRef) {
    const owned = await prisma.booking.findFirst({ where: { reference: bookingRef, customerId: customer.id }, select: { reference: true } });
    ref = owned?.reference ?? null;
  }

  await prisma.personalExpense.create({ data: { customerId: customer.id, description: description.trim().slice(0, 160), amount: amt, category: cat, spentOn: date, bookingRef: ref } });
  return NextResponse.json({ ok: true });
}
