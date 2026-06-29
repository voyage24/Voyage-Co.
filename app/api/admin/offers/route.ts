import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const offers = await prisma.offer.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ offers });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const d = await req.json();
  if (!d.title || !d.image) return NextResponse.json({ error: "Title and image are required" }, { status: 400 });
  const offer = await prisma.offer.create({
    data: {
      title: d.title, description: d.description || "", image: d.image, badge: d.badge || null,
      href: d.href || null, memberOnly: !!d.memberOnly, published: d.published ?? true, sortOrder: Number(d.sortOrder) || 0,
    },
  });
  return NextResponse.json({ offer }, { status: 201 });
}
