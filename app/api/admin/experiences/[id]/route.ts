import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const experience = await prisma.experience.findUnique({ where: { id: params.id } });
  if (!experience) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ experience });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["title", "location", "country", "duration", "category", "image", "description", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.price !== undefined) update.price = Number(data.price);
  if (data.includes !== undefined) update.includes = data.includes;
  if (data.badge !== undefined) update.badge = data.badge || null;
  if (data.lat !== undefined) update.lat = data.lat === "" || data.lat === null ? null : Number(data.lat);
  if (data.lng !== undefined) update.lng = data.lng === "" || data.lng === null ? null : Number(data.lng);

  const experience = await prisma.experience.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ experience });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.experience.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
