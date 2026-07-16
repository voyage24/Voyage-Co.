import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";

export const dynamic = "force-dynamic";

// Correct the visit counters to a known figure.
//
// Deliberately has no delete: visits are only ever counted up and are never
// stored per-visitor, so once a total is lost there is nothing to rebuild it
// from. Nothing in the admin deletes them any more — this only ever *sets* a
// value, so a figure can be restored (e.g. from a screenshot) but never wiped.
const KEYS = { total: "visits", mobile: "visits:mobile", desktop: "visits:desktop" } as const;

export async function POST(req: NextRequest) {
  const admin = await requireOwner(req);
  if (admin instanceof NextResponse) return admin;

  const body = await req.json().catch(() => ({}));
  const updates: { key: string; count: number; label: string }[] = [];
  for (const [field, key] of Object.entries(KEYS)) {
    const raw = body?.[field];
    if (raw === undefined || raw === null || raw === "") continue;
    const n = Math.round(Number(raw));
    if (!Number.isFinite(n) || n < 0) return NextResponse.json({ error: `${field}: enter a number of 0 or more` }, { status: 400 });
    updates.push({ key, count: n, label: field });
  }
  if (!updates.length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  await prisma.$transaction(
    updates.map(u => prisma.siteStat.upsert({ where: { key: u.key }, update: { count: u.count }, create: { key: u.key, count: u.count } })),
  );
  await logAudit(admin.email, "update", "analytics", null, `Set visit counters — ${updates.map(u => `${u.label}=${u.count}`).join(", ")}`);

  return NextResponse.json({ ok: true, updated: updates.map(u => ({ [u.label]: u.count })) });
}
