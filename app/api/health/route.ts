import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Lightweight keep-warm / health endpoint. Runs the cheapest possible query
// so the (auto-suspending) database stays awake when pinged on a schedule by
// a free external cron (e.g. cron-job.org / UptimeRobot) every few minutes —
// avoiding the cold-start delay on the first real visit. Safe to call
// publicly: it only does SELECT 1 and returns no data.
export async function GET() {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, ms: Date.now() - start });
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
