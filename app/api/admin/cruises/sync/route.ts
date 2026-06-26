import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { CRUISES } from "@/lib/mock-data";

// One-click admin action: re-syncs the full cruise catalog from
// lib/mock-data.ts into the database. Safe to click more than once —
// skipDuplicates means already-present entries are left untouched, so this
// also doubles as a repair tool if any cruises are ever found missing.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const result = await prisma.cruise.createMany({
    data: CRUISES.map(c => ({ ...c, published: true })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: result.count });
}
