import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Increments the grand-total visit counter plus today's day-bucket (fired once
// per visitor per day) and returns the running total.
export async function POST() {
  try {
    const day = new Date().toISOString().slice(0, 10);
    const [stat] = await prisma.$transaction([
      prisma.siteStat.upsert({
        where: { key: "visits" },
        update: { count: { increment: 1 } },
        create: { key: "visits", count: 1 },
      }),
      prisma.dailyVisit.upsert({
        where: { day },
        update: { count: { increment: 1 } },
        create: { day, count: 1 },
      }),
    ]);
    return NextResponse.json({ count: stat.count });
  } catch {
    return NextResponse.json({ count: null });
  }
}
