import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToAdmins } from "@/lib/push";

export const dynamic = "force-dynamic";

// Daily reminder: push the admins about follow-up tasks that are due today or
// overdue and haven't been reminded yet. Marks them reminded so it fires once.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authed = req.headers.get("authorization") === `Bearer ${secret}` || req.nextUrl.searchParams.get("key") === secret;
  if (secret && !authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const endOfToday = new Date(new Date().toDateString());
  endOfToday.setDate(endOfToday.getDate() + 1);

  const due = await prisma.followUp.findMany({
    where: { done: false, dueAt: { lt: endOfToday }, remindedAt: null },
    orderBy: { dueAt: "asc" },
  });
  if (due.length === 0) return NextResponse.json({ ok: true, reminded: 0 });

  const first = due[0];
  const body = due.length === 1 ? first.title : `${first.title} + ${due.length - 1} more`;
  await sendPushToAdmins({ title: `⏰ ${due.length} follow-up${due.length > 1 ? "s" : ""} due`, body, url: "/admin" }).catch(() => {});

  await prisma.followUp.updateMany({ where: { id: { in: due.map(d => d.id) } }, data: { remindedAt: new Date() } });
  return NextResponse.json({ ok: true, reminded: due.length });
}
