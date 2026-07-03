import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Increments the site-visit counter (fired once per browser session) and
// returns the running total.
export async function POST() {
  try {
    const stat = await prisma.siteStat.upsert({
      where: { key: "visits" },
      update: { count: { increment: 1 } },
      create: { key: "visits", count: 1 },
    });
    return NextResponse.json({ count: stat.count });
  } catch {
    return NextResponse.json({ count: null });
  }
}
