import { prisma } from "@/lib/prisma";
import FlightsPageClient from "@/components/pages/FlightsPageClient";

export const dynamic = "force-dynamic";

export default async function FlightsPage() {
  const flights = await prisma.flight.findMany({ where: { published: true } });
  return <FlightsPageClient flights={flights} />;
}
