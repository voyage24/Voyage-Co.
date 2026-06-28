import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const packages = await prisma.package.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ packages });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  if (!data.title || !data.subtitle) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const id = await uniqueSlug(data.title, async slug => !!(await prisma.package.findUnique({ where: { id: slug } })));

  const pkg = await prisma.package.create({
    data: {
      id,
      title: data.title,
      subtitle: data.subtitle,
      destinations: data.destinations ?? [],
      duration: data.duration ?? "",
      pricePerPerson: Number(data.pricePerPerson) || 0,
      image: data.image ?? "",
      highlights: data.highlights ?? [],
      includes: data.includes ?? [],
      category: data.category ?? "",
      badge: data.badge || null,
      published: data.published ?? true,
      featured: data.featured ?? false,
      availableUnits: data.availableUnits === "" || data.availableUnits == null ? null : Number(data.availableUnits),
      priceOnRequest: !!data.priceOnRequest,
    },
  });

  return NextResponse.json({ package: pkg }, { status: 201 });
}
