import { prisma } from "@/lib/prisma";
import FlightsPageClient from "@/components/pages/FlightsPageClient";
import { safeQuery } from "@/lib/safe-query";

export const revalidate = 60;

export default async function FlightsPage() {
  const flights = await safeQuery(() => prisma.flight.findMany({ where: { published: true } }), []);
  return <FlightsPageClient flights={flights} />;
}
