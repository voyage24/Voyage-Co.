import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Result = { type: string; title: string; subtitle: string; href: string; image?: string | null };

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const like = { contains: q, mode: "insensitive" as const };

  try {
    const [hotels, packages, experiences, cruises, posts] = await Promise.all([
      prisma.hotel.findMany({
        where: { published: true, OR: [{ name: like }, { location: like }, { city: like }, { country: like }, { region: like }] },
        take: 5, select: { id: true, name: true, location: true, image: true },
      }),
      prisma.package.findMany({
        where: { published: true, OR: [{ title: like }, { subtitle: like }, { category: like }] },
        take: 5, select: { id: true, title: true, subtitle: true, image: true },
      }),
      prisma.experience.findMany({
        where: { published: true, OR: [{ title: like }, { location: like }, { category: like }] },
        take: 5, select: { id: true, title: true, location: true, image: true },
      }),
      prisma.cruise.findMany({
        where: { published: true, OR: [{ name: like }, { cruiseLine: like }, { region: like }, { departurePort: like }] },
        take: 5, select: { id: true, name: true, region: true, image: true },
      }),
      prisma.blogPost.findMany({
        where: { published: true, OR: [{ title: like }, { excerpt: like }, { category: like }] },
        take: 5, select: { slug: true, title: true, category: true, image: true },
      }),
    ]);

    const results: Result[] = [
      ...packages.map(p => ({ type: "Journey", title: p.title, subtitle: p.subtitle, href: `/packages/${p.id}`, image: p.image })),
      ...hotels.map(h => ({ type: "Stay", title: h.name, subtitle: h.location, href: `/hotels/${h.id}`, image: h.image })),
      ...experiences.map(e => ({ type: "Experience", title: e.title, subtitle: e.location, href: `/experiences/${e.id}`, image: e.image })),
      ...cruises.map(c => ({ type: "Cruise", title: c.name, subtitle: c.region, href: `/cruises/${c.id}`, image: c.image })),
      ...posts.map(b => ({ type: "Journal", title: b.title, subtitle: b.category, href: `/blog/${b.slug}`, image: b.image })),
    ];

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Search failed:", err);
    return NextResponse.json({ results: [] });
  }
}
