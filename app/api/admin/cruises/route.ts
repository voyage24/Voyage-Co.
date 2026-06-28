import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const cruises = await prisma.cruise.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ cruises });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  if (!data.name || !data.cruiseLine || !data.ship) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(data.name, async slug => !!(await prisma.cruise.findUnique({ where: { id: slug } })));

  const cruise = await prisma.cruise.create({
    data: {
      id,
      name: data.name,
      cruiseLine: data.cruiseLine,
      ship: data.ship,
      region: data.region ?? "",
      departurePort: data.departurePort ?? "",
      ports: data.ports ?? [],
      duration: data.duration ?? "",
      pricePerPerson: Number(data.pricePerPerson) || 0,
      image: data.image ?? "",
      category: data.category ?? "",
      amenities: data.amenities ?? [],
      highlights: data.highlights ?? [],
      includes: data.includes ?? [],
      description: data.description ?? "",
      rating: Number(data.rating) || 0,
      reviewCount: Number(data.reviewCount) || 0,
      badge: data.badge || null,
      published: data.published ?? true,
      availableUnits: data.availableUnits === "" || data.availableUnits == null ? null : Number(data.availableUnits),
      priceOnRequest: !!data.priceOnRequest,
    },
  });

  return NextResponse.json({ cruise }, { status: 201 });
}
