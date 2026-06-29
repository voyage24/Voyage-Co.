import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_NEWSLETTER } from "@/lib/email/transport";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;
const parseDate = (s: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
};

// Daily lifecycle emails: a gentle follow-up on stale new enquiries, a
// pre-trip "get ready" note, and a post-trip review request. Each marker
// field guards against re-sending.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const transporter = createTransport();
  const from = FROM_NEWSLETTER();
  const now = Date.now();
  let sent = 0;
  const send = async (to: string, subject: string, html: string) => {
    try { await transporter.sendMail({ from, to, subject, html }); sent++; return true; }
    catch (err) { console.error("Lifecycle email failed:", err); return false; }
  };

  // 1) Enquiry follow-up — new, unhandled, > 2 days old, not yet followed up.
  const stale = await prisma.enquiry.findMany({
    where: { stage: "new", status: "new", followupSentAt: null, createdAt: { lt: new Date(now - 2 * DAY) } },
    take: 100,
  });
  for (const e of stale) {
    const ok = await send(e.email, "A note from Voyages & Co.", `
      <p>Dear ${e.name?.split(" ")[0] ?? "traveller"},</p>
      <p>We wanted to follow up on your recent enquiry${e.itemTitle ? ` about <strong>${e.itemTitle}</strong>` : ""}. Our travel advisors would be delighted to help you plan — simply reply to this email and we'll take care of the rest.</p>
      <p>Warm regards,<br/>Voyages &amp; Co.</p>`);
    if (ok) await prisma.enquiry.update({ where: { id: e.id }, data: { followupSentAt: new Date() } });
  }

  // 2) Pre-trip — confirmed bookings starting within 5 days.
  const upcoming = await prisma.booking.findMany({ where: { status: "confirmed", preTripSentAt: null }, take: 200 });
  for (const b of upcoming) {
    const d = parseDate(b.checkIn);
    if (!d) continue;
    const days = (d.getTime() - now) / DAY;
    if (days < 0 || days > 5) continue;
    const ok = await send(b.guestEmail, `Getting ready for ${b.itemTitle}`, `
      <p>Dear ${b.guestName?.split(" ")[0] ?? "traveller"},</p>
      <p>Your journey — <strong>${b.itemTitle}</strong> — is almost here. We can't wait to welcome you.</p>
      <p>If there's anything we can arrange before you set off, just reply to this email. Bon voyage!</p>
      <p>Voyages &amp; Co.</p>`);
    if (ok) await prisma.booking.update({ where: { id: b.id }, data: { preTripSentAt: new Date() } });
  }

  // 3) Post-trip — confirmed bookings that ended in the last 30 days.
  const finished = await prisma.booking.findMany({ where: { status: "confirmed", postTripSentAt: null }, take: 200 });
  for (const b of finished) {
    const d = parseDate(b.checkOut) ?? parseDate(b.checkIn);
    if (!d) continue;
    const daysSince = (now - d.getTime()) / DAY;
    if (daysSince < 1 || daysSince > 30) continue;
    const ok = await send(b.guestEmail, "How was your journey?", `
      <p>Dear ${b.guestName?.split(" ")[0] ?? "traveller"},</p>
      <p>We hope <strong>${b.itemTitle}</strong> was everything you dreamed of. We'd love to hear about it — your reflections help fellow travellers and mean the world to us.</p>
      <p><a href="https://voyagesco.com/account/journey/${b.reference}">Revisit your journey &amp; share a review &rarr;</a></p>
      <p>Until the next adventure,<br/>Voyages &amp; Co.</p>`);
    if (ok) await prisma.booking.update({ where: { id: b.id }, data: { postTripSentAt: new Date() } });
  }

  return NextResponse.json({ ok: true, sent });
}
