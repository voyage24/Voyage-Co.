import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

type Line = { label: string; amount: number };

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  const update: Record<string, unknown> = {};
  for (const key of ["customerName", "customerEmail", "title", "status", "validUntil", "notes"]) {
    if (data[key] !== undefined) update[key] = data[key] || (key === "notes" || key === "validUntil" ? null : data[key]);
  }
  if (data.lineItems !== undefined) {
    const lineItems: Line[] = (Array.isArray(data.lineItems) ? data.lineItems : [])
      .filter((l: Line) => l?.label).map((l: Line) => ({ label: String(l.label), amount: Number(l.amount) || 0 }));
    update.lineItems = lineItems;
    update.total = lineItems.reduce((s, l) => s + l.amount, 0);
  }

  const quote = await prisma.quote.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ quote });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.quote.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
