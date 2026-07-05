import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { COLLECTION_BY_TYPE } from "@/lib/collections";

export async function PUT(req: NextRequest, { params }: { params: { type: string; id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const def = COLLECTION_BY_TYPE.get(params.type);
  if (!def) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const patch: { data?: Record<string, string>; published?: boolean; sortOrder?: number } = {};
  if (body?.data && typeof body.data === "object") {
    const data: Record<string, string> = {};
    for (const f of def.fields) data[f.key] = String(body.data[f.key] ?? "");
    patch.data = data;
  }
  if (typeof body?.published === "boolean") patch.published = body.published;
  if (body?.sortOrder != null) patch.sortOrder = Number(body.sortOrder) || 0;

  const item = await prisma.collection.update({ where: { id: params.id }, data: patch });
  return NextResponse.json({ item });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.collection.delete({ where: { id: params.id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
