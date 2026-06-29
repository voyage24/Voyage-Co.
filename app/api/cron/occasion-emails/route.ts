import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Daily: emails customers a warm note + gentle offer on their birthday or
// anniversary. occasionSentYear de-dupes so each customer gets at most one
// occasion email per calendar year.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const md = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const year = now.getFullYear();

  const customers = await prisma.customer.findMany({
    where: { OR: [{ birthday: { endsWith: md } }, { anniversary: { endsWith: md } }], NOT: { occasionSentYear: year } },
    select: { id: true, email: true, name: true, birthday: true, anniversary: true },
  });

  const transporter = createTransport();
  let sent = 0;
  for (const c of customers) {
    const isBirthday = c.birthday?.endsWith(md);
    const occasion = isBirthday ? "birthday" : "anniversary";
    try {
      await transporter.sendMail({
        from: FROM_CONCIERGE(),
        to: c.email,
        subject: isBirthday ? "Happy birthday from Voyages & Co." : "Happy anniversary from Voyages & Co.",
        html: `<p>Dear ${c.name?.split(" ")[0] ?? "traveller"},</p>
          <p>Wishing you a wonderful ${occasion}. To mark the occasion, we'd love to help you plan something memorable — reply to this note and our concierge will craft a few ideas, with a little something extra on us.</p>
          <p>With warm wishes,<br/>Voyages &amp; Co.</p>`,
      });
      await prisma.customer.update({ where: { id: c.id }, data: { occasionSentYear: year } });
      sent++;
    } catch (err) { console.error("Occasion email failed:", err); }
  }

  return NextResponse.json({ ok: true, candidates: customers.length, sent });
}
