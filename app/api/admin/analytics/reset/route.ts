import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

// Reset the stored visit counters — the grand total, the mobile/desktop split
// and every per-day bucket. Everything else on Analytics is derived live from
// bookings/enquiries, so there is nothing else here to clear.
//
// Owner-only and irreversible: these counters are only ever incremented, so
// there is no history to rebuild them from. The grand total also feeds the
// public homepage "Site visits" figure, which will drop to zero.
export async function POST(req: NextRequest) {
  const admin = await requireOwner(req);
  if (admin instanceof NextResponse) return admin;

  const { confirm } = await req.json().catch(() => ({}));
  if (String(confirm || "").trim().toUpperCase() !== "RESET") {
    return NextResponse.json({ error: 'Type "RESET" to confirm.' }, { status: 400 });
  }

  const before = (await prisma.siteStat.findUnique({ where: { key: "visits" } }).catch(() => null))?.count ?? 0;
  const [days, stats] = await prisma.$transaction([
    prisma.dailyVisit.deleteMany({}),
    prisma.siteStat.deleteMany({ where: { key: { startsWith: "visits" } } }),
  ]);

  await logAudit(admin.email, "reset", "analytics", null, `Reset visit counters — was ${before} visits across ${days.count} day buckets (${stats.count} counters cleared)`);
  return NextResponse.json({ ok: true, cleared: { visits: before, days: days.count, counters: stats.count } });
}
