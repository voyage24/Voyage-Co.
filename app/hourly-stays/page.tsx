import { prisma } from "@/lib/prisma";
import HourlyStaysPageClient from "@/components/pages/HourlyStaysPageClient";
import { safeQuery } from "@/lib/safe-query";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Hourly Stays — Voyages & Co.",
  description: "Day-use rooms by the hour at partner hotels — rest, refresh or work between flights.",
};

export default async function HourlyStaysPage() {
  const stays = await safeQuery(() => prisma.hourlyStay.findMany({ where: { published: true } }), []);
  return <HourlyStaysPageClient stays={stays} />;
}
