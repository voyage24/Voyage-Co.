import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToCustomer } from "@/lib/push";
import { applyPoints, pointsFor, journeyEnded } from "@/lib/loyalty";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Grants loyalty points once a journey has actually been travelled — never at
// booking or confirmation — so a balance only ever reflects completed journeys.
// `pointsAwarded` guards against granting twice. Runs from the daily fan-out.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authed = req.headers.get("authorization") === `Bearer ${secret}` || req.nextUrl.searchParams.get("key") === secret;
  if (secret && !authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const candidates = await prisma.booking.findMany({
    where: { status: "confirmed", pointsAwarded: false, customerId: { not: null } },
    select: { id: true, customerId: true, total: true, checkIn: true, checkOut: true, itemTitle: true },
    take: 300,
  });

  let awarded = 0, points = 0;
  for (const b of candidates) {
    if (!journeyEnded(b.checkIn, b.checkOut)) continue;
    const pts = pointsFor(b.total);
    // Still mark it settled when a journey earns nothing, so it isn't re-checked daily.
    await prisma.booking.update({ where: { id: b.id }, data: { pointsAwarded: true } });
    if (pts <= 0) continue;
    const res = await applyPoints(b.customerId!, pts).catch(() => null);
    if (!res) continue;
    awarded++; points += pts;
    await sendPushToCustomer(b.customerId!, {
      title: `✦ ${pts.toLocaleString("en-IN")} points earned`,
      body: `Welcome home — your journey to ${b.itemTitle} has earned you ${pts.toLocaleString("en-IN")} points.`,
      url: "/membership",
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true, awarded, points });
}
