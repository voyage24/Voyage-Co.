import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const pkg = await prisma.package.findUnique({ where: { id: params.id } });
  if (!pkg) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ package: pkg });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["title", "subtitle", "duration", "image", "category", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.pricePerPerson !== undefined) update.pricePerPerson = Number(data.pricePerPerson);
  if (data.destinations !== undefined) update.destinations = data.destinations;
  if (data.highlights !== undefined) update.highlights = data.highlights;
  if (data.includes !== undefined) update.includes = data.includes;
  if (data.badge !== undefined) update.badge = data.badge || null;

  const pkg = await prisma.package.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ package: pkg });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.package.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
