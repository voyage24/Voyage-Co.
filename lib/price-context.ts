// "Is it a good deal?" — positions a property's nightly rate against comparable
// stays (same country + category). Returns null when there aren't enough peers
// for an honest comparison.

export type PriceBand = "value" | "typical" | "premium";

export type PriceContext = {
  band: PriceBand;
  label: string;
  min: number;
  median: number;
  max: number;
  count: number;      // number of comparable stays (incl. this one)
  position: number;   // 0–1 marker position along the min–max range
};

// Value/premium read for a whole list at once (for listing-card badges), so no
// per-card queries are needed. Groups by country+category, and only rates groups
// with enough peers. Bottom ~20% → value, top ~25% → premium.
export function valueBandsFor(
  items: { id: string; country: string; category: string; pricePerNight: number; priceOnRequest?: boolean }[],
): Map<string, "value" | "premium"> {
  const groups = new Map<string, number[]>();
  for (const h of items) {
    if (h.priceOnRequest || h.pricePerNight <= 0) continue;
    const key = `${h.country}|${h.category}`;
    const arr = groups.get(key);
    if (arr) arr.push(h.pricePerNight); else groups.set(key, [h.pricePerNight]);
  }
  const median = new Map<string, number>();
  for (const [key, arr] of Array.from(groups)) {
    if (arr.length < 4) continue;
    const s = [...arr].sort((a, b) => a - b);
    median.set(key, s[Math.floor(s.length / 2)]);
  }
  const out = new Map<string, "value" | "premium">();
  for (const h of items) {
    if (h.priceOnRequest || h.pricePerNight <= 0) continue;
    const med = median.get(`${h.country}|${h.category}`);
    if (!med) continue;
    if (h.pricePerNight <= med * 0.85) out.set(h.id, "value");
    else if (h.pricePerNight >= med * 1.3) out.set(h.id, "premium");
  }
  return out;
}

export function computePriceContext(price: number, peerPrices: number[]): PriceContext | null {
  const prices = peerPrices.filter(p => p > 0).sort((a, b) => a - b);
  if (prices.length < 4) return null;

  const min = prices[0];
  const max = prices[prices.length - 1];
  if (max <= min) return null;
  const median = prices[Math.floor(prices.length / 2)];

  const below = prices.filter(p => p < price).length;
  const pct = below / prices.length; // share of peers cheaper than this
  const position = Math.max(0, Math.min(1, (price - min) / (max - min)));

  let band: PriceBand, label: string;
  if (pct <= 0.35) { band = "value"; label = "Great value"; }
  else if (pct >= 0.7) { band = "premium"; label = "A premium choice"; }
  else { band = "typical"; label = "Around the typical rate"; }

  return { band, label, min, median, max, count: prices.length, position };
}
