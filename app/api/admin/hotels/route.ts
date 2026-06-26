import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";

export async function GET() {
  const hotels = await prisma.hotel.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ hotels });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.name || !data.city || !data.country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(data.name, async slug => !!(await prisma.hotel.findUnique({ where: { id: slug } })));

  const hotel = await prisma.hotel.create({
    data: {
      id,
      name: data.name,
      location: data.location ?? "",
      city: data.city,
      country: data.country,
      region: data.region ?? "",
      stars: Number(data.stars) || 0,
      rating: Number(data.rating) || 0,
      reviewCount: Number(data.reviewCount) || 0,
      pricePerNight: Number(data.pricePerNight) || 0,
      image: data.image ?? "",
      images: data.images ?? [],
      category: data.category ?? "",
      amenities: data.amenities ?? [],
      highlights: data.highlights ?? [],
      description: data.description ?? "",
      badge: data.badge || null,
      brand: data.brand || null,
      lat: data.lat ? Number(data.lat) : null,
      lng: data.lng ? Number(data.lng) : null,
      officialSite: data.officialSite || null,
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ hotel }, { status: 201 });
}
