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

// One-time bootstrap: creates the first admin account and seeds the
// existing catalog into the database. Self-disabling — refuses to run
// once any AdminUser already exists, so it's safe to leave deployed.
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

  for (const h of HOTELS) {
    await prisma.hotel.upsert({ where: { id: h.id }, create: { ...h, images: h.images ?? [], published: true }, update: {} });
  }
  for (const f of FLIGHTS) {
    await prisma.flight.upsert({ where: { id: f.id }, create: { ...f, currency: f.currency ?? "INR", published: true }, update: {} });
  }
  for (const t of TRAINS) {
    await prisma.train.upsert({ where: { id: t.id }, create: { ...t, published: true }, update: {} });
  }
  for (const e of EXPERIENCES) {
    await prisma.experience.upsert({ where: { id: e.id }, create: { ...e, published: true }, update: {} });
  }
  for (const p of PACKAGES) {
    await prisma.package.upsert({ where: { id: p.id }, create: { ...p, published: true }, update: {} });
  }
  for (const c of CRUISES) {
    await prisma.cruise.upsert({ where: { id: c.id }, create: { ...c, published: true }, update: {} });
  }
  for (const b of BLOG_POSTS) {
    await prisma.blogPost.upsert({ where: { slug: b.slug }, create: { ...b, published: true }, update: {} });
  }
  for (let i = 0; i < FEATURED_DESTINATIONS.length; i++) {
    const d = FEATURED_DESTINATIONS[i];
    const exists = await prisma.featuredDestination.findFirst({ where: { name: d.name } });
    if (!exists) await prisma.featuredDestination.create({ data: { ...d, sortOrder: i, published: true } });
  }

  return NextResponse.json({ ok: true });
}
