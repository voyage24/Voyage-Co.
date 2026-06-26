import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { FEATURED_DESTINATIONS } from "@/lib/mock-data";

// One-click admin action: re-syncs the featured destinations from
// lib/mock-data.ts into the database. Unlike the other content types,
// FeaturedDestination has no deterministic id (it's a generated cuid), so
// duplicates are prevented by checking for an existing row with the same
// name first, rather than relying on createMany's skipDuplicates.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  let added = 0;
  for (let i = 0; i < FEATURED_DESTINATIONS.length; i++) {
    const d = FEATURED_DESTINATIONS[i];
    const exists = await prisma.featuredDestination.findFirst({ where: { name: d.name } });
    if (!exists) {
      await prisma.featuredDestination.create({ data: { ...d, sortOrder: i, published: true } });
      added++;
    }
  }

  return NextResponse.json({ ok: true, added });
}
