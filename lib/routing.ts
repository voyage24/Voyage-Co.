import { prisma } from "@/lib/prisma";
import { CITY_COORDS } from "@/lib/geo";
import { nearestAirport, type NearestAirport } from "@/lib/nearest-airport";

// Precise airport transfer time via OpenRouteService (free key: ORS_API_KEY),
// computed once per property and cached forever in RouteCache — so it's instant
// on later views and self-populates for every existing/new property. Falls back
// to the distance estimate when no road route exists (islands) or no key is set.

export type Transfer = NearestAirport & { source: "precise" | "estimate"; km?: number };

// Routing engines return free-flow times (no traffic, optimistic on rural/
// mountain roads). Pad ~30% toward real-world conditions and round to 5 min, so
// guest-facing transfers lean realistic rather than underquoting.
const roundMins = (secs: number) => Math.max(5, Math.round((secs * 1.3) / 60 / 5) * 5);

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
        headers: { Authorization: ors, "Content-Type": "application/json", Accept: "application/json" },
        // ORS wants [lng, lat]. radiuses [-1,-1] = snap each point to the
        // nearest road with no distance limit (airport reference points sit on
        // the runway, well beyond the 350m default).
        body: JSON.stringify({ coordinates: [[dstLng, dstLat], [originLng, originLat]], radiuses: [-1, -1] }),
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

  const key = `v2:${lat.toFixed(4)},${lng.toFixed(4)}->${a.code}`; // v2 = buffered times
  // Only trust cached PRECISE times — a cached "estimate" is treated as a miss
  // and retried, so a transient failure (or views before the key was set) never
  // locks a property to the estimate permanently.
  const cached = await prisma.routeCache.findUnique({ where: { key } }).catch(() => null);
  if (cached && cached.source === "precise") return { ...a, km: cached.km, minutes: cached.minutes, source: "precise" };

  const dest = CITY_COORDS[a.code];
  const road = dest ? await fetchRoad(lat, lng, dest[0], dest[1]) : null;

  if (road) {
    await prisma.routeCache.upsert({
      where: { key },
      create: { key, km: road.km, minutes: road.minutes, source: "precise" },
      update: { km: road.km, minutes: road.minutes, source: "precise" },
    }).catch(() => {});
    return { ...a, km: road.km, minutes: road.minutes, source: "precise" };
  }

  // No road route (islands) or no key — show the estimate, not cached, so it
  // upgrades automatically once routing succeeds.
  return { ...a, source: "estimate" };
}
