// Best-time-to-visit data, keyed by country. Each entry is a 12-month rating
// (index 0 = January … 11 = December): 2 = ideal, 1 = good / shoulder, 0 = less
// ideal (monsoon, extreme heat/cold, hurricane season). Curated for the main
// destination countries; unknown countries return null so the card just hides.

export type Season = { months: number[]; note: string };

const DATA: Record<string, Season> = {
  India: { months: [2, 2, 1, 1, 0, 0, 0, 0, 1, 2, 2, 2], note: "Cool and dry Oct–Mar; avoid the summer heat and the Jul–Sep monsoon." },
  Maldives: { months: [2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2], note: "Dry and sunny Dec–Apr; May–Nov brings short showers and better value." },
  "Sri Lanka": { months: [2, 2, 2, 1, 0, 0, 1, 1, 0, 0, 1, 2], note: "Dec–Mar for the south and west coasts; the island has two monsoons." },
  Thailand: { months: [2, 2, 1, 1, 1, 0, 0, 0, 0, 1, 2, 2], note: "Nov–Feb is cool and dry; Jun–Oct is the lush, rainy green season." },
  Indonesia: { months: [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1], note: "Dry season Apr–Oct is ideal; the wet season is quieter and lush." },
  Vietnam: { months: [2, 2, 2, 1, 1, 1, 1, 1, 1, 2, 2, 2], note: "A long country with varied weather — Oct–Apr suits most itineraries." },
  Cambodia: { months: [2, 2, 1, 1, 0, 0, 0, 0, 1, 1, 2, 2], note: "Nov–Feb is cool and dry — the best time for Angkor." },
  Laos: { months: [2, 2, 1, 1, 0, 0, 0, 0, 1, 2, 2, 2], note: "Nov–Feb is cool and dry; the rains arrive May–Sep." },
  Myanmar: { months: [2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2, 2], note: "Nov–Feb is dry and comfortable." },
  Malaysia: { months: [1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], note: "Warm and humid year-round; the west coast is driest Feb–Apr." },
  Singapore: { months: [1, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1], note: "Warm and humid all year; Feb–Apr is slightly drier." },
  Philippines: { months: [2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 1, 2], note: "Dec–Apr is the dry season; avoid the Aug–Sep typhoon peak." },
  Japan: { months: [1, 1, 2, 2, 1, 1, 0, 0, 1, 2, 2, 1], note: "Mar–Apr cherry blossom and Oct–Nov autumn foliage are the highlights." },
  China: { months: [0, 0, 1, 2, 2, 1, 1, 1, 2, 2, 1, 0], note: "Spring and autumn are mildest; summers are hot and winters cold." },
  "South Korea": { months: [0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 1, 0], note: "Apr–May blossoms and Sep–Oct foliage are the finest seasons." },
  Nepal: { months: [1, 1, 2, 2, 1, 0, 0, 0, 1, 2, 2, 1], note: "Oct–Nov and Mar–Apr bring clear skies and mountain views." },
  Bhutan: { months: [1, 1, 2, 2, 1, 0, 0, 0, 1, 2, 2, 1], note: "Oct–Nov and Mar–Apr: clear valleys and pleasant trekking." },
  UAE: { months: [2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2], note: "Nov–Mar is warm and pleasant; the summer is intensely hot." },
  Oman: { months: [2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2], note: "Nov–Mar is warm and dry; summer is extremely hot." },
  Qatar: { months: [2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2], note: "Nov–Mar is the comfortable season; avoid the searing summer." },
  Bahrain: { months: [2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2], note: "Nov–Mar is mild and pleasant." },
  Kuwait: { months: [2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2], note: "Nov–Mar is the coolest, most comfortable season." },
  "Saudi Arabia": { months: [2, 2, 2, 1, 0, 0, 0, 0, 0, 1, 2, 2], note: "Nov–Mar is the mild season across most of the kingdom." },
  Jordan: { months: [1, 1, 2, 2, 2, 1, 0, 0, 1, 2, 2, 1], note: "Spring and autumn are ideal for Petra and the desert." },
  Israel: { months: [1, 1, 2, 2, 2, 1, 0, 0, 1, 2, 2, 1], note: "Spring and autumn offer the most comfortable weather." },
  Lebanon: { months: [0, 0, 1, 2, 2, 2, 1, 1, 2, 2, 1, 0], note: "Late spring to autumn is warm and dry." },
  Egypt: { months: [2, 2, 2, 1, 1, 0, 0, 0, 1, 2, 2, 2], note: "Oct–Apr is comfortable for the Nile and the sites; summer is fierce." },
  Morocco: { months: [1, 1, 2, 2, 2, 1, 1, 1, 2, 2, 1, 1], note: "Spring and autumn are ideal; inland summers are very hot." },
  Tunisia: { months: [1, 1, 1, 2, 2, 1, 1, 1, 2, 2, 1, 1], note: "Spring and autumn bring warm days and mild evenings." },
  Turkey: { months: [0, 0, 1, 2, 2, 1, 1, 1, 2, 2, 1, 0], note: "Apr–Jun and Sep–Oct are warm with lighter crowds." },
  Kenya: { months: [2, 2, 1, 0, 0, 2, 2, 2, 2, 1, 0, 1], note: "Jun–Oct dry season for the migration; Jan–Feb is also excellent." },
  Tanzania: { months: [2, 2, 1, 0, 0, 2, 2, 2, 2, 1, 0, 1], note: "Jun–Oct is prime safari season; Jan–Feb offers superb game viewing." },
  "South Africa": { months: [2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 2], note: "Wonderful year-round — the coast in summer, dry winter for safari." },
  Zambia: { months: [1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 0, 1], note: "May–Oct dry season is best for wildlife and the falls." },
  Uganda: { months: [1, 1, 1, 0, 0, 2, 2, 2, 1, 0, 0, 1], note: "Jun–Aug and Dec–Feb dry spells are best for gorilla trekking." },
  Ethiopia: { months: [2, 2, 1, 1, 1, 0, 0, 0, 1, 2, 2, 2], note: "Oct–Mar dry season is ideal for the historic north." },
  Mauritius: { months: [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1], note: "Cooler and drier May–Dec; cyclones are possible Jan–Mar." },
  Seychelles: { months: [1, 1, 1, 2, 2, 1, 1, 1, 1, 2, 2, 1], note: "Apr–May and Oct–Nov are calm and clear between the trade winds." },
  Italy: { months: [1, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1], note: "Spring and Sep–Oct: warm days with lighter crowds than peak summer." },
  France: { months: [1, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1], note: "Late spring and early autumn are mild and less crowded." },
  Spain: { months: [1, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 1], note: "Spring and autumn are ideal; interior summers are hot." },
  Portugal: { months: [1, 1, 1, 2, 2, 2, 2, 1, 2, 2, 1, 1], note: "Apr–Jun and Sep–Oct offer warm days and fewer crowds." },
  Greece: { months: [0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0], note: "May–Jun and Sep–Oct: warm seas without the August rush." },
  Croatia: { months: [0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0], note: "May–Jun and September are the sweet spot on the Adriatic." },
  Montenegro: { months: [0, 0, 1, 1, 2, 2, 1, 1, 2, 2, 1, 0], note: "Late spring and September are warm and uncrowded." },
  UK: { months: [0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 0, 0], note: "May–Sep is mildest and greenest; pack for changeable weather." },
  Ireland: { months: [0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 0, 0], note: "May–Sep offers the longest days and mildest weather." },
  Germany: { months: [0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 0, 1], note: "May–Sep is warmest; Dec brings the famous Christmas markets." },
  Netherlands: { months: [0, 0, 1, 2, 2, 2, 2, 2, 2, 1, 0, 0], note: "Apr for the tulips; May–Sep for the mildest weather." },
  Switzerland: { months: [2, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2], note: "Summer for hiking, Dec–Mar for skiing; shoulder months are quiet." },
  Austria: { months: [2, 2, 1, 1, 2, 2, 2, 2, 2, 1, 1, 2], note: "Summer for the lakes and Alps, winter for the ski season." },
  Iceland: { months: [1, 1, 1, 1, 2, 2, 2, 2, 2, 1, 1, 1], note: "Jun–Aug for the midnight sun; winter for the northern lights." },
  Norway: { months: [1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1], note: "Jun–Aug for the fjords and midnight sun; winter for the aurora." },
  Sweden: { months: [1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1], note: "Jun–Aug is warm and bright; winter is crisp and dark." },
  Finland: { months: [1, 1, 1, 1, 2, 2, 2, 2, 1, 1, 1, 1], note: "Summer for the lakes, winter for the Lapland snow and aurora." },
  USA: { months: [0, 0, 1, 2, 2, 2, 1, 1, 2, 2, 1, 0], note: "Spring and autumn are mildest nationwide; regions vary widely." },
  Canada: { months: [0, 0, 1, 1, 2, 2, 2, 2, 2, 1, 0, 1], note: "Jun–Sep is warmest; autumn colours peak in September–October." },
  Mexico: { months: [2, 2, 2, 2, 1, 1, 1, 1, 0, 1, 2, 2], note: "Nov–Apr is dry and sunny; the coast is quieter (wetter) in summer." },
  "Costa Rica": { months: [2, 2, 2, 1, 1, 1, 1, 1, 0, 0, 1, 2], note: "Dec–Apr is the dry season; the green season is lush and quiet." },
  Brazil: { months: [2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2], note: "Dec–Mar is peak summer; each region has its own rhythm." },
  Peru: { months: [1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1, 1], note: "May–Sep dry season is best for Machu Picchu and the highlands." },
  Argentina: { months: [2, 2, 2, 1, 1, 0, 0, 0, 1, 2, 2, 2], note: "Oct–Apr is warm; Patagonia is best Nov–Mar." },
  Chile: { months: [2, 2, 2, 1, 1, 0, 0, 0, 1, 2, 2, 2], note: "Oct–Apr suits most of the country; Patagonia peaks Dec–Feb." },
  Ecuador: { months: [2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2], note: "The Galápagos are rewarding year-round; the highlands are driest Jun–Sep." },
  Colombia: { months: [2, 2, 1, 1, 1, 2, 2, 2, 1, 0, 0, 2], note: "Dec–Mar and Jul–Aug are the drier, brighter windows." },
  Australia: { months: [2, 2, 2, 1, 1, 0, 0, 1, 1, 2, 2, 2], note: "Sep–Nov and Mar–May are mild countrywide; the north is best in the dry (May–Oct)." },
  "New Zealand": { months: [2, 2, 2, 1, 1, 0, 0, 0, 1, 1, 2, 2], note: "Dec–Mar is warm and long-dayed; the ski season runs Jun–Aug." },
  Fiji: { months: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1], note: "May–Oct is the drier, cooler season — ideal for the islands." },
  "French Polynesia": { months: [1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 1, 1], note: "May–Oct is dry and sunny across Tahiti and Bora Bora." },
  Bahamas: { months: [2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 2, 2], note: "Dec–Apr is dry and sunny; watch hurricane season Aug–Oct." },
  Jamaica: { months: [2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 2, 2], note: "Dec–Apr is the dry, sunny peak; Aug–Oct is hurricane season." },
  "Dominican Republic": { months: [2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 2, 2], note: "Dec–Apr is driest and sunniest; avoid the Aug–Oct storms." },
  Cuba: { months: [2, 2, 2, 2, 1, 1, 1, 0, 0, 1, 2, 2], note: "Dec–Apr is the dry season; summer is hot and wetter." },
};

// Common name aliases → the canonical key above.
const ALIAS: Record<string, string> = {
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
  "United States": "USA",
};

export function getSeasonality(country?: string | null): Season | null {
  if (!country) return null;
  return DATA[country] ?? DATA[ALIAS[country] ?? ""] ?? null;
}

// Countries whose given month (0=Jan…11=Dec) is peak/ideal — used to suggest
// sunny alternatives when a traveller's destination is looking wet.
export function peakSeasonCountries(month: number): string[] {
  return Object.entries(DATA).filter(([, s]) => s.months[month] === 2).map(([c]) => c);
}
