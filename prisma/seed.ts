// One-time content seed: copies the existing static catalog from
// lib/mock-data.ts into the database, preserving every existing `id`/`slug`
// value so public URLs (e.g. /hotels/h1) never change. Safe to re-run —
// uses upsert, so it won't duplicate records on a second run.
import { PrismaClient } from "@prisma/client";
import {
  HOTELS,
  FLIGHTS,
  TRAINS,
  EXPERIENCES,
  PACKAGES,
  CRUISES,
  BLOG_POSTS,
  FEATURED_DESTINATIONS,
} from "../lib/mock-data";

const prisma = new PrismaClient();

async function main() {
  for (const h of HOTELS) {
    await prisma.hotel.upsert({
      where: { id: h.id },
      create: { ...h, images: h.images ?? [], published: true },
      update: {},
    });
  }
  console.log(`Seeded ${HOTELS.length} hotels`);

  for (const f of FLIGHTS) {
    await prisma.flight.upsert({
      where: { id: f.id },
      create: { ...f, currency: f.currency ?? "INR", published: true },
      update: {},
    });
  }
  console.log(`Seeded ${FLIGHTS.length} flights`);

  for (const t of TRAINS) {
    await prisma.train.upsert({
      where: { id: t.id },
      create: { ...t, published: true },
      update: {},
    });
  }
  console.log(`Seeded ${TRAINS.length} trains`);

  for (const e of EXPERIENCES) {
    await prisma.experience.upsert({
      where: { id: e.id },
      create: { ...e, published: true },
      update: {},
    });
  }
  console.log(`Seeded ${EXPERIENCES.length} experiences`);

  for (const p of PACKAGES) {
    await prisma.package.upsert({
      where: { id: p.id },
      create: { ...p, published: true },
      update: {},
    });
  }
  console.log(`Seeded ${PACKAGES.length} packages`);

  for (const c of CRUISES) {
    await prisma.cruise.upsert({
      where: { id: c.id },
      create: { ...c, published: true },
      update: {},
    });
  }
  console.log(`Seeded ${CRUISES.length} cruises`);

  for (const b of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: b.slug },
      create: { ...b, published: true },
      update: {},
    });
  }
  console.log(`Seeded ${BLOG_POSTS.length} blog posts`);

  for (let i = 0; i < FEATURED_DESTINATIONS.length; i++) {
    const d = FEATURED_DESTINATIONS[i];
    const existing = await prisma.featuredDestination.findFirst({ where: { name: d.name } });
    if (!existing) {
      await prisma.featuredDestination.create({ data: { ...d, sortOrder: i, published: true } });
    }
  }
  console.log(`Seeded ${FEATURED_DESTINATIONS.length} featured destinations`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
