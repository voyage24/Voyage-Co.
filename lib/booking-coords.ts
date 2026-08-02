import { prisma } from "@/lib/prisma";
import { resolveCoords } from "@/lib/place-coords";
import { COUNTRY_CENTROIDS } from "@/lib/geo";

// Best-effort destination coordinates for a booking, so its countdown card
// can show live local weather. Bookings don't carry city/country directly —
// only itemId + type — so this looks up the referenced catalogue item per
// type. Returns null when the type/data can't resolve to a location (e.g.
// cruise ports and flights aren't geocoded, so they're skipped).
export async function resolveBookingCoords(type: string, itemId: string): Promise<{ coords: [number, number]; label: string } | null> {
  try {
    if (type === "hotel") {
      const h = await prisma.hotel.findUnique({ where: { id: itemId }, select: { lat: true, lng: true, city: true, location: true } });
      if (!h) return null;
      const coords = h.lat != null && h.lng != null ? ([h.lat, h.lng] as [number, number]) : resolveCoords(h.city, h.location);
      return coords ? { coords, label: h.city } : null;
    }
    if (type === "experience") {
      const ex = await prisma.experience.findUnique({ where: { id: itemId }, select: { lat: true, lng: true, location: true, country: true } });
      if (!ex) return null;
      const coords = ex.lat != null && ex.lng != null ? ([ex.lat, ex.lng] as [number, number]) : resolveCoords(ex.location, ex.country);
      return coords ? { coords, label: ex.location } : null;
    }
    if (type === "package") {
      const p = await prisma.package.findUnique({ where: { id: itemId }, select: { destinations: true } });
      const country = p?.destinations?.[0];
      const coords = country ? COUNTRY_CENTROIDS[country] : undefined;
      return coords ? { coords, label: country! } : null;
    }
    if (type === "train") {
      const t = await prisma.train.findUnique({ where: { id: itemId }, select: { destinationCity: true } });
      const coords = t?.destinationCity ? resolveCoords(t.destinationCity, null) : null;
      return coords ? { coords, label: t!.destinationCity } : null;
    }
  } catch {
    // Best-effort — no weather chip if anything goes wrong.
  }
  return null;
}
