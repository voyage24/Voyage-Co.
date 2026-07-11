// Rough "what things cost" reference per country, in USD, so the card can
// convert to the guest's chosen currency. Indicative mid-market prices — a
// cappuccino, a short city taxi ride, a bottle of water and a mid-range dinner
// for one. Curated for the main destinations; unknown countries hide the card.

export type Costs = { coffee: number; taxi: number; water: number; dinner: number };

const DATA: Record<string, Costs> = {
  India: { coffee: 2.5, taxi: 2, water: 0.3, dinner: 8 },
  Maldives: { coffee: 5, taxi: 10, water: 2, dinner: 40 },
  "Sri Lanka": { coffee: 2, taxi: 2, water: 0.3, dinner: 6 },
  Nepal: { coffee: 2, taxi: 2, water: 0.3, dinner: 5 },
  Bhutan: { coffee: 2.5, taxi: 3, water: 0.4, dinner: 8 },
  Thailand: { coffee: 2.5, taxi: 4, water: 0.4, dinner: 8 },
  Indonesia: { coffee: 2.5, taxi: 3, water: 0.4, dinner: 7 },
  Vietnam: { coffee: 1.5, taxi: 3, water: 0.4, dinner: 6 },
  Cambodia: { coffee: 2.5, taxi: 3, water: 0.4, dinner: 7 },
  Malaysia: { coffee: 3, taxi: 4, water: 0.5, dinner: 8 },
  Singapore: { coffee: 4.5, taxi: 8, water: 1, dinner: 12 },
  Philippines: { coffee: 2.5, taxi: 3, water: 0.5, dinner: 8 },
  Japan: { coffee: 4, taxi: 8, water: 1, dinner: 12 },
  China: { coffee: 4, taxi: 4, water: 0.5, dinner: 10 },
  "Hong Kong": { coffee: 4.5, taxi: 8, water: 1, dinner: 15 },
  "South Korea": { coffee: 4, taxi: 6, water: 1, dinner: 10 },
  UAE: { coffee: 4.5, taxi: 6, water: 0.5, dinner: 25 },
  Oman: { coffee: 4, taxi: 6, water: 0.4, dinner: 20 },
  Qatar: { coffee: 4.5, taxi: 6, water: 0.5, dinner: 25 },
  Bahrain: { coffee: 4, taxi: 5, water: 0.4, dinner: 20 },
  "Saudi Arabia": { coffee: 4, taxi: 5, water: 0.4, dinner: 18 },
  Jordan: { coffee: 3.5, taxi: 4, water: 0.5, dinner: 15 },
  Israel: { coffee: 4, taxi: 10, water: 1.5, dinner: 25 },
  Egypt: { coffee: 2.5, taxi: 3, water: 0.3, dinner: 8 },
  Morocco: { coffee: 2, taxi: 3, water: 0.4, dinner: 10 },
  Tunisia: { coffee: 2, taxi: 3, water: 0.4, dinner: 10 },
  Turkey: { coffee: 3, taxi: 4, water: 0.4, dinner: 12 },
  Kenya: { coffee: 3, taxi: 6, water: 0.6, dinner: 12 },
  Tanzania: { coffee: 3, taxi: 6, water: 0.6, dinner: 12 },
  "South Africa": { coffee: 2.5, taxi: 8, water: 1, dinner: 15 },
  Mauritius: { coffee: 3, taxi: 8, water: 0.7, dinner: 18 },
  Seychelles: { coffee: 4, taxi: 15, water: 1.5, dinner: 30 },
  Italy: { coffee: 1.5, taxi: 12, water: 1.2, dinner: 22 },
  France: { coffee: 3.5, taxi: 12, water: 1.5, dinner: 22 },
  Spain: { coffee: 2, taxi: 8, water: 1, dinner: 18 },
  Portugal: { coffee: 1.5, taxi: 8, water: 1, dinner: 15 },
  Greece: { coffee: 3.5, taxi: 6, water: 0.6, dinner: 18 },
  Germany: { coffee: 3.5, taxi: 12, water: 1.5, dinner: 20 },
  Netherlands: { coffee: 3.5, taxi: 15, water: 1.5, dinner: 22 },
  Switzerland: { coffee: 5, taxi: 20, water: 2, dinner: 35 },
  Austria: { coffee: 3.5, taxi: 12, water: 1.5, dinner: 20 },
  UK: { coffee: 3.5, taxi: 12, water: 1.2, dinner: 25 },
  Ireland: { coffee: 3.5, taxi: 12, water: 1.5, dinner: 25 },
  Croatia: { coffee: 2.5, taxi: 10, water: 1, dinner: 18 },
  Montenegro: { coffee: 2, taxi: 8, water: 1, dinner: 16 },
  Iceland: { coffee: 4.5, taxi: 20, water: 2, dinner: 35 },
  Norway: { coffee: 4.5, taxi: 20, water: 2.5, dinner: 35 },
  Sweden: { coffee: 3.5, taxi: 15, water: 1.5, dinner: 25 },
  USA: { coffee: 5, taxi: 15, water: 1.5, dinner: 25 },
  Canada: { coffee: 4, taxi: 12, water: 1.5, dinner: 22 },
  Mexico: { coffee: 3, taxi: 5, water: 0.6, dinner: 15 },
  "Costa Rica": { coffee: 3, taxi: 5, water: 0.8, dinner: 15 },
  Brazil: { coffee: 2.5, taxi: 6, water: 0.7, dinner: 15 },
  Argentina: { coffee: 3, taxi: 5, water: 0.7, dinner: 15 },
  Peru: { coffee: 2.5, taxi: 4, water: 0.6, dinner: 12 },
  Chile: { coffee: 3, taxi: 6, water: 0.8, dinner: 15 },
  Australia: { coffee: 4, taxi: 15, water: 2, dinner: 25 },
  "New Zealand": { coffee: 4, taxi: 15, water: 2, dinner: 25 },
  Fiji: { coffee: 3, taxi: 6, water: 1, dinner: 18 },
  "French Polynesia": { coffee: 5, taxi: 20, water: 2, dinner: 35 },
};

const ALIAS: Record<string, string> = {
  "United Arab Emirates": "UAE",
  "United Kingdom": "UK",
  "United States": "USA",
};

export function getTypicalCosts(country?: string | null): Costs | null {
  if (!country) return null;
  return DATA[country] ?? DATA[ALIAS[country] ?? ""] ?? null;
}
