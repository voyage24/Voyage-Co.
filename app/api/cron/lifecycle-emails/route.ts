import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_NEWSLETTER } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";

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

  // Every lifecycle note goes out in the branded concierge template — the same
  // letterhead, signature and footer as the rest of our mail — rather than as a
  // bare HTML email.
  const send = async (opts: {
    to: string; subject: string; eyebrow: string; firstName: string;
    bodyHtml: string; bodyText: string; signoff: string; ctaLabel?: string; ctaHref?: string;
  }) => {
    const heading = `Dear ${opts.firstName}`;
    try {
      await transporter.sendMail({
        from, to: opts.to, subject: opts.subject,
        text: renderConciergeEmailText({ heading, bodyText: opts.bodyText, signoff: opts.signoff }),
        html: renderConciergeEmailHTML({ eyebrow: opts.eyebrow, heading, bodyHtml: opts.bodyHtml, signoff: opts.signoff, ctaLabel: opts.ctaLabel, ctaHref: opts.ctaHref }),
      });
      sent++; return true;
    } catch (err) { console.error("Lifecycle email failed:", err); return false; }
  };
  const p = (s: string) => `<p style="margin:0 0 16px;">${s}</p>`;

  // 1) Enquiry follow-up — new, unhandled, > 2 days old, not yet followed up.
  const stale = await prisma.enquiry.findMany({
    where: { stage: "new", status: "new", followupSentAt: null, createdAt: { lt: new Date(now - 2 * DAY) } },
    take: 100,
  });
  for (const e of stale) {
    const about = e.itemTitle ? ` about ${e.itemTitle}` : "";
    const ok = await send({
      to: e.email,
      subject: "A note from Voyages & Co.",
      eyebrow: "Voyages & Co. Concierge",
      firstName: e.name?.split(" ")[0] ?? "traveller",
      bodyHtml: p(`We wanted to follow up on your recent enquiry${e.itemTitle ? ` about <strong>${e.itemTitle}</strong>` : ""}. Our travel advisors would be delighted to help you plan — simply reply to this email and we&rsquo;ll take care of the rest.`),
      bodyText: `We wanted to follow up on your recent enquiry${about}. Our travel advisors would be delighted to help you plan — simply reply to this email and we'll take care of the rest.`,
      signoff: "With warm regards,",
    });
    if (ok) await prisma.enquiry.update({ where: { id: e.id }, data: { followupSentAt: new Date() } });
  }

  // 2) Pre-trip — confirmed bookings starting within 5 days.
  const upcoming = await prisma.booking.findMany({ where: { status: "confirmed", preTripSentAt: null }, take: 200 });
  for (const b of upcoming) {
    const d = parseDate(b.checkIn);
    if (!d) continue;
    const days = (d.getTime() - now) / DAY;
    if (days < 0 || days > 5) continue;
    const ok = await send({
      to: b.guestEmail,
      subject: `Getting ready for ${b.itemTitle}`,
      eyebrow: "Your Journey",
      firstName: b.guestName?.split(" ")[0] ?? "traveller",
      bodyHtml: p(`Your journey — <strong>${b.itemTitle}</strong> — is almost here. We can&rsquo;t wait to welcome you.`) + p(`If there&rsquo;s anything we can arrange before you set off, just reply to this email. Bon voyage!`),
      bodyText: `Your journey — ${b.itemTitle} — is almost here. We can't wait to welcome you.\n\nIf there's anything we can arrange before you set off, just reply to this email. Bon voyage!`,
      signoff: "With anticipation,",
      ctaLabel: "View your trip",
      ctaHref: `https://voyagesco.com/account/pass/${b.reference}`,
    });
    if (ok) await prisma.booking.update({ where: { id: b.id }, data: { preTripSentAt: new Date() } });
  }

  // 3) Post-trip — confirmed bookings that ended in the last 30 days.
  const finished = await prisma.booking.findMany({ where: { status: "confirmed", postTripSentAt: null }, take: 200 });
  for (const b of finished) {
    const d = parseDate(b.checkOut) ?? parseDate(b.checkIn);
    if (!d) continue;
    const daysSince = (now - d.getTime()) / DAY;
    if (daysSince < 1 || daysSince > 30) continue;
    const ok = await send({
      to: b.guestEmail,
      subject: "How was your journey?",
      eyebrow: "Your Journey",
      firstName: b.guestName?.split(" ")[0] ?? "traveller",
      bodyHtml: p(`We hope <strong>${b.itemTitle}</strong> was everything you dreamed of. We&rsquo;d love to hear about it — your reflections help fellow travellers and mean the world to us.`),
      bodyText: `We hope ${b.itemTitle} was everything you dreamed of. We'd love to hear about it — your reflections help fellow travellers and mean the world to us.`,
      signoff: "Until the next adventure,",
      ctaLabel: "Revisit your journey & share a review",
      ctaHref: `https://voyagesco.com/account/journey/${b.reference}`,
    });
    if (ok) await prisma.booking.update({ where: { id: b.id }, data: { postTripSentAt: new Date() } });
  }

  return NextResponse.json({ ok: true, sent });
}
