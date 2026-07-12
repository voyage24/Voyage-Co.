// "If you liked X, you'll like Y" — a curated destination-affinity map used to
// turn a member's taste (a country they've saved/booked/viewed) into a warm,
// specific next suggestion. Reasons are written to feel hand-picked.

export type Affinity = { to: string; reason: string };

const MAP: Record<string, Affinity> = {
  Maldives: { to: "Mauritius", reason: "the same barefoot-luxury island escape, with mountains and culture to explore ashore" },
  Mauritius: { to: "Seychelles", reason: "pristine granite-boulder beaches and rare island wildlife" },
  Seychelles: { to: "Maldives", reason: "overwater villas and house reefs steps from your door" },
  "Sri Lanka": { to: "India", reason: "temples, tea country and wildlife on a grander canvas" },
  India: { to: "Sri Lanka", reason: "a gentler, greener slice of the subcontinent" },
  Thailand: { to: "Vietnam", reason: "the same warm welcome with dramatic landscapes and standout food" },
  Vietnam: { to: "Cambodia", reason: "the temples of Angkor and a slower, soulful pace" },
  Indonesia: { to: "Thailand", reason: "island beaches paired with rich temple culture" },
  UAE: { to: "Oman", reason: "the Gulf's quieter, more scenic side — mountains, wadis and old forts" },
  Oman: { to: "Jordan", reason: "desert grandeur, ancient sites and starlit camps" },
  Italy: { to: "Greece", reason: "sun-drenched coastlines, ancient wonders and unhurried meals" },
  Greece: { to: "Croatia", reason: "the Adriatic's island-hopping and walled old towns" },
  Croatia: { to: "Montenegro", reason: "the same jewel coast, quieter and dramatically mountainous" },
  France: { to: "Italy", reason: "world-class food, wine and effortless style" },
  Spain: { to: "Portugal", reason: "Atlantic coast, historic cities and long, warm evenings" },
  Portugal: { to: "Spain", reason: "vibrant cities, coastline and cuisine" },
  Switzerland: { to: "Austria", reason: "alpine grandeur, glassy lakes and storybook villages" },
  Austria: { to: "Switzerland", reason: "the definitive Alps — peaks, trains and mountain spas" },
  Japan: { to: "South Korea", reason: "refined cities, exceptional food and seasonal beauty" },
  "South Korea": { to: "Japan", reason: "temples, bullet trains and cherry blossom" },
  Kenya: { to: "Tanzania", reason: "the Serengeti and Ngorongoro — the migration's other half" },
  Tanzania: { to: "South Africa", reason: "Big Five safaris plus winelands and a spectacular coast" },
  "South Africa": { to: "Kenya", reason: "the Masai Mara and the Great Rift Valley" },
  Morocco: { to: "Egypt", reason: "ancient wonders, bustling souks and desert nights" },
  Egypt: { to: "Jordan", reason: "Petra, Wadi Rum and the Dead Sea" },
  Turkey: { to: "Greece", reason: "Aegean coastlines, ruins and warm island hospitality" },
  Iceland: { to: "Norway", reason: "fjords, waterfalls and the northern lights" },
  Norway: { to: "Iceland", reason: "glaciers, geysers and midnight sun" },
  USA: { to: "Canada", reason: "epic national parks and cosmopolitan cities" },
  Mexico: { to: "Costa Rica", reason: "rainforest, wildlife and Pacific beaches" },
  Peru: { to: "Chile", reason: "the Atacama, Patagonia and soaring Andes" },
  Australia: { to: "New Zealand", reason: "wild coastlines, adventure and unspoilt nature" },
  "New Zealand": { to: "Australia", reason: "reefs, outback and world-class cities" },
};

const ALIAS: Record<string, string> = { "United Arab Emirates": "UAE", "United Kingdom": "UK", "United States": "USA" };

export function affinityFor(country?: string | null): Affinity | null {
  if (!country) return null;
  return MAP[country] ?? MAP[ALIAS[country] ?? ""] ?? null;
}
