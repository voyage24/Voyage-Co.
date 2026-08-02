import { prisma } from "@/lib/prisma";
import AirportCabsPageClient from "@/components/pages/AirportCabsPageClient";
import { safeQuery } from "@/lib/safe-query";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Airport Cabs — Voyages & Co.",
  description: "Private airport transfers with a fixed fare, flight tracking and a meet & greet at arrivals.",
};

export default async function AirportCabsPage() {
  const cabs = await safeQuery(() => prisma.airportCab.findMany({ where: { published: true } }), []);
  return <AirportCabsPageClient cabs={cabs} />;
}
