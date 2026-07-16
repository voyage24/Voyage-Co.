import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireOwner } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { reversePointsForBookings } from "@/lib/loyalty";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Delete every booking — the records revenue, pipeline, top journeys and the
// bookings-per-day graph are all derived from, so those figures reset with them.
// Intended for clearing trial data. Owner-only and irreversible.
//
// Any loyalty points those journeys had earned are taken back first: a member
// shouldn't keep points for journeys that no longer exist.
export async function POST(req: NextRequest) {
  const admin = await requireOwner(req);
  if (admin instanceof NextResponse) return admin;

  const { confirm } = await req.json().catch(() => ({}));
  if (String(confirm || "").trim().toUpperCase() !== "DELETE") {
    return NextResponse.json({ error: 'Type "DELETE" to confirm.' }, { status: 400 });
  }

  const bookings = await prisma.booking.findMany({ select: { customerId: true, total: true, pointsAwarded: true, status: true } });
  const revenue = bookings.filter(b => b.status === "confirmed").reduce((s, b) => s + (b.total || 0), 0);
  const membersAdjusted = await reversePointsForBookings(bookings);

  const { count } = await prisma.booking.deleteMany({});
  await logAudit(admin.email, "purge", "bookings", null, `Deleted all ${count} bookings (₹${revenue.toLocaleString("en-IN")} confirmed revenue); points reversed for ${membersAdjusted} member(s)`);

  return NextResponse.json({ ok: true, deleted: count, revenue, membersAdjusted });
}
