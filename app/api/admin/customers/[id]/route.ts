import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { tier } = await req.json().catch(() => ({}));
  if (!["member", "silver", "gold"].includes(tier)) {
    return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
  }
  await prisma.customer.update({ where: { id: params.id }, data: { tier } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  // Bookings keep their guest details (customerId is set null on delete).
  await prisma.customer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
