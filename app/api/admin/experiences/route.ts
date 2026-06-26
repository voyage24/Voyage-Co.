import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";

export async function GET() {
  const experiences = await prisma.experience.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ experiences });
}

export async function POST(req: NextRequest) {
  const data = await req.json();

  if (!data.title || !data.location || !data.country) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(data.title, async slug => !!(await prisma.experience.findUnique({ where: { id: slug } })));

  const experience = await prisma.experience.create({
    data: {
      id,
      title: data.title,
      location: data.location,
      country: data.country,
      duration: data.duration ?? "",
      price: Number(data.price) || 0,
      category: data.category ?? "",
      image: data.image ?? "",
      description: data.description ?? "",
      includes: data.includes ?? [],
      badge: data.badge || null,
      lat: data.lat ? Number(data.lat) : null,
      lng: data.lng ? Number(data.lng) : null,
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ experience }, { status: 201 });
}
