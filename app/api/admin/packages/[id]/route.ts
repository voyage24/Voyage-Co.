import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ package: pkg });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["title", "subtitle", "duration", "image", "category", "published", "featured"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.pricePerPerson !== undefined) update.pricePerPerson = Number(data.pricePerPerson);
  if (data.destinations !== undefined) update.destinations = data.destinations;
  if (data.highlights !== undefined) update.highlights = data.highlights;
  if (data.includes !== undefined) update.includes = data.includes;
  if (data.badge !== undefined) update.badge = data.badge || null;
  if (data.availableUnits !== undefined) update.availableUnits = data.availableUnits === "" || data.availableUnits === null ? null : Number(data.availableUnits);

  const pkg = await prisma.package.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ package: pkg });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.package.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
