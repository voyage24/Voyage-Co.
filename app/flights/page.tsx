import { prisma } from "@/lib/prisma";
import FlightsPageClient from "@/components/pages/FlightsPageClient";

export const revalidate = 60;

export default async function FlightsPage() {
  const flights = await prisma.flight.findMany({ where: { published: true } });
  return <FlightsPageClient flights={flights} />;
}
