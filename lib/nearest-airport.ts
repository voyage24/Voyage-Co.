import { CITY_COORDS } from "@/lib/geo";
import { CITIES } from "@/lib/mock-data";

// Nearest airport to a property, computed from coordinates — so it works for
// every existing property and any new one automatically, with no manual entry.
// Airport coordinates come from CITY_COORDS (IATA → lat/lng); names from CITIES.
// Transfer time is a distance-based ESTIMATE (surfaced as "approx."), since real
// road/sea routing would need a paid routing API.

export type NearestAirport = {
  code: string;        // IATA, e.g. "BLR"
  name: string;        // "Kempegowda International Airport"
  city: string;        // "Bangalore"
  distanceKm: number;  // straight-line
  minutes: number;     // estimated transfer time
};

const NAME = new Map(CITIES.map(c => [c.code, { name: c.fullName || `${c.name} Airport`, city: c.name }]));

function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const R = 6371;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

// Estimated transfer time: straight-line distance padded ~25% for real routing,
// at a blended ~55 km/h average. Rounded to the nearest 5 minutes.
function estimateMinutes(distanceKm: number): number {
  const roadKm = distanceKm * 1.25;
  const mins = (roadKm / 55) * 60;
  return Math.max(5, Math.round(mins / 5) * 5);
}

export function nearestAirport(lat: number, lng: number): NearestAirport | null {
  let best: { code: string; km: number } | null = null;
  for (const code in CITY_COORDS) {
    const [alat, alng] = CITY_COORDS[code];
    const km = haversineKm(lat, lng, alat, alng);
    if (!best || km < best.km) best = { code, km };
  }
  if (!best) return null;
  const meta = NAME.get(best.code);
  return {
    code: best.code,
    name: meta?.name || `${best.code} Airport`,
    city: meta?.city || best.code,
    distanceKm: Math.round(best.km),
    minutes: estimateMinutes(best.km),
  };
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
