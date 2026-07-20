import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Health check — a plain ping confirms the app is serving and DELIBERATELY does
// NOT touch the database.
//
// This route used to run `SELECT 1` on every hit so a scheduled cron would keep
// the (free-tier, auto-suspending) Neon database warm. But keeping it awake
// around the clock burns the whole monthly compute allowance and takes the
// database offline — which is exactly what happened. So a scheduled ping must
// never wake the database; leave it to sleep when idle.
//
// Pass ?db=1 to actually probe the database — for manual diagnostics only. Do
// NOT put ?db=1 on a schedule, or you're back to keeping it warm.
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("db") !== "1") {
    return NextResponse.json({ ok: true });
  }

  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: true, ms: Date.now() - start });
  } catch {
    return NextResponse.json({ ok: false, db: false, ms: Date.now() - start }, { status: 503 });
  }
}
