import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });
  await prisma.itinerary.deleteMany({ where: { id: params.id, customerId: customer.id } });
  return NextResponse.json({ ok: true });
}
