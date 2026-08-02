import { prisma } from "@/lib/prisma";
import OutstationCabsPageClient from "@/components/pages/OutstationCabsPageClient";
import { safeQuery } from "@/lib/safe-query";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Outstation Cabs — Voyages & Co.",
  description: "Intercity cab journeys with a private driver — one-way or round-trip, at a fixed fare.",
};

export default async function OutstationCabsPage() {
  const cabs = await safeQuery(() => prisma.outstationCab.findMany({ where: { published: true } }), []);
  return <OutstationCabsPageClient cabs={cabs} />;
}
