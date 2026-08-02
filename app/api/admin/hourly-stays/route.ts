import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const stays = await prisma.hourlyStay.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ stays });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  if (!data.title || !data.city) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(data.title, async slug => !!(await prisma.hourlyStay.findUnique({ where: { id: slug } })));

  const stay = await prisma.hourlyStay.create({
    data: {
      id,
      title: data.title,
      city: data.city,
      location: data.location ?? "",
      hours: Number(data.hours) || 3,
      amenities: data.amenities ?? [],
      category: data.category ?? "",
      price: Number(data.price) || 0,
      image: data.image ?? "",
      description: data.description ?? "",
      badge: data.badge || null,
      rating: data.rating === "" || data.rating == null ? null : Number(data.rating),
      published: data.published ?? true,
      featured: data.featured ?? false,
      availableUnits: data.availableUnits === "" || data.availableUnits == null ? null : Number(data.availableUnits),
      priceOnRequest: !!data.priceOnRequest,
      faqs: data.faqs ?? undefined,
    },
  });

  return NextResponse.json({ stay }, { status: 201 });
}
