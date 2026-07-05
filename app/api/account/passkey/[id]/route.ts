import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

// Remove one of the member's own passkeys.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  await prisma.webauthnCredential.deleteMany({ where: { id: params.id, customerId: customer.id } });
  return NextResponse.json({ ok: true });
}
