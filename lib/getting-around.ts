// "Getting around" reference per country: which side they drive on, the
// ride-hailing apps that actually work there, and a one-line note on public
// transport. Curated for the main destinations; unknown countries hide the card.

export type GettingAround = {
  driveSide: "left" | "right";
  apps: string[];      // ride-hailing apps that work locally
  transit: string;     // one-line public-transport note
};

const DATA: Record<string, GettingAround> = {
  India: { driveSide: "left", apps: ["Uber", "Ola"], transit: "Metros in Delhi, Mumbai & Bengaluru; app cabs and prepaid taxis elsewhere." },
  Maldives: { driveSide: "left", apps: [], transit: "Getting around is by resort speedboat or seaplane transfer — arranged for you." },
  "Sri Lanka": { driveSide: "left", apps: ["PickMe", "Uber"], transit: "PickMe tuk-tuks/cars in Colombo; private drivers are the easy way to tour." },
  Nepal: { driveSide: "left", apps: ["Pathao", "inDrive"], transit: "Taxis and private cars; ride apps work in Kathmandu." },
  Bhutan: { driveSide: "left", apps: [], transit: "Travel is by private car with a licensed guide/driver — arranged for you." },
  Thailand: { driveSide: "left", apps: ["Grab", "Bolt"], transit: "Bangkok's BTS Skytrain & MRT are excellent; Grab everywhere else." },
  Indonesia: { driveSide: "left", apps: ["Grab", "Gojek"], transit: "Grab/Gojek cars & scooters are the norm; Bali has no real transit." },
  Vietnam: { driveSide: "right", apps: ["Grab", "Be"], transit: "Grab cars & bikes are cheap and ubiquitous in the cities." },
  Cambodia: { driveSide: "right", apps: ["Grab", "PassApp"], transit: "Grab and tuk-tuks (via PassApp) around Phnom Penh & Siem Reap." },
  Malaysia: { driveSide: "left", apps: ["Grab"], transit: "KL's LRT/MRT is good; Grab fills the gaps affordably." },
  Singapore: { driveSide: "left", apps: ["Grab", "Gojek"], transit: "World-class MRT covers the island; Grab for door-to-door." },
  Philippines: { driveSide: "right", apps: ["Grab"], transit: "Grab in Manila & Cebu; boats and short flights between islands." },
  Japan: { driveSide: "left", apps: ["GO"], transit: "Superb trains (Shinkansen/JR); hail taxis or use the GO app — little Uber." },
  China: { driveSide: "right", apps: ["DiDi"], transit: "Excellent high-speed rail & metros; DiDi (in-app English) for taxis." },
  "Hong Kong": { driveSide: "left", apps: ["Uber"], transit: "The MTR is fast and cheap; the Octopus card covers everything." },
  "South Korea": { driveSide: "right", apps: ["Kakao T"], transit: "Seoul's metro is superb; Kakao T for taxis (no Uber)." },
  UAE: { driveSide: "right", apps: ["Careem", "Uber"], transit: "Dubai Metro plus Careem/Uber; taxis are plentiful and metered." },
  Oman: { driveSide: "right", apps: ["Careem", "Otaxi"], transit: "A rental car or private driver is the easiest way to explore." },
  Qatar: { driveSide: "right", apps: ["Careem", "Uber"], transit: "Doha Metro is modern; Karwa taxis and Careem fill in." },
  Bahrain: { driveSide: "right", apps: ["Careem", "Uber"], transit: "Compact island — taxis and ride apps get you everywhere." },
  "Saudi Arabia": { driveSide: "right", apps: ["Careem", "Uber"], transit: "Careem/Uber are the norm; Riyadh's metro is opening line by line." },
  Jordan: { driveSide: "right", apps: ["Careem", "Uber"], transit: "Careem in Amman; private drivers to reach Petra & Wadi Rum." },
  Israel: { driveSide: "right", apps: ["Gett", "Yango"], transit: "Good buses/light rail; Gett for taxis (limited service on Shabbat)." },
  Egypt: { driveSide: "right", apps: ["Uber", "Careem"], transit: "Uber/Careem in Cairo are cheap and avoid fare haggling." },
  Morocco: { driveSide: "right", apps: ["Careem"], transit: "'Petit taxis' in cities (agree the meter); trains link the main cities." },
  Turkey: { driveSide: "right", apps: ["BiTaksi", "Uber"], transit: "Istanbul's trams & metro are handy; use BiTaksi to book yellow taxis." },
  Kenya: { driveSide: "left", apps: ["Uber", "Bolt"], transit: "Uber/Bolt in Nairobi; light aircraft transfers to the safari camps." },
  Tanzania: { driveSide: "left", apps: ["Uber", "Bolt"], transit: "Ride apps in Dar & Arusha; bush flights link the safari circuits." },
  "South Africa": { driveSide: "left", apps: ["Uber", "Bolt"], transit: "Uber/Bolt are safe and easy in the cities; self-drive for the winelands." },
  Mauritius: { driveSide: "left", apps: [], transit: "A rental car or hotel driver is best; taxis are metered by arrangement." },
  Seychelles: { driveSide: "left", apps: [], transit: "Rent a car on Mahé/Praslin; ferries and short flights between islands." },
  Italy: { driveSide: "right", apps: ["FreeNow", "Uber"], transit: "Fast trains between cities; Uber is black-car only — use FreeNow for taxis." },
  France: { driveSide: "right", apps: ["Uber", "Bolt", "FreeNow"], transit: "The TGV links cities; Paris Métro is dense and cheap." },
  Spain: { driveSide: "right", apps: ["Uber", "Cabify", "FreeNow"], transit: "AVE high-speed rail plus excellent city metros." },
  Portugal: { driveSide: "right", apps: ["Uber", "Bolt"], transit: "Lisbon/Porto metros and trams; Uber & Bolt are cheap." },
  Greece: { driveSide: "right", apps: ["FreeNow", "Uber"], transit: "Athens metro; ferries between the islands (book ahead in summer)." },
  Germany: { driveSide: "right", apps: ["FreeNow", "Uber", "Bolt"], transit: "Superb rail (DB) and U-/S-Bahn networks in every city." },
  Netherlands: { driveSide: "right", apps: ["Uber", "Bolt"], transit: "Trains, trams and — of course — bikes everywhere." },
  Switzerland: { driveSide: "right", apps: ["Uber"], transit: "The rail network is famously precise; a Swiss Travel Pass is superb value." },
  Austria: { driveSide: "right", apps: ["Uber", "Bolt", "FreeNow"], transit: "Vienna's U-Bahn and the national rail are excellent." },
  UK: { driveSide: "left", apps: ["Uber", "Bolt"], transit: "The Tube and national rail; contactless taps you through in London." },
  Ireland: { driveSide: "left", apps: ["FreeNow", "Uber"], transit: "Dublin's LUAS/DART; hire a car for the countryside." },
  Iceland: { driveSide: "right", apps: [], transit: "Rent a car (or 4x4) — the Ring Road is the trip; no trains." },
  Norway: { driveSide: "right", apps: ["Bolt"], transit: "Scenic trains and ferries; a car helps for the fjord country." },
  Sweden: { driveSide: "right", apps: ["Uber", "Bolt"], transit: "Stockholm's Tunnelbana is excellent; trains link the cities." },
  USA: { driveSide: "right", apps: ["Uber", "Lyft"], transit: "Uber/Lyft everywhere; good metros in NYC, DC, Chicago — a car elsewhere." },
  Canada: { driveSide: "right", apps: ["Uber", "Lyft"], transit: "Uber/Lyft in the cities; transit is good in Toronto, Montréal & Vancouver." },
  Mexico: { driveSide: "right", apps: ["Uber", "DiDi"], transit: "Uber/DiDi are safer than street taxis; good metro in Mexico City." },
  "Costa Rica": { driveSide: "right", apps: ["Uber"], transit: "A 4x4 rental is ideal; Uber works in San José." },
  Brazil: { driveSide: "right", apps: ["Uber", "99"], transit: "Uber and 99 are the safe way around the big cities." },
  Argentina: { driveSide: "right", apps: ["Uber", "Cabify", "DiDi"], transit: "Buenos Aires has a metro (Subte); apps for taxis." },
  Peru: { driveSide: "right", apps: ["Uber", "Cabify", "DiDi"], transit: "Ride apps in Lima; trains/private transfers for the Sacred Valley." },
  Chile: { driveSide: "right", apps: ["Uber", "Cabify", "DiDi"], transit: "Santiago's metro is excellent; ride apps fill in." },
  Australia: { driveSide: "left", apps: ["Uber", "DiDi", "Ola"], transit: "Uber in every city; good trains/trams in Melbourne & Sydney." },
  "New Zealand": { driveSide: "left", apps: ["Uber"], transit: "Rent a car — the road trip is the point; Uber in Auckland/Wellington." },
  Fiji: { driveSide: "left", apps: [], transit: "Resort transfers, taxis and island boats; hire a car on the main island." },
  "French Polynesia": { driveSide: "right", apps: [], transit: "Getting around is by resort boat, ferry and inter-island flight." },
};

const ALIAS: Record<string, string> = {
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
  "United States": "USA",
};

export function getGettingAround(country?: string | null): GettingAround | null {
  if (!country) return null;
  return DATA[country] ?? DATA[ALIAS[country] ?? ""] ?? null;
}
