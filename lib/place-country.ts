import { CITIES } from "@/lib/mock-data";

// Resolves a country for a place name so the destination companion (emergency
// numbers, local time, phrasebook, currency, offline-save…) works on cruises and
// packages that only store a city, port or region. Handles accents and places
// that aren't in the airport dataset.

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const CITY_COUNTRY = new Map<string, string>();
for (const c of CITIES) {
  if (c.name && c.country) CITY_COUNTRY.set(norm(c.name), c.country);
}

// Regions, small towns, islands and cities not in the airport reference data.
const EXTRA: Record<string, string> = {
  paris: "France", provence: "France", nice: "France", tuscany: "Italy", chianti: "Italy",
  "grand canyon": "USA", "el calafate": "Argentina", sossusvlei: "Namibia", ubud: "Indonesia",
  seminyak: "Indonesia", paro: "Bhutan", thimphu: "Bhutan", queenstown: "New Zealand",
  cartagena: "Colombia", papeete: "French Polynesia", tahiti: "French Polynesia", "bora bora": "French Polynesia",
  oahu: "USA", honolulu: "USA", maui: "USA", "big island": "USA", mahe: "Seychelles",
  "cape town": "South Africa", marrakech: "Morocco", edinburgh: "UK", "rio de janeiro": "Brazil",
  vik: "Iceland", jokulsarlon: "Iceland", serengeti: "Tanzania", zanzibar: "Tanzania",
  petra: "Jordan", "wadi rum": "Jordan", luxor: "Egypt", "siem reap": "Cambodia",
  "hoi an": "Vietnam", agra: "India", ranthambore: "India", udaipur: "India",
  jodhpur: "India", rishikesh: "India", goa: "India",
};

function lookupOne(part?: string): string {
  if (!part) return "";
  const k = norm(part);
  return EXTRA[k] || CITY_COUNTRY.get(k) || "";
}

export function countryForPlace(name: string | null | undefined): string {
  if (!name) return "";
  const n = name.trim();

  if (n.includes(",")) {
    const parts = n.split(",").map(p => p.trim());
    // A named place after the comma may be a region ("Papeete, Tahiti") — resolve
    // it if we know it; otherwise resolve any part as a city; else treat the tail
    // as the country itself ("Barcelona, Spain").
    for (const p of parts) { const r = lookupOne(p); if (r) return r; }
    return parts[parts.length - 1];
  }

  return lookupOne(n);
}
