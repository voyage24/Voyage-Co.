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
