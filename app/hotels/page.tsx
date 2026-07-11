import { prisma } from "@/lib/prisma";
import HotelsPageClient from "@/components/pages/HotelsPageClient";
import { valueBandsFor } from "@/lib/price-context";

export const revalidate = 60;

export default async function HotelsPage() {
  const hotels = await prisma.hotel.findMany({ where: { published: true } });
  const bands = valueBandsFor(hotels);
  const enriched = hotels.map(h => ({ ...h, valueBand: bands.get(h.id) }));
  return <HotelsPageClient hotels={enriched} />;
}
