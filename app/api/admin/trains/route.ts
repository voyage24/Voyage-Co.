import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";

export async function GET() {
  const trains = await prisma.train.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ trains });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.name || !data.origin || !data.destination) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(data.name, async slug => !!(await prisma.train.findUnique({ where: { id: slug } })));

  const train = await prisma.train.create({
    data: {
      id,
      name: data.name,
      number: data.number ?? "",
      origin: data.origin,
      originCity: data.originCity ?? "",
      destination: data.destination,
      destinationCity: data.destinationCity ?? "",
      departure: data.departure ?? "",
      arrival: data.arrival ?? "",
      duration: data.duration ?? "",
      classes: data.classes ?? [],
      runsDays: data.runsDays ?? [],
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ train }, { status: 201 });
}
