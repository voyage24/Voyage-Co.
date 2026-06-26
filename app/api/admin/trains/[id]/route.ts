import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const train = await prisma.train.findUnique({ where: { id: params.id } });
  if (!train) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ train });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json();
  const update: Record<string, unknown> = {};

  for (const key of ["name", "number", "origin", "originCity", "destination", "destinationCity", "departure", "arrival", "duration", "published"]) {
    if (data[key] !== undefined) update[key] = data[key];
  }
  if (data.classes !== undefined) update.classes = data.classes;
  if (data.runsDays !== undefined) update.runsDays = data.runsDays;

  const train = await prisma.train.update({ where: { id: params.id }, data: update });
  return NextResponse.json({ train });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.train.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
