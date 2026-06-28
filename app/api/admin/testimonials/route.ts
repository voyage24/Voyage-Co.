import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ testimonials });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();

  if (!data.quote || !data.author) {
    return NextResponse.json({ error: "Quote and author are required" }, { status: 400 });
  }

  const testimonial = await prisma.testimonial.create({
    data: {
      quote: data.quote,
      author: data.author,
      detail: data.detail || null,
      image: data.image || null,
      rating: Number(data.rating) || 5,
      sortOrder: Number(data.sortOrder) || 0,
      published: data.published ?? true,
    },
  });

  return NextResponse.json({ testimonial }, { status: 201 });
}
