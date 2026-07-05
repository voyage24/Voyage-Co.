import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { COLLECTION_BY_TYPE } from "@/lib/collections";

export async function GET(req: NextRequest, { params }: { params: { type: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  if (!COLLECTION_BY_TYPE.has(params.type)) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });
  const items = await prisma.collection.findMany({
    where: { type: params.type },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest, { params }: { params: { type: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const def = COLLECTION_BY_TYPE.get(params.type);
  if (!def) return NextResponse.json({ error: "Unknown collection" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: Record<string, string> = {};
  for (const f of def.fields) data[f.key] = String(body?.data?.[f.key] ?? "");

  const item = await prisma.collection.create({
    data: {
      type: params.type,
      data,
      sortOrder: Number(body?.sortOrder) || 0,
      published: body?.published ?? true,
    },
  });
  return NextResponse.json({ item }, { status: 201 });
}
