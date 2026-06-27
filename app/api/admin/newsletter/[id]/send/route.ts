import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { createTransport, FROM_NEWSLETTER } from "@/lib/email/transport";
import { unsubscribeUrl } from "@/lib/newsletter/unsubscribe";
import { UNSUBSCRIBE_PLACEHOLDER } from "@/lib/newsletter/compose";

export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const draft = await prisma.newsletter.findUnique({ where: { id: params.id } });
  if (!draft) return NextResponse.json({ error: "Newsletter not found" }, { status: 404 });
  if (draft.status === "sent") {
    return NextResponse.json({ error: "This issue has already been sent" }, { status: 400 });
  }

  const subscribers = await prisma.newsletterSubscriber.findMany();
  if (subscribers.length === 0) {
    return NextResponse.json({ error: "No subscribers yet" }, { status: 400 });
  }

  const transporter = createTransport();
  let sent = 0;
  const BATCH = 5; // small concurrency to stay within SMTP rate limits

  for (let i = 0; i < subscribers.length; i += BATCH) {
    const batch = subscribers.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(sub => {
        const html = draft.html.split(UNSUBSCRIBE_PLACEHOLDER).join(unsubscribeUrl(sub.email));
        return transporter.sendMail({
          from: FROM_NEWSLETTER(),
          to: sub.email,
          subject: draft.subject,
          html,
        });
      })
    );
    sent += results.filter(r => r.status === "fulfilled").length;
  }

  await prisma.newsletter.update({
    where: { id: draft.id },
    data: { status: "sent", sentAt: new Date(), recipientCount: sent },
  });

  return NextResponse.json({ ok: true, sent, total: subscribers.length });
}
