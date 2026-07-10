import { CITIES } from "@/lib/mock-data";

// Resolves a country for a place name so the destination companion (emergency
// numbers, local time, phrasebook) can work on cruises/packages that only store
// a city or port. Ports embed the country ("Barcelona, Spain"); bare city names
// ("Delhi") are looked up against the CITIES reference data.
const CITY_COUNTRY = new Map<string, string>();
for (const c of CITIES) {
  if (c.name && c.country) CITY_COUNTRY.set(c.name.toLowerCase(), c.country);
}

export function countryForPlace(name: string | null | undefined): string {
  if (!name) return "";
  const n = name.trim();
  if (n.includes(",")) return n.split(",").pop()!.trim(); // "Barcelona, Spain" → "Spain"
  return CITY_COUNTRY.get(n.toLowerCase()) || "";
}
