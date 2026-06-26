import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { PACKAGES } from "@/lib/mock-data";

// One-click admin action: re-syncs the full package catalog from
// lib/mock-data.ts (all 32 entries — the original 20 plus the 12 curated
// worldwide additions) into the database. Safe to click more than once —
// skipDuplicates means already-present entries are left untouched, so this
// also doubles as a repair tool if any packages are ever found missing.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const result = await prisma.package.createMany({
    data: PACKAGES.map(p => ({ ...p, published: true })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: result.count });
}
