// Deterministic "featured this week" rotation — no backend/cron needed.
// Advances through the full list by `count` items every 7 days, wrapping
// around, so the same items show all week and the set fully cycles through
// the catalogue over time.
export function getWeeklyFeatured<T>(items: T[], count: number): T[] {
  if (items.length <= count) return items;
  const weekIndex = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  const start = (weekIndex * count) % items.length;
  const result: T[] = [];
  for (let i = 0; i < count; i++) {
    result.push(items[(start + i) % items.length]);
  }
  return result;
}

// Recognizable global chains every traveller knows on sight — the weekly
// hotel rotation reserves roughly half its slots for these so they always
// show up, with the rest going to niche, country-specific brands (Oberoi,
// Leela Palaces, Taj, Belmond, Hoshinoya, La Mamounia, Badrutt's...) for
// local flavour.
const SIGNATURE_CHAINS = [
  "Aman", "Four Seasons", "Six Senses", "Rosewood", "Kempinski",
  "Mandarin Oriental", "Peninsula", "Ritz-Carlton", "Shangri-La", "St. Regis", "Waldorf Astoria", "Regent",
];

export function getWeeklyFeaturedHotels<T extends { name: string; region: string; brand?: string | null }>(hotels: T[], count: number): T[] {
  // Prefer the real brand field when present (the master-dataset imports);
  // fall back to a name match for the original curated entries, which
  // predate that field.
  const isSignature = (h: T) =>
    h.brand ? SIGNATURE_CHAINS.includes(h.brand) : SIGNATURE_CHAINS.some(chain => h.name.includes(chain));
  const signature = hotels.filter(isSignature);
  const niche = hotels.filter(h => !isSignature(h));

  const signatureSlots = Math.min(signature.length, Math.ceil(count / 2));
  const nicheSlots = count - signatureSlots;

  // Spread the niche half across as many distinct regions as possible (and
  // rotate which regions get picked, week to week) so the map always reads
  // as genuinely worldwide — Asia, Europe, the Americas and more — instead
  // of clustering wherever the raw rotation happens to land.
  const regionGroups = new Map<string, T[]>();
  for (const h of niche) {
    if (!regionGroups.has(h.region)) regionGroups.set(h.region, []);
    regionGroups.get(h.region)!.push(h);
  }
  const regions = Array.from(regionGroups.keys()).sort();
  const chosenRegions = getWeeklyFeatured(regions, Math.min(regions.length, nicheSlots));
  const nicheHotels = chosenRegions.map(region => getWeeklyFeatured(regionGroups.get(region)!, 1)[0]);

  return [
    ...getWeeklyFeatured(signature, signatureSlots),
    ...nicheHotels,
  ];
}
