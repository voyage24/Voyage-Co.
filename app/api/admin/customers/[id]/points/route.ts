import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { applyPoints } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

// Manually credit or deduct a member's loyalty points — a goodwill gesture, or
// correcting a mistake. Points normally come only from completed journeys, so
// every manual adjustment is audit-logged with its reason. The tier re-grades
// itself and a balance can't go negative.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { delta, reason } = await req.json().catch(() => ({}));
  const d = Math.round(Number(delta));
  if (!Number.isFinite(d) || d === 0) return NextResponse.json({ error: "Enter a non-zero amount" }, { status: 400 });

  const customer = await prisma.customer.findUnique({ where: { id: params.id }, select: { id: true, email: true, points: true } });
  if (!customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const res = await applyPoints(customer.id, d);
  if (!res) return NextResponse.json({ error: "Could not adjust points" }, { status: 500 });

  const why = typeof reason === "string" && reason.trim() ? ` — ${reason.trim().slice(0, 160)}` : "";
  await logAudit(admin.email, "points", "customer", customer.id, `${d > 0 ? "+" : ""}${d} points${why} (${customer.points} → ${res.points}) for ${customer.email}`);

  return NextResponse.json({ ok: true, points: res.points, tier: res.tier });
}
