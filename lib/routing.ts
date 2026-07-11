import { prisma } from "@/lib/prisma";
import { CITY_COORDS } from "@/lib/geo";
import { nearestAirport, type NearestAirport } from "@/lib/nearest-airport";

// Precise airport transfer time via OpenRouteService (free key: ORS_API_KEY),
// computed once per property and cached forever in RouteCache — so it's instant
// on later views and self-populates for every existing/new property. Falls back
// to the distance estimate when no road route exists (islands) or no key is set.

export type Transfer = NearestAirport & { source: "precise" | "estimate"; km?: number };

const roundMins = (secs: number) => Math.max(5, Math.round(secs / 60 / 5) * 5);

// Road route from the airport to the property, via whichever provider is
// configured — OpenRouteService or Geoapify (both free). Returns null on no
// key, no road route (islands), or an API error.
async function fetchRoad(originLat: number, originLng: number, dstLat: number, dstLng: number): Promise<{ km: number; minutes: number } | null> {
  const ors = process.env.ORS_API_KEY;
  const geoapify = process.env.GEOAPIFY_API_KEY;

  if (ors) {
    try {
      const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
        method: "POST",
        headers: { Authorization: ors, "Content-Type": "application/json" },
        body: JSON.stringify({ coordinates: [[dstLng, dstLat], [originLng, originLat]] }), // ORS wants [lng, lat]
        cache: "no-store",
      });
      if (res.ok) {
        const sum = (await res.json())?.routes?.[0]?.summary;
        if (sum && typeof sum.duration === "number") return { km: Math.round(sum.distance / 1000), minutes: roundMins(sum.duration) };
      }
    } catch { /* fall through */ }
  }

  if (geoapify) {
    try {
      const url = `https://api.geoapify.com/v1/routing?waypoints=${dstLat},${dstLng}|${originLat},${originLng}&mode=drive&apiKey=${geoapify}`;
      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const props = (await res.json())?.features?.[0]?.properties;
        if (props && typeof props.time === "number") return { km: Math.round(props.distance / 1000), minutes: roundMins(props.time) };
      }
    } catch { /* fall through */ }
  }

  return null;
}

export async function getTransfer(lat: number, lng: number): Promise<Transfer | null> {
  const a = nearestAirport(lat, lng);
  if (!a) return null;

  const key = `${lat.toFixed(4)},${lng.toFixed(4)}->${a.code}`;
  const cached = await prisma.routeCache.findUnique({ where: { key } }).catch(() => null);
  if (cached) return { ...a, km: cached.km, minutes: cached.minutes, source: cached.source === "estimate" ? "estimate" : "precise" };

  const dest = CITY_COORDS[a.code];
  const road = dest ? await fetchRoad(lat, lng, dest[0], dest[1]) : null;

  const result: Transfer = road
    ? { ...a, km: road.km, minutes: road.minutes, source: "precise" }
    : { ...a, source: "estimate" };

  // Cache both outcomes (a failed road lookup caches the estimate so we don't
  // re-hit ORS on every view of an island resort).
  await prisma.routeCache.create({
    data: { key, km: result.km ?? a.distanceKm, minutes: result.minutes, source: result.source },
  }).catch(() => {});

  return result;
}
