import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { status } = await req.json().catch(() => ({}));
  if (status !== "new" && status !== "handled") {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }
  await prisma.enquiry.update({ where: { id: params.id }, data: { status } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await prisma.enquiry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
