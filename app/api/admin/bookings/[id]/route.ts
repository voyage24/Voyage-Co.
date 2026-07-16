import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { sendPushToCustomer } from "@/lib/push";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { applyPoints, pointsFor, reversePointsForBookings } from "@/lib/loyalty";

const STATUSES = ["pending", "confirmed", "cancelled"];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { status, documents } = await req.json().catch(() => ({}));
  const data: { status?: string; documents?: { label: string; url: string }[] } = {};
  if (status !== undefined) {
    if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = status;
  }
  if (documents !== undefined && Array.isArray(documents)) {
    data.documents = documents
      .filter((d: { label?: string; url?: string }) => d?.url)
      .map((d: { label?: string; url?: string }) => ({ label: String(d.label || "Document"), url: String(d.url) }))
      .slice(0, 20);
  }
  await prisma.booking.update({ where: { id: params.id }, data });
  if (status !== undefined) {
    await logAudit(admin.email, "update", "booking", params.id, `status → ${status}`);
    // Notify the member that their booking changed. Prefer the linked account;
    // fall back to matching a registered member by the booking's email, so
    // guest bookings still reach the member when the email is theirs.
    const bk = await prisma.booking.findUnique({ where: { id: params.id }, select: { customerId: true, guestEmail: true, guestName: true, itemTitle: true, reference: true, checkIn: true, checkOut: true, guests: true } }).catch(() => null);
    let targetId = bk?.customerId ?? null;
    if (!targetId && bk?.guestEmail) {
      const c = await prisma.customer.findUnique({ where: { email: bk.guestEmail.toLowerCase() }, select: { id: true } }).catch(() => null);
      targetId = c?.id ?? null;
    }
    if (targetId) {
      const title = status === "confirmed" ? "Booking confirmed" : status === "cancelled" ? "Booking cancelled" : "Booking updated";
      await sendPushToCustomer(targetId, { title, body: `${bk?.itemTitle} · ${bk?.reference}`, url: "/account" });
    }

    // Email the guest when a booking is confirmed or cancelled.
    if (bk?.guestEmail && (status === "confirmed" || status === "cancelled")) {
      await sendStatusEmail(status, bk).catch(err => console.error("Booking status email failed:", err));
    }
  }

  // Points are earned by travelling, not by booking — /api/cron/award-points
  // grants them once a journey has been completed. Cancelling a journey that had
  // already earned its points takes them back off.
  if (status === "cancelled") {
    const b = await prisma.booking.findUnique({ where: { id: params.id }, select: { customerId: true, total: true, pointsAwarded: true } });
    if (b?.customerId && b.pointsAwarded) {
      const pts = pointsFor(b.total);
      await applyPoints(b.customerId, -pts);
      await prisma.booking.update({ where: { id: params.id }, data: { pointsAwarded: false } });
      await logAudit(admin.email, "points", "booking", params.id, `−${pts} points (cancelled)`);
    }
  }

  return NextResponse.json({ ok: true });
}

type BookingLite = { guestEmail: string; guestName: string; itemTitle: string; reference: string; checkIn: string | null; checkOut: string | null; guests: number };

// Concierge email sent to the guest when a booking is confirmed or cancelled.
async function sendStatusEmail(status: string, bk: BookingLite) {
  const first = (bk.guestName || "").split(" ")[0];
  const greeting = first ? `, ${first}` : "";
  const dates = bk.checkIn ? `Dates: ${bk.checkIn}${bk.checkOut ? ` to ${bk.checkOut}` : ""}\n` : "";
  const datesHtml = bk.checkIn ? `<p style="margin:0 0 6px;"><strong>Dates:</strong> ${bk.checkIn}${bk.checkOut ? ` → ${bk.checkOut}` : ""}</p>` : "";

  const copy = status === "confirmed"
    ? { eyebrow: "Booking Confirmed", subject: `Your booking is confirmed — ${bk.reference}`, heading: `Your booking is confirmed${greeting}`, intro: "We're delighted to confirm your reservation. Everything is arranged — we look forward to welcoming you." }
    : { eyebrow: "Booking Cancelled", subject: `Your booking has been cancelled — ${bk.reference}`, heading: `Your booking has been cancelled${greeting}`, intro: "Your reservation has been cancelled. If this is unexpected, or we can help you plan another journey, simply reply to this note." };

  const detailsHtml = `
    <p style="margin:0 0 6px;"><strong>Reference:</strong> ${bk.reference}</p>
    <p style="margin:0 0 6px;"><strong>${bk.itemTitle}</strong></p>
    ${datesHtml}
    <p style="margin:0;"><strong>Guests:</strong> ${bk.guests}</p>`;
  const detailsText = `Reference: ${bk.reference}\n${bk.itemTitle}\n${dates}Guests: ${bk.guests}`;

  const transporter = createTransport();
  await transporter.sendMail({
    from: FROM_CONCIERGE(),
    to: bk.guestEmail,
    subject: copy.subject,
    text: renderConciergeEmailText({ heading: copy.heading, bodyText: `${copy.intro}\n\n${detailsText}`, signoff: "With warm regards," }),
    html: renderConciergeEmailHTML({ eyebrow: copy.eyebrow, heading: copy.heading, bodyHtml: `<p style="margin:0 0 16px;">${copy.intro}</p>${detailsHtml}`, signoff: "With warm regards," }),
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  // Take back any points this journey earned — keeping them would credit a
  // member for a journey that no longer exists.
  const b = await prisma.booking.findUnique({ where: { id: params.id }, select: { customerId: true, total: true, pointsAwarded: true } });
  if (b) await reversePointsForBookings([b]);
  await prisma.booking.delete({ where: { id: params.id } });
  await logAudit(admin.email, "delete", "booking", params.id, null);
  return NextResponse.json({ ok: true });
}
