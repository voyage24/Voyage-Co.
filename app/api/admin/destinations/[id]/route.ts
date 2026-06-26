import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const destination = await prisma.featuredDestination.findUnique({ where: { id: params.id } });
  if (!destination) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ destination });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.featuredDestination.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
