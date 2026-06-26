import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const flight = await prisma.flight.findUnique({ where: { id: params.id } });
  if (!flight) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ flight });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["origin", "originCity", "destination", "destinationCity", "airline", "airlineCode", "flightNumber", "departure", "arrival", "duration", "currency", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  for (const key of ["stops", "price"]) {
    if (data[key] !== undefined) update[key] = Number(data[key]);
  }
  if (data.businessPrice !== undefined) update.businessPrice = data.businessPrice === "" || data.businessPrice === null ? null : Number(data.businessPrice);
  if (data.amenities !== undefined) update.amenities = data.amenities;

  const flight = await prisma.flight.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ flight });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  await prisma.flight.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
