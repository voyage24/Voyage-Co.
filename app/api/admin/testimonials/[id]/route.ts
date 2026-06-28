import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const testimonial = await prisma.testimonial.findUnique({ where: { id: params.id } });
  if (!testimonial) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ testimonial });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["quote", "author", "detail", "image", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  for (const key of ["rating", "sortOrder"]) {
    if (data[key] !== undefined) update[key] = Number(data[key]);
  }

  const testimonial = await prisma.testimonial.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ testimonial });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.testimonial.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
