import { prisma } from "@/lib/prisma";
import HotelsPageClient from "@/components/pages/HotelsPageClient";

export const revalidate = 60;

export default async function HotelsPage() {
  const hotels = await prisma.hotel.findMany({ where: { published: true } });
  return <HotelsPageClient hotels={hotels} />;
}
