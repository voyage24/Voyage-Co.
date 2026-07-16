import { prisma } from "@/lib/prisma";

// Loyalty points. Earned at 1 point per ₹1,000 of booking value — and only once
// a journey has actually been travelled, never on booking or confirmation, so a
// member's balance always reflects journeys they've really taken. Cancelling or
// deleting a booking that had already earned its points takes them back off.

export const pointsFor = (totalInr: number) => Math.floor((totalInr || 0) / 1000);

export const tierFor = (points: number) => (points >= 5000 ? "gold" : points >= 1500 ? "silver" : "member");

// Add points (negative to take them back) and re-grade the tier. A balance can
// never fall below zero, so reversing an award can't leave a member in debt.
export async function applyPoints(customerId: string, delta: number) {
  if (!delta) return null;
  const c = await prisma.customer.findUnique({ where: { id: customerId }, select: { points: true, tier: true } });
  if (!c) return null;
  const points = Math.max(0, (c.points || 0) + delta);
  const tier = tierFor(points);
  await prisma.customer.update({ where: { id: customerId }, data: { points, ...(tier !== c.tier ? { tier } : {}) } });
  return { points, tier };
}

// Has the journey been travelled? Multi-day trips complete after check-out;
// single-day ones (flights, experiences) after their date.
export function journeyEnded(checkIn: string | null, checkOut: string | null, now = Date.now()): boolean {
  const raw = checkOut || checkIn;
  if (!raw) return false;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return false;
  // Count the whole end day as still travelling.
  return now > d.getTime() + 24 * 60 * 60 * 1000;
}

// Take back the points a set of bookings had earned, before those bookings are
// deleted — otherwise a member keeps points for journeys with no record.
export async function reversePointsForBookings(
  bookings: { customerId: string | null; total: number; pointsAwarded: boolean }[],
) {
  const byCustomer = new Map<string, number>();
  for (const b of bookings) {
    if (!b.pointsAwarded || !b.customerId) continue;
    byCustomer.set(b.customerId, (byCustomer.get(b.customerId) || 0) + pointsFor(b.total));
  }
  for (const [customerId, pts] of Array.from(byCustomer)) {
    await applyPoints(customerId, -pts).catch(() => {});
  }
  return byCustomer.size;
}
