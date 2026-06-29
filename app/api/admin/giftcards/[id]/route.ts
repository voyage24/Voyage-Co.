import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { status, balance } = await req.json().catch(() => ({}));
  const data: { status?: string; balance?: number } = {};
  if (status !== undefined) {
    if (!["active", "redeemed", "void"].includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = status;
  }
  if (balance !== undefined) data.balance = Math.max(0, Number(balance) || 0);
  await prisma.giftCard.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.giftCard.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
