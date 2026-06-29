import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const press = await prisma.pressMention.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ press });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const data = await req.json();
  if (!data.name || !data.image) return NextResponse.json({ error: "Name and logo are required" }, { status: 400 });
  const press = await prisma.pressMention.create({
    data: { name: data.name, image: data.image, url: data.url || null, sortOrder: Number(data.sortOrder) || 0, published: data.published ?? true },
  });
  return NextResponse.json({ press }, { status: 201 });
}
