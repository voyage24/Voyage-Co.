import { prisma } from "@/lib/prisma";
import ExperiencesPageClient from "@/components/pages/ExperiencesPageClient";
import { valueBandsFor } from "@/lib/price-context";

export const revalidate = 60;

export default async function ExperiencesPage() {
  const experiences = await prisma.experience.findMany({ where: { published: true } });
  const bands = valueBandsFor(experiences.map(e => ({ id: e.id, country: e.country, category: e.category, pricePerNight: e.price, priceOnRequest: e.priceOnRequest })));
  const enriched = experiences.map(e => ({ ...e, valueBand: bands.get(e.id) }));
  return <ExperiencesPageClient experiences={enriched} />;
}
