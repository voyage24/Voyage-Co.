import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  HOTELS,
  FLIGHTS,
  TRAINS,
  EXPERIENCES,
  PACKAGES,
  CRUISES,
  BLOG_POSTS,
  FEATURED_DESTINATIONS,
} from "@/lib/mock-data";

export const maxDuration = 60;

// One-time bootstrap: creates the first admin account and seeds the
// existing catalog into the database. Self-disabling — refuses to run
// once any AdminUser already exists, so it's safe to leave deployed.
// Uses bulk createMany (one round-trip per table) instead of per-record
// upserts, since this only ever runs once against empty tables.
export async function POST(req: NextRequest) {
  const existing = await prisma.adminUser.count();
  if (existing > 0) {
    return NextResponse.json({ error: "Setup already completed" }, { status: 403 });
  }

  const { email, password } = await req.json();
  if (!email || !password || password.length < 8) {
    return NextResponse.json({ error: "Email and a password of at least 8 characters are required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.adminUser.create({ data: { email, passwordHash } });

  await Promise.all([
    prisma.hotel.createMany({
      data: HOTELS.map(h => ({ ...h, images: h.images ?? [], published: true })),
      skipDuplicates: true,
    }),
    prisma.flight.createMany({
      data: FLIGHTS.map(f => ({ ...f, currency: f.currency ?? "INR", published: true })),
      skipDuplicates: true,
    }),
    prisma.train.createMany({
      data: TRAINS.map(t => ({ ...t, published: true })),
      skipDuplicates: true,
    }),
    prisma.experience.createMany({
      data: EXPERIENCES.map(e => ({ ...e, published: true })),
      skipDuplicates: true,
    }),
    prisma.package.createMany({
      data: PACKAGES.map(p => ({ ...p, published: true })),
      skipDuplicates: true,
    }),
    prisma.cruise.createMany({
      data: CRUISES.map(c => ({ ...c, published: true })),
      skipDuplicates: true,
    }),
    prisma.blogPost.createMany({
      data: BLOG_POSTS.map(b => ({ ...b, published: true })),
      skipDuplicates: true,
    }),
    prisma.featuredDestination.createMany({
      data: FEATURED_DESTINATIONS.map((d, i) => ({ ...d, sortOrder: i, published: true })),
      skipDuplicates: true,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
