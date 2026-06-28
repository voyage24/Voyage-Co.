import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

// A customer can cancel their own booking while it's still pending.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const booking = await prisma.booking.findUnique({ where: { id: params.id } });
  if (!booking || booking.customerId !== customer.id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.status === "cancelled") {
    return NextResponse.json({ ok: true });
  }
  if (booking.status !== "pending") {
    return NextResponse.json({ error: "This booking can no longer be cancelled online. Please contact the concierge." }, { status: 400 });
  }

  await prisma.booking.update({ where: { id: booking.id }, data: { status: "cancelled" } });
  return NextResponse.json({ ok: true });
}
