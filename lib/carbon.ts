// Flight carbon estimate for a trip. Great-circle distance between two airports
// × an emissions factor (economy, including the high-altitude / radiative-forcing
// uplift), doubled for the round trip. Deliberately labelled "estimate" — real
// figures depend on aircraft, load and cabin.

export type Gateway = { code: string; label: string; lat: number; lng: number };

// A handful of major global departure gateways to pick from.
export const GATEWAYS: Gateway[] = [
  { code: "DEL", label: "Delhi", lat: 28.5562, lng: 77.1000 },
  { code: "BOM", label: "Mumbai", lat: 19.0896, lng: 72.8656 },
  { code: "BLR", label: "Bengaluru", lat: 13.1986, lng: 77.7066 },
  { code: "DXB", label: "Dubai", lat: 25.2532, lng: 55.3657 },
  { code: "LHR", label: "London", lat: 51.4700, lng: -0.4543 },
  { code: "CDG", label: "Paris", lat: 49.0097, lng: 2.5479 },
  { code: "FRA", label: "Frankfurt", lat: 50.0379, lng: 8.5622 },
  { code: "JFK", label: "New York", lat: 40.6413, lng: -73.7781 },
  { code: "LAX", label: "Los Angeles", lat: 33.9416, lng: -118.4085 },
  { code: "SIN", label: "Singapore", lat: 1.3644, lng: 103.9915 },
  { code: "HKG", label: "Hong Kong", lat: 22.3080, lng: 113.9185 },
  { code: "SYD", label: "Sydney", lat: -33.9399, lng: 151.1753 },
];

const R = 6371;
const toRad = (d: number) => (d * Math.PI) / 180;

export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Economy-class emissions factor (kg CO2e per passenger-km), tiered by haul and
// including a radiative-forcing multiplier — broadly in line with DEFRA figures.
function factor(km: number): number {
  if (km < 1500) return 0.156;   // short-haul
  if (km < 3500) return 0.135;   // medium-haul
  return 0.148;                  // long-haul
}

export type CarbonResult = { km: number; kg: number; trees: number };

// Round-trip economy estimate between an origin and destination airport.
export function estimateFlightCarbon(oLat: number, oLng: number, dLat: number, dLng: number): CarbonResult {
  const km = Math.round(haversineKm(oLat, oLng, dLat, dLng));
  const kg = Math.round(km * 2 * factor(km));
  // A mature tree sequesters ~21 kg CO2 per year.
  const trees = Math.max(1, Math.round(kg / 21));
  return { km, kg, trees };
}
