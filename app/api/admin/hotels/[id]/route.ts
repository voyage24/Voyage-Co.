import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const hotel = await prisma.hotel.findUnique({ where: { id: params.id } });
  if (!hotel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ hotel });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  const update: Record<string, unknown> = {};
  for (const key of [
    "name", "location", "city", "country", "region", "image", "category",
    "amenities", "highlights", "description", "badge", "brand", "officialSite", "published",
  ]) {
    if (data[key] !== undefined) update[key] = data[key] || (key === "badge" || key === "brand" || key === "officialSite" ? null : data[key]);
  }
  for (const key of ["stars", "reviewCount", "pricePerNight"]) {
    if (data[key] !== undefined) update[key] = Number(data[key]);
  }
  if (data.rating !== undefined) update.rating = Number(data.rating);
  if (data.images !== undefined) update.images = data.images;
  if (data.lat !== undefined) update.lat = data.lat === "" || data.lat === null ? null : Number(data.lat);
  if (data.lng !== undefined) update.lng = data.lng === "" || data.lng === null ? null : Number(data.lng);
  if (data.priceOnRequest !== undefined) update.priceOnRequest = !!data.priceOnRequest;

  const hotel = await prisma.hotel.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ hotel });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.hotel.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
