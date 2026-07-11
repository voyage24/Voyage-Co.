import { prisma } from "@/lib/prisma";
import { CITY_COORDS } from "@/lib/geo";
import { nearestAirport, type NearestAirport } from "@/lib/nearest-airport";

// Precise airport transfer time via OpenRouteService (free key: ORS_API_KEY),
// computed once per property and cached forever in RouteCache — so it's instant
// on later views and self-populates for every existing/new property. Falls back
// to the distance estimate when no road route exists (islands) or no key is set.

export type Transfer = NearestAirport & { source: "precise" | "estimate"; km?: number };

const roundMins = (secs: number) => Math.max(5, Math.round(secs / 60 / 5) * 5);

async function fetchRoad(originLat: number, originLng: number, dstLat: number, dstLng: number): Promise<{ km: number; minutes: number } | null> {
  const key = process.env.ORS_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
      method: "POST",
      headers: { Authorization: key, "Content-Type": "application/json" },
      // ORS expects [lng, lat]; route FROM airport TO property.
      body: JSON.stringify({ coordinates: [[dstLng, dstLat], [originLng, originLat]] }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const d = await res.json();
    const sum = d.routes?.[0]?.summary;
    if (!sum || typeof sum.duration !== "number") return null;
    return { km: Math.round(sum.distance / 1000), minutes: roundMins(sum.duration) };
  } catch {
    return null;
  }
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
