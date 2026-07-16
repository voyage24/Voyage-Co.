import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { getEmailTemplate, bodyToHtml } from "@/lib/email/email-templates";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getRemaining } from "@/lib/availability";
import { notifyWhatsApp } from "@/lib/email/notify-admin";
import { sendPushToAdmins } from "@/lib/push";
import { verifyTurnstile, clientIp } from "@/lib/security/turnstile";
import { CURRENCIES } from "@/lib/currency";

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Prices are stored in the INR base, but a guest may have been browsing in
// another currency. Show them the figure they were actually quoted, with the
// INR base alongside so the concierge can reconcile it.
function money(inrAmount: number, quoteCurrency?: string | null, quoteTotal?: number | null) {
  if (quoteCurrency && quoteCurrency !== "INR" && typeof quoteTotal === "number" && quoteTotal > 0) {
    const sym = CURRENCIES.find(c => c.code === quoteCurrency)?.symbol ?? "";
    return `${sym}${quoteTotal.toLocaleString("en-US")} ${quoteCurrency} (${inr(inrAmount)})`;
  }
  return inr(inrAmount);
}

// A "Reserve" submission now creates a real Booking (status: pending). If the
// visitor is signed in, it's linked to their account so it shows under "My
// Bookings". Payment (later) will flip the status to "confirmed".
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  if (!(await verifyTurnstile(b?.turnstileToken, clientIp(req)))) {
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 400 });
  }
  const { name, email, phone, itemType, itemId, itemTitle, image, total, checkIn, checkOut, guests, seat, notes, ref, quoteCurrency, quoteTotal } = b ?? {};

  // The currency the guest was viewing when they reserved (display only —
  // `total` stays the INR base). Only accept a currency we actually offer.
  const quoteCcy = typeof quoteCurrency === "string" && CURRENCIES.some(c => c.code === quoteCurrency) ? quoteCurrency : null;
  const quoteAmt = quoteCcy && quoteCcy !== "INR" && Number(quoteTotal) > 0 ? Math.round(Number(quoteTotal)) : null;

  if (!name || !String(name).trim() || !email || typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Name and a valid email are required" }, { status: 400 });
  }
  if (!phone || typeof phone !== "string" || !phone.trim()) {
    return NextResponse.json({ error: "A phone number is required" }, { status: 400 });
  }
  if (!itemType || !itemId || !itemTitle) {
    return NextResponse.json({ error: "Missing booking item" }, { status: 400 });
  }
  // No journey is confirmed without its dates. Multi-day stays (hotel, package,
  // cruise) need check-in + check-out; experiences need a single date. All dated
  // bookings need a valid guest count.
  const multiDay = itemType === "hotel" || itemType === "package" || itemType === "cruise";
  const singleDay = itemType === "experience" || itemType === "flight" || itemType === "train";
  if (multiDay && (!checkIn || !checkOut || !(Number(guests) >= 1))) {
    return NextResponse.json({ error: "Check-in, check-out and number of guests are required" }, { status: 400 });
  }
  if (singleDay && (!checkIn || !(Number(guests) >= 1))) {
    return NextResponse.json({ error: "A date and number of guests are required" }, { status: 400 });
  }
  if (multiDay && checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
    return NextResponse.json({ error: "Check-out must be after check-in" }, { status: 400 });
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
        quoteCurrency: quoteAmt ? quoteCcy : null,
        quoteTotal: quoteAmt,
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

  const totalLabel = typeof total === "number" && total > 0 ? money(Math.round(total), quoteCcy, quoteAmt) : "";
  await notifyWhatsApp(`🔔 New booking ${reference}\n${name} · ${itemTitle}${totalLabel ? ` · ${totalLabel}` : ""}`);

  // Push to the admin's phone/devices too (mirrors the new-mail alerts).
  await sendPushToAdmins({
    title: `🔔 New booking · ${itemTitle}`,
    body: `${name}${totalLabel ? ` · ${totalLabel}` : ""} · ${reference}`,
    url: "/admin/bookings",
  }).catch(() => {});

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: `[Booking ${reference}] ${itemTitle} — ${name}`,
      text: `Reference: ${reference}\nName: ${name}\nEmail: ${email}\nPhone: ${phone || "—"}\nItem: ${itemTitle} (${itemType}/${itemId})\nDates: ${checkIn || "—"}${checkOut ? ` → ${checkOut}` : ""}\nGuests: ${guests ?? 1}\nEstimated total: ${totalLabel || "—"}${quoteAmt ? `\n(Guest was quoted in ${quoteCcy})` : ""}\n${notes ? `\nNotes: ${notes}` : ""}`,
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
      ${typeof total === "number" && total > 0 ? `<p style="margin:0;"><strong>Estimated total:</strong> ${money(Math.round(total), quoteCcy, quoteAmt)}</p>` : ""}
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
