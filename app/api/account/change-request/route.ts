import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { notifyAdminEnquiry } from "@/lib/email/notify-admin";

// A customer requests a change to one of their bookings — lands in the
// enquiries inbox (type "change") referencing the booking.
export async function POST(req: Request) {
  const customer = await getCurrentCustomer();
  if (!customer) return NextResponse.json({ error: "Please sign in" }, { status: 401 });

  const { reference, message } = await req.json().catch(() => ({}));
  if (!message || typeof message !== "string" || message.trim().length < 3) {
    return NextResponse.json({ error: "Please describe the change you'd like" }, { status: 400 });
  }
  const booking = await prisma.booking.findFirst({ where: { reference, customerId: customer.id } });
  if (!booking) return NextResponse.json({ error: "Booking not found" }, { status: 404 });

  await prisma.enquiry.create({
    data: {
      type: "change",
      name: customer.name?.trim() || customer.email.split("@")[0],
      email: customer.email,
      subject: `Change request — ${booking.reference}`,
      message: `Booking: ${booking.itemTitle} (${booking.reference})\n\n${message.trim().slice(0, 1500)}`,
      itemType: booking.type,
      itemId: booking.itemId,
      itemTitle: booking.itemTitle,
    },
  });
  await notifyAdminEnquiry({ type: "change", name: customer.name?.trim() || customer.email, email: customer.email, subject: `Change request — ${booking.reference}`, message: `${booking.itemTitle}\n\n${message.trim().slice(0, 1500)}` });
  return NextResponse.json({ ok: true });
}
