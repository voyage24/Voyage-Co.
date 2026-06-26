import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { HOTELS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const result = await prisma.hotel.createMany({
    data: HOTELS.map(h => ({ ...h, images: h.images ?? [], published: true })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: result.count });
}
