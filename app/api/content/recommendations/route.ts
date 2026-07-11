import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Taste-based recommendations. Given the visitor's recently-viewed item refs
// (from localStorage), derive their taste — the destinations and property styles
// they keep looking at — and return *new* published properties that match, which
// they haven't seen yet. Public, read-only, no personal data stored.

type Ref = { type?: string; id?: string };

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const viewed: Ref[] = Array.isArray(body?.viewed) ? body.viewed.slice(0, 12) : [];
  const hotelIds = viewed.filter(v => v.type === "hotel" && v.id).map(v => v.id!) ;
  const expIds = viewed.filter(v => v.type === "experience" && v.id).map(v => v.id!);
  if (!hotelIds.length && !expIds.length) return NextResponse.json({ items: [] });

  const [vHotels, vExps] = await Promise.all([
    hotelIds.length ? prisma.hotel.findMany({ where: { id: { in: hotelIds } }, select: { country: true, region: true, category: true } }) : Promise.resolve([]),
    expIds.length ? prisma.experience.findMany({ where: { id: { in: expIds } }, select: { country: true, category: true } }) : Promise.resolve([]),
  ]);

  const countries = new Set<string>();
  const categories = new Set<string>();
  for (const h of vHotels) { if (h.country) countries.add(h.country); if (h.category) categories.add(h.category); }
  for (const e of vExps) { if (e.country) countries.add(e.country); if (e.category) categories.add(e.category); }
  if (!countries.size && !categories.size) return NextResponse.json({ items: [] });

  const cList = Array.from(countries);
  const catList = Array.from(categories);
  const or: object[] = [];
  if (cList.length) or.push({ country: { in: cList } });
  if (catList.length) or.push({ category: { in: catList } });

  const recHotels = await prisma.hotel.findMany({
    where: { published: true, id: { notIn: hotelIds.length ? hotelIds : ["_none_"] }, OR: or },
    orderBy: [{ rating: "desc" }, { reviewCount: "desc" }],
    take: 12,
    select: { id: true, name: true, image: true, city: true, country: true },
  });

  const recExps = cList.length
    ? await prisma.experience.findMany({
        where: { published: true, id: { notIn: expIds.length ? expIds : ["_none_"] }, country: { in: cList } },
        orderBy: { createdAt: "desc" }, take: 4,
        select: { id: true, title: true, image: true, location: true, country: true },
      })
    : [];

  // Interleave so it isn't all one type; hotels lead (richest catalogue).
  const hotelItems = recHotels.map(h => ({ type: "hotel", id: h.id, title: h.name, image: h.image, href: `/hotels/${h.id}`, subtitle: h.city || h.country }));
  const expItems = recExps.map(e => ({ type: "experience", id: e.id, title: e.title, image: e.image, href: `/experiences/${e.id}`, subtitle: e.location || e.country }));
  const items = [...hotelItems.slice(0, 8), ...expItems].slice(0, 10);

  return NextResponse.json({ items, reason: cList[0] || catList[0] || null });
}
