import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const d = await req.json();
  const update: Record<string, unknown> = {};
  for (const k of ["title", "description", "image"]) if (d[k] !== undefined) update[k] = d[k];
  for (const k of ["badge", "href"]) if (d[k] !== undefined) update[k] = d[k] || null;
  if (d.memberOnly !== undefined) update.memberOnly = !!d.memberOnly;
  if (d.published !== undefined) update.published = !!d.published;
  if (d.sortOrder !== undefined) update.sortOrder = Number(d.sortOrder) || 0;
  await prisma.offer.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.offer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
