import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const moments = await prisma.moment.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });
  return NextResponse.json({ moments });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  if (!data.image) return NextResponse.json({ error: "An image is required" }, { status: 400 });
  const moment = await prisma.moment.create({
    data: { image: data.image, caption: data.caption || null, handle: data.handle || null, link: data.link || null, sortOrder: Number(data.sortOrder) || 0, published: data.published ?? true },
  });
  return NextResponse.json({ moment }, { status: 201 });
}
