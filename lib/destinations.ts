import { prisma } from "@/lib/prisma";

export const destSlug = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export type Destination = { country: string; slug: string; image: string; count: number };

// Derives destination countries from the published hotel catalogue, with a
// representative image and a count — no separate table to maintain.
export async function getDestinations(): Promise<Destination[]> {
  const hotels = await prisma.hotel.findMany({ where: { published: true }, select: { country: true, image: true } });
  const map = new Map<string, Destination>();
  for (const h of hotels) {
    if (!h.country) continue;
    const slug = destSlug(h.country);
    const cur = map.get(slug);
    if (cur) cur.count++;
    else map.set(slug, { country: h.country, slug, image: h.image, count: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
}
