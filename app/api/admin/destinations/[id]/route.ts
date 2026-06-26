import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const destination = await prisma.featuredDestination.findUnique({ where: { id: params.id } });
  if (!destination) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ destination });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["name", "tagline", "country", "image", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  for (const key of ["hotelCount", "sortOrder"]) {
    if (data[key] !== undefined) update[key] = Number(data[key]);
  }

  const destination = await prisma.featuredDestination.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ destination });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.featuredDestination.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
