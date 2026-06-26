import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { EXPERIENCES } from "@/lib/mock-data";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const result = await prisma.experience.createMany({
    data: EXPERIENCES.map(e => ({ ...e, published: true })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: result.count });
}
