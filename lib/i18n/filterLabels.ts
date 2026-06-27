// The Discover listing pages (Hotels, Cruises, Packages, Experiences) filter
// by region/category. Those values must stay in English because they are
// matched against the database's `region`/`category` fields — but the chip
// the user SEES should be translated. This maps each known filter value to
// a translation key; unknown/data-driven values fall back to the raw value.
const FILTER_KEYS: Record<string, string> = {
  "All": "filter.all",
  "Worldwide": "filter.worldwide",
  // Hotel regions
  "India": "filter.india",
  "Middle East": "filter.middleEast",
  "Southeast Asia": "filter.southeastAsia",
  "Maldives & Indian Ocean": "filter.maldivesIndianOcean",
  "Bhutan & Himalayas": "filter.bhutanHimalayas",
  "East Asia & Pacific": "filter.eastAsiaPacific",
  "Africa": "filter.africa",
  "Europe": "filter.europe",
  "The Americas": "filter.theAmericas",
  // Hotel categories
  "heritage": "filter.heritage",
  "urban": "filter.urban",
  "resort": "filter.resort",
  "wellness": "filter.wellness",
  "safari": "filter.safari",
  "boutique": "filter.boutique",
  // Cruise regions
  "Caribbean": "filter.caribbean",
  "Mediterranean": "filter.mediterranean",
  "Alaska": "filter.alaska",
  "Norwegian Fjords": "filter.norwegianFjords",
  "Antarctica": "filter.antarctica",
  "Galápagos": "filter.galapagos",
  "Asia & Far East": "filter.asiaFarEast",
  "Nile & Egypt": "filter.nileEgypt",
  "European Rivers": "filter.europeanRivers",
  "Transatlantic": "filter.transatlantic",
  "World Cruise": "filter.worldCruise",
  "South Pacific": "filter.southPacific",
  "Indian Ocean": "filter.indianOcean",
  "Baltic & Scandinavia": "filter.balticScandinavia",
  // Cruise categories
  "ultra-luxury": "filter.ultraLuxury",
  "luxury": "filter.luxury",
  "expedition": "filter.expedition",
  "river": "filter.river",
  "family": "filter.family",
  // Package categories
  "Heritage": "filter.heritage",
  "Beach & Culture": "filter.beachCulture",
  "Luxury European": "filter.luxuryEuropean",
  "Spiritual": "filter.spiritual",
  "Safari & Beach": "filter.safariBeach",
  "Adventure": "filter.adventure",
  "Desert Expedition": "filter.desertExpedition",
  "Island Escape": "filter.islandEscape",
  // Experience categories
  "adventure": "filter.adventure",
  "wildlife": "filter.wildlife",
  "cultural": "filter.cultural",
  "culinary": "filter.culinary",
  "spiritual": "filter.spiritual",
  // Hotel amenity filters
  "Pool": "filter.pool",
  "Spa": "filter.spa",
  "Gym": "filter.gym",
  "Restaurant": "filter.restaurant",
  "Bar": "filter.bar",
  "Private Beach": "filter.privateBeach",
  "Butler": "filter.butler",
  "Yoga": "filter.yoga",
};

export function filterLabel(t: (k: string) => string, value: string): string {
  const key = FILTER_KEYS[value];
  return key ? t(key) : value;
}
