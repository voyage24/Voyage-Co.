import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const stay = await prisma.hourlyStay.findUnique({ where: { id: params.id } });
  if (!stay) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ stay });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["title", "city", "location", "category", "image", "description", "published", "featured", "priceOnRequest", "faqs"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.price !== undefined) update.price = Number(data.price);
  if (data.hours !== undefined) update.hours = Number(data.hours);
  if (data.amenities !== undefined) update.amenities = data.amenities;
  if (data.badge !== undefined) update.badge = data.badge || null;
  if (data.rating !== undefined) update.rating = data.rating === "" || data.rating === null ? null : Number(data.rating);
  if (data.availableUnits !== undefined) update.availableUnits = data.availableUnits === "" || data.availableUnits === null ? null : Number(data.availableUnits);

  const stay = await prisma.hourlyStay.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ stay });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.hourlyStay.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
