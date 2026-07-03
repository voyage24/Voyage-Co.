import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Increments the grand-total visit counter plus today's day-bucket (fired once
// per visitor per day) and returns the running total.
export async function POST(req: Request) {
  try {
    const { device } = await req.json().catch(() => ({} as { device?: string }));
    const day = new Date().toISOString().slice(0, 10);
    const ops = [
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
    ];
    if (device === "mobile" || device === "desktop") {
      ops.push(
        prisma.siteStat.upsert({
          where: { key: `visits:${device}` },
          update: { count: { increment: 1 } },
          create: { key: `visits:${device}`, count: 1 },
        }),
      );
    }
    const [stat] = await prisma.$transaction(ops);
    return NextResponse.json({ count: stat.count });
  } catch {
    return NextResponse.json({ count: null });
  }
}
