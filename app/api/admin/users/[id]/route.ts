import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  if (params.id === admin.id) return NextResponse.json({ error: "You can't remove your own account" }, { status: 400 });
  const count = await prisma.adminUser.count();
  if (count <= 1) return NextResponse.json({ error: "Can't remove the last admin" }, { status: 400 });
  await prisma.adminUser.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
