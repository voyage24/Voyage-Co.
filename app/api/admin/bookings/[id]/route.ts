import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const STATUSES = ["pending", "confirmed", "cancelled"];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { status, documents } = await req.json().catch(() => ({}));
  const data: { status?: string; documents?: { label: string; url: string }[] } = {};
  if (status !== undefined) {
    if (!STATUSES.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = status;
  }
  if (documents !== undefined && Array.isArray(documents)) {
    data.documents = documents
      .filter((d: { label?: string; url?: string }) => d?.url)
      .map((d: { label?: string; url?: string }) => ({ label: String(d.label || "Document"), url: String(d.url) }))
      .slice(0, 20);
  }
  await prisma.booking.update({ where: { id: params.id }, data });

  // Award loyalty points once, when a booking is first confirmed (1 point per
  // ₹1,000 of value), and bump tier at thresholds.
  if (status === "confirmed") {
    const b = await prisma.booking.findUnique({ where: { id: params.id }, select: { customerId: true, total: true, pointsAwarded: true } });
    if (b?.customerId && !b.pointsAwarded) {
      const pts = Math.floor((b.total || 0) / 1000);
      await prisma.$transaction([
        prisma.customer.update({ where: { id: b.customerId }, data: { points: { increment: pts } } }),
        prisma.booking.update({ where: { id: params.id }, data: { pointsAwarded: true } }),
      ]);
      const c = await prisma.customer.findUnique({ where: { id: b.customerId }, select: { points: true, tier: true } });
      if (c) {
        const tier = c.points >= 5000 ? "gold" : c.points >= 1500 ? "silver" : "member";
        if (tier !== c.tier) await prisma.customer.update({ where: { id: b.customerId }, data: { tier } });
      }
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.booking.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
