import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { status, stage, notes } = await req.json().catch(() => ({}));
  const data: { status?: string; stage?: string; notes?: string | null } = {};
  if (status !== undefined) {
    if (status !== "new" && status !== "handled") return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    data.status = status;
  }
  if (stage !== undefined) {
    if (!["new", "contacted", "quoted", "won", "lost"].includes(stage)) return NextResponse.json({ error: "Invalid stage" }, { status: 400 });
    data.stage = stage;
  }
  if (notes !== undefined) data.notes = notes || null;
  await prisma.enquiry.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  await prisma.enquiry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
