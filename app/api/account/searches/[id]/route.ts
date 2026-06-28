import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  // deleteMany scoped to the owner so one customer can't delete another's.
  await prisma.savedSearch.deleteMany({ where: { id: params.id, customerId: customer.id } });
  return NextResponse.json({ ok: true });
}
