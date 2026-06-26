import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { uniqueSlug } from "@/lib/utils/slugify";

export async function GET() {
  const packages = await prisma.package.findMany({ orderBy: { updatedAt: "desc" } });
  return NextResponse.json({ packages });
}

export async function POST(req: NextRequest) {
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
    },
  });

  return NextResponse.json({ package: pkg }, { status: 201 });
}
