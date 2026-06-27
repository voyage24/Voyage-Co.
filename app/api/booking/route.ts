import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A "Reserve" submission. Previously this lived only in the visitor's
// browser (localStorage) and never reached us — now it's stored as an
// enquiry and emailed to the concierge.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, email, phone, itemType, itemId, itemTitle, total, message, ref } = body ?? {};

  if (!name || !email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }

  try {
    await prisma.enquiry.create({
      data: {
        type: "booking",
        name,
        email,
        phone: phone || null,
        subject: ref ? `Reservation ${ref}` : "Reservation request",
        message: message || null,
        itemType: itemType || null,
        itemId: itemId || null,
        itemTitle: itemTitle || null,
        total: typeof total === "number" ? Math.round(total) : null,
      },
    });
  } catch (err) {
    console.error("Failed to store booking enquiry:", err);
  }

  // Best-effort concierge notification.
  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[Reservation] ${itemTitle ?? "Booking request"} — ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nItem: ${itemTitle ?? "—"} (${itemType ?? "—"}/${itemId ?? "—"})\nEstimated total: ${total ?? "—"}\nReference: ${ref ?? "—"}\n\n${message || ""}`,
    });
  } catch (err) {
    console.error("Booking notification email failed:", err);
  }

  return NextResponse.json({ ok: true });
}
