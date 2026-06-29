import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};
  for (const k of ["caption", "handle", "link"]) if (data[k] !== undefined) update[k] = data[k] || null;
  if (data.sortOrder !== undefined) update.sortOrder = Number(data.sortOrder) || 0;
  if (data.published !== undefined) update.published = !!data.published;
  await prisma.moment.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.moment.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
