import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { getEmailTemplate, bodyToHtml } from "@/lib/email/email-templates";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getRemaining } from "@/lib/availability";
import { notifyWhatsApp } from "@/lib/email/notify-admin";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A "Reserve" submission now creates a real Booking (status: pending). If the
// visitor is signed in, it's linked to their account so it shows under "My
// Bookings". Payment (later) will flip the status to "confirmed".
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(b?.turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }
  const { name, email, phone, itemType, itemId, itemTitle, image, total, checkIn, checkOut, guests, seat, notes, ref } = b ?? {};

  if (!name || !String(name).trim() || !email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "A phone number is required" }, { status: 400 });
  }
  if (!itemType || !itemId || !itemTitle) {
    return NextResponse.json({ error: "Missing booking item" }, { status: 400 });
  }
  // Hotels are the only dated reservation — require dates + a valid guest count.
  if (itemType === "hotel" && (!checkIn || !checkOut || !(Number(guests) >= 1))) {
    return NextResponse.json({ error: "Check-in, check-out and number of guests are required" }, { status: 400 });
  }

  // Reject if the item has a capacity and it's already full.
  const remaining = await getRemaining(itemType, itemId);
  if (remaining !== null && remaining <= 0) {
    return NextResponse.json({ error: "This experience is fully booked. Please contact the concierge for the waitlist." }, { status: 409 });
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
        seat: (itemType === "flight" && typeof seat === "string" && seat.trim()) ? seat.trim() : null,
        notes: notes || null,
      },
    });
  } catch (err) {
    console.error("Failed to create booking:", err);
    return NextResponse.json({ error: "Could not save booking" }, { status: 500 });
  }

  await notifyWhatsApp(`🔔 New booking ${reference}\n${name} · ${itemTitle}${typeof total === "number" && total > 0 ? ` · ₹${Math.round(total).toLocaleString("en-IN")}` : ""}`);

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

  // Branded confirmation to the customer.
  try {
    const transporter = createTransport();
    const dates = checkIn ? `<p style="margin:0 0 6px;"><strong>Dates:</strong> ${checkIn}${checkOut ? ` → ${checkOut}` : ""}</p>` : "";
    const body = `
      <p style="margin:0 0 16px;">We've received your reservation request. A member of our concierge team will be in touch shortly to confirm the details and finalise your journey.</p>
      <p style="margin:0 0 6px;"><strong>Reference:</strong> ${reference}</p>
      <p style="margin:0 0 6px;"><strong>${itemTitle}</strong></p>
      ${dates}
      ${itemType === "flight" && typeof seat === "string" && seat.trim() ? `<p style="margin:0 0 6px;"><strong>Seat:</strong> ${seat.trim()}</p>` : ""}
      <p style="margin:0 0 6px;"><strong>Guests:</strong> ${guests ?? 1}</p>
      ${typeof total === "number" && total > 0 ? `<p style="margin:0;"><strong>Estimated total:</strong> ${inr(Math.round(total))}</p>` : ""}
    `;
    const firstName = String(name).split(" ")[0];
    const tpl = await getEmailTemplate("booking", { firstName: firstName ? `, ${firstName}` : "", reference, itemTitle: String(itemTitle) });
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to: email,
      subject: tpl.subject,
      text: renderConciergeEmailText({
        heading: tpl.heading,
        bodyText: `${tpl.body}\n\nReference: ${reference}\n${itemTitle}\n${checkIn ? `Dates: ${checkIn}${checkOut ? ` to ${checkOut}` : ""}\n` : ""}Guests: ${guests ?? 1}`,
        signoff: "With anticipation,",
      }),
      html: renderConciergeEmailHTML({
        eyebrow: "Reservation Received",
        heading: tpl.heading,
        bodyHtml: `${bodyToHtml(tpl.body)}${body}`,
        signoff: "With anticipation,",
      }),
    });
  } catch (err) {
    console.error("Customer confirmation email failed:", err);
  }

  return NextResponse.json({ ok: true, reference });
}
