import { prisma } from "@/lib/prisma";
import { resolveCoords } from "@/lib/place-coords";
import { peakSeasonCountries } from "@/lib/seasonality";
import { affinityFor } from "@/lib/affinity";

export type PriceDrop = { title: string; href: string; image: string | null; was: number; now: number; pct: number };
export type WeatherAlt = { title: string; href: string; image: string | null; country: string };
export type Affinity = { from: string; to: string; reason: string; href: string; image: string | null };
export type PersonalizedHome = {
  firstName: string;
  nextTrip: { title: string; reference: string; checkIn: string; daysToGo: number } | null;
  passport: { label: string; daysToExpiry: number; expiry: string } | null;
  priceDrops: PriceDrop[];
  weather: { place: string; alternatives: WeatherAlt[] } | null;
  affinity: Affinity | null;
  savedCount: number;
};

// "If you liked {from}, you'll love {to}" — from the country of a hotel the
// member has saved or booked, mapped through the affinity table.
async function affinitySuggestion(customerId: string): Promise<Affinity | null> {
  const saved = await prisma.savedItem.findFirst({ where: { customerId, type: "hotel" }, orderBy: { createdAt: "desc" }, select: { itemId: true } });
  let hotelId = saved?.itemId;
  if (!hotelId) hotelId = (await prisma.booking.findFirst({ where: { customerId, type: "hotel", status: { not: "cancelled" } }, orderBy: { createdAt: "desc" }, select: { itemId: true } }))?.itemId;
  if (!hotelId) return null;
  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { country: true } });
  const aff = affinityFor(hotel?.country);
  if (!aff || !hotel?.country) return null;
  const sample = await prisma.hotel.findFirst({ where: { published: true, country: aff.to }, orderBy: [{ rating: "desc" }, { reviewCount: "desc" }], select: { id: true, image: true } });
  return { from: hotel.country, to: aff.to, reason: aff.reason, href: sample ? `/hotels/${sample.id}` : `/destinations`, image: sample?.image ?? null };
}

// Is the destination looking wet over the next few days? (Open-Meteo, cached.)
async function isRainy(lat: number, lng: number): Promise<boolean> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_probability_max&forecast_days=5&timezone=auto`;
    const r = await fetch(url, { next: { revalidate: 3600 } });
    if (!r.ok) return false;
    const probs: number[] = (await r.json())?.daily?.precipitation_probability_max ?? [];
    return probs.filter(p => typeof p === "number" && p >= 60).length >= 2;
  } catch { return false; }
}

// If the member's destination (upcoming hotel, else a saved hotel) looks rainy,
// suggest a few top-rated stays in countries that are in peak season right now.
async function weatherSuggestion(customerId: string): Promise<{ place: string; alternatives: WeatherAlt[] } | null> {
  const booking = await prisma.booking.findFirst({ where: { customerId, type: "hotel", status: { not: "cancelled" }, checkIn: { not: null } }, orderBy: { checkIn: "asc" }, select: { itemId: true } });
  let hotelId = booking?.itemId;
  if (!hotelId) hotelId = (await prisma.savedItem.findFirst({ where: { customerId, type: "hotel" }, orderBy: { createdAt: "desc" }, select: { itemId: true } }))?.itemId;
  if (!hotelId) return null;

  const hotel = await prisma.hotel.findUnique({ where: { id: hotelId }, select: { city: true, country: true, lat: true, lng: true } });
  if (!hotel) return null;
  const coords = hotel.lat != null && hotel.lng != null ? [hotel.lat, hotel.lng] as [number, number] : resolveCoords(hotel.city, null);
  if (!coords) return null;
  if (!(await isRainy(coords[0], coords[1]))) return null;

  const peak = peakSeasonCountries(new Date().getMonth()).filter(c => c !== hotel.country);
  if (peak.length === 0) return null;
  const alts = await prisma.hotel.findMany({ where: { published: true, country: { in: peak } }, orderBy: [{ rating: "desc" }, { reviewCount: "desc" }], take: 3, select: { id: true, name: true, image: true, country: true } });
  if (alts.length === 0) return null;

  return { place: hotel.city || hotel.country, alternatives: alts.map(a => ({ title: a.name, href: `/hotels/${a.id}`, image: a.image, country: a.country })) };
}

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

  const [savedCount, weather, affinity] = await Promise.all([
    prisma.savedItem.count({ where: { customerId } }),
    weatherSuggestion(customerId).catch(() => null),
    affinitySuggestion(customerId).catch(() => null),
  ]);

  return {
    firstName: customer?.name?.trim().split(" ")[0] || "",
    nextTrip,
    passport,
    priceDrops: priceDrops.slice(0, 2),
    weather,
    affinity,
    savedCount,
  };
}
