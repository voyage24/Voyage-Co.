import { prisma } from "@/lib/prisma";

export type PriceDrop = { title: string; href: string; image: string | null; was: number; now: number; pct: number };
export type PersonalizedHome = {
  firstName: string;
  nextTrip: { title: string; reference: string; checkIn: string; daysToGo: number } | null;
  passport: { label: string; daysToExpiry: number; expiry: string } | null;
  priceDrops: PriceDrop[];
  savedCount: number;
};

const dayDiff = (iso: string) => {
  const d = new Date(iso); if (isNaN(d.getTime())) return null;
  const a = new Date(d); a.setHours(0, 0, 0, 0);
  const b = new Date(); b.setHours(0, 0, 0, 0);
  return Math.round((a.getTime() - b.getTime()) / 86_400_000);
};

async function currentPrice(type: string, id: string): Promise<number | null> {
  try {
    if (type === "hotel") return (await prisma.hotel.findUnique({ where: { id }, select: { pricePerNight: true } }))?.pricePerNight ?? null;
    if (type === "experience") return (await prisma.experience.findUnique({ where: { id }, select: { price: true } }))?.price ?? null;
    if (type === "package") return (await prisma.package.findUnique({ where: { id }, select: { pricePerPerson: true } }))?.pricePerPerson ?? null;
    if (type === "cruise") return (await prisma.cruise.findUnique({ where: { id }, select: { pricePerPerson: true } }))?.pricePerPerson ?? null;
  } catch { /* ignore */ }
  return null;
}

// Everything the signed-in home strip needs: greeting name, next trip, a soon-
// to-expire passport/visa, and any saved journeys whose price has dropped.
export async function getPersonalizedHome(customerId: string): Promise<PersonalizedHome> {
  const [customer, bookings, docs, saved] = await Promise.all([
    prisma.customer.findUnique({ where: { id: customerId }, select: { name: true } }),
    prisma.booking.findMany({ where: { customerId, status: { not: "cancelled" }, checkIn: { not: null } }, select: { itemTitle: true, reference: true, checkIn: true } }),
    prisma.memberDocument.findMany({ where: { customerId, expiry: { not: null } }, select: { label: true, category: true, expiry: true } }),
    prisma.savedItem.findMany({ where: { customerId, priceAtSave: { not: null } }, select: { type: true, itemId: true, itemTitle: true, image: true, href: true, priceAtSave: true } }),
  ]);

  // Next upcoming trip.
  const upcoming = bookings
    .map(b => ({ ...b, d: b.checkIn ? dayDiff(b.checkIn) : null }))
    .filter(b => b.d !== null && b.d >= 0)
    .sort((a, b) => (a.d as number) - (b.d as number))[0];
  const nextTrip = upcoming ? { title: upcoming.itemTitle, reference: upcoming.reference, checkIn: upcoming.checkIn!, daysToGo: upcoming.d as number } : null;

  // Soonest passport/visa within ~9 months.
  const expiringDoc = docs
    .map(d => ({ ...d, days: d.expiry ? dayDiff(d.expiry) : null }))
    .filter(d => d.days !== null && d.days <= 270)
    .sort((a, b) => (a.days as number) - (b.days as number))[0];
  const passport = expiringDoc ? { label: expiringDoc.category === "Passport" ? "Passport" : expiringDoc.label, daysToExpiry: expiringDoc.days as number, expiry: expiringDoc.expiry! } : null;

  // Price drops among saved journeys (current < saved, ≥5% down).
  const priceDrops: PriceDrop[] = [];
  for (const s of saved) {
    const now = await currentPrice(s.type, s.itemId);
    if (now != null && s.priceAtSave != null && now < s.priceAtSave) {
      const pct = Math.round(((s.priceAtSave - now) / s.priceAtSave) * 100);
      if (pct >= 5) priceDrops.push({ title: s.itemTitle, href: s.href, image: s.image, was: s.priceAtSave, now, pct });
    }
  }
  priceDrops.sort((a, b) => b.pct - a.pct);

  const savedCount = await prisma.savedItem.count({ where: { customerId } });

  return {
    firstName: customer?.name?.trim().split(" ")[0] || "",
    nextTrip,
    passport,
    priceDrops: priceDrops.slice(0, 2),
    savedCount,
  };
}
