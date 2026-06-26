import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const destinations = await prisma.featuredDestination.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ destinations });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  if (!data.name || !data.country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const destination = await prisma.featuredDestination.create({
    data: {
      name: data.name,
      tagline: data.tagline ?? "",
      country: data.country,
      image: data.image ?? "",
      hotelCount: Number(data.hotelCount) || 0,
      sortOrder: Number(data.sortOrder) || 0,
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ destination }, { status: 201 });
}
