import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const experiences = await prisma.experience.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ experiences });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
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
      availableUnits: data.availableUnits === "" || data.availableUnits == null ? null : Number(data.availableUnits),
      priceOnRequest: !!data.priceOnRequest,
    },
  });

  return NextResponse.json({ experience }, { status: 201 });
}
