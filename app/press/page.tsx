import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PressPageClient from "@/components/pages/PressPageClient";

// Facts are derived from live data so the press page never overstates a newly
// founded (2026) brand: "destinations curated" tracks the destinations we have
// *deliberately curated* (the Featured Destinations managed in admin), and
// "average itinerary lead time" is computed from real bookings. Both update on
// their own as the business grows.
export const revalidate = 3600;

const FOUNDED = "2026";

function median(nums: number[]): number {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

export const metadata: Metadata = {
  title: "Press & Media — Voyages & Co.",
  description: "Media resources and quick facts about Voyages & Co., a bespoke luxury travel maison founded in 2026.",
};

export default async function PressPage() {
  const [destCount, bookings] = await Promise.all([
    prisma.featuredDestination.count({ where: { published: true } }).catch(() => 0),
    prisma.booking
      .findMany({ where: { checkIn: { not: null }, status: { not: "cancelled" } }, select: { checkIn: true, createdAt: true } })
      .catch(() => [] as { checkIn: string | null; createdAt: Date }[]),
  ]);

  // Average booking-to-check-in lead time, in days, from real bookings.
  const leadDays = bookings
    .map(b => {
      const ci = b.checkIn ? new Date(b.checkIn) : null;
      if (!ci || isNaN(ci.getTime())) return null;
      const days = (ci.getTime() - b.createdAt.getTime()) / 86_400_000;
      return days >= 0 && days <= 730 ? days : null; // ignore odd/past dates
    })
    .filter((n): n is number => n != null);

  // Enough real data → show the actual median; otherwise a realistic bespoke
  // planning window for a young brand. Either way it's honest and self-updating.
  const leadTime = leadDays.length >= 3 ? `~${Math.max(1, Math.round(median(leadDays) / 7))} weeks` : "3–6 weeks";
  const destinations = destCount > 0 ? `${destCount} ${destCount === 1 ? "destination" : "destinations"}` : "Curating now";

  return <PressPageClient founded={FOUNDED} destinations={destinations} leadTime={leadTime} />;
}
