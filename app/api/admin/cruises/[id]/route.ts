import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const cruise = await prisma.cruise.findUnique({ where: { id: params.id } });
  if (!cruise) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ cruise });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["name", "cruiseLine", "ship", "region", "departurePort", "duration", "image", "category", "description", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  for (const key of ["pricePerPerson", "reviewCount"]) {
    if (data[key] !== undefined) update[key] = Number(data[key]);
  }
  if (data.rating !== undefined) update.rating = Number(data.rating);
  if (data.ports !== undefined) update.ports = data.ports;
  if (data.amenities !== undefined) update.amenities = data.amenities;
  if (data.highlights !== undefined) update.highlights = data.highlights;
  if (data.includes !== undefined) update.includes = data.includes;
  if (data.badge !== undefined) update.badge = data.badge || null;
  if (data.availableUnits !== undefined) update.availableUnits = data.availableUnits === "" || data.availableUnits === null ? null : Number(data.availableUnits);

  const cruise = await prisma.cruise.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ cruise });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.cruise.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
