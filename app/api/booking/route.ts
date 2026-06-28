import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { getCurrentCustomer } from "@/lib/customer/session";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A "Reserve" submission now creates a real Booking (status: pending). If the
// visitor is signed in, it's linked to their account so it shows under "My
// Bookings". Payment (later) will flip the status to "confirmed".
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const { name, email, phone, itemType, itemId, itemTitle, image, total, checkIn, checkOut, guests, notes, ref } = b ?? {};

  if (!name || !email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }
  if (!itemType || !itemId || !itemTitle) {
    return NextResponse.json({ error: "Missing booking item" }, { status: 400 });
  }

  const customer = await getCurrentCustomer();
  const reference = (typeof ref === "string" && ref) || "VC-" + Math.random().toString(36).slice(2, 8).toUpperCase();

  try {
    await prisma.booking.create({
      data: {
        customerId: customer?.id ?? null,
        type: itemType,
        itemId,
        itemTitle,
        image: image || null,
        guestName: name,
        guestEmail: email,
        guestPhone: phone || null,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        guests: Number(guests) || 1,
        total: typeof total === "number" ? Math.round(total) : 0,
        status: "pending",
        reference,
        notes: notes || null,
      },
    });
  } catch (err) {
    console.error("Failed to create booking:", err);
    return NextResponse.json({ error: "Could not save booking" }, { status: 500 });
  }

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[Booking ${reference}] ${itemTitle} — ${name}`,
      text: `Reference: ${reference}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nItem: ${itemTitle} (${itemType}/${itemId})\nDates: ${checkIn || "—"}${checkOut ? ` → ${checkOut}` : ""}\nGuests: ${guests ?? 1}\nEstimated total: ${total ?? "—"}\n${notes ? `\nNotes: ${notes}` : ""}`,
    });
  } catch (err) {
    console.error("Booking notification email failed:", err);
  }

  return NextResponse.json({ ok: true, reference });
}
