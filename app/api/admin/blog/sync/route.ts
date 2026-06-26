import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { BLOG_POSTS } from "@/lib/mock-data";

// One-click admin action: re-syncs the full blog catalog from
// lib/mock-data.ts into the database. Safe to click more than once —
// skipDuplicates means already-present entries are left untouched, so this
// also doubles as a repair tool if any posts are ever found missing.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const result = await prisma.blogPost.createMany({
    data: BLOG_POSTS.map(b => ({ ...b, published: true })),
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, added: result.count });
}
