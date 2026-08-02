import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const cab = await prisma.airportCab.findUnique({ where: { id: params.id } });
  if (!cab) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ cab });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["title", "city", "vehicleType", "capacity", "category", "image", "description", "published", "featured", "priceOnRequest", "faqs"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.price !== undefined) update.price = Number(data.price);
  if (data.includes !== undefined) update.includes = data.includes;
  if (data.badge !== undefined) update.badge = data.badge || null;
  if (data.availableUnits !== undefined) update.availableUnits = data.availableUnits === "" || data.availableUnits === null ? null : Number(data.availableUnits);

  const cab = await prisma.airportCab.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ cab });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.airportCab.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
