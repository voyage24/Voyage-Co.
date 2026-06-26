import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { PACKAGES } from "@/lib/mock-data";

const CURATED_IDS = [
  "p21", "p22", "p23", "p24", "p25", "p26", "p27", "p28", "p29", "p30", "p31", "p32",
];

// One-click admin action: adds the curated worldwide bespoke journeys from
// lib/mock-data.ts that aren't already in the database. Safe to click more
// than once — skipDuplicates means already-imported entries are left alone.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const curated = PACKAGES.filter(p => CURATED_IDS.includes(p.id));

  const result = await prisma.package.createMany({
    data: curated.map(p => ({ ...p, published: true })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: result.count });
}
