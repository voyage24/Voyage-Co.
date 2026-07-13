import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

// DELETE — remove one of the member's own expenses.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  const row = await prisma.personalExpense.findFirst({ where: { id: params.id, customerId: customer.id }, select: { id: true } });
  if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.personalExpense.delete({ where: { id: row.id } });
  return NextResponse.json({ ok: true });
}
