import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { TRAINS } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const result = await prisma.train.createMany({
    data: TRAINS.map(t => ({ ...t, published: true })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: result.count });
}
