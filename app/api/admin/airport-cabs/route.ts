import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const cabs = await prisma.airportCab.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ cabs });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  if (!data.title || !data.city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(data.title, async slug => !!(await prisma.airportCab.findUnique({ where: { id: slug } })));

  const cab = await prisma.airportCab.create({
    data: {
      id,
      title: data.title,
      city: data.city,
      vehicleType: data.vehicleType ?? "",
      capacity: data.capacity ?? "",
      includes: data.includes ?? [],
      category: data.category ?? "",
      price: Number(data.price) || 0,
      image: data.image ?? "",
      description: data.description ?? "",
      badge: data.badge || null,
      published: data.published ?? true,
      featured: data.featured ?? false,
      availableUnits: data.availableUnits === "" || data.availableUnits == null ? null : Number(data.availableUnits),
      priceOnRequest: !!data.priceOnRequest,
      faqs: data.faqs ?? undefined,
    },
  });

  return NextResponse.json({ cab }, { status: 201 });
}
