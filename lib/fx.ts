import { CURRENCIES } from "@/lib/currency";

// Convert a foreign amount to INR (the site's base). Uses the live USD-based
// rates (cached a day) — INR per unit = rates.INR / rates[currency] — and falls
// back to the static table (rate = units per INR) if the feed is unavailable.
export async function toInr(amount: number, currency: string): Promise<number> {
  if (!currency || currency === "INR") return Math.round(amount);
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 86400 } });
    const d = await r.json();
    if (d?.result === "success" && d.rates?.INR && d.rates?.[currency]) {
      return Math.round(amount * (d.rates.INR / d.rates[currency]));
    }
  } catch { /* fall through to static */ }
  const st = CURRENCIES.find(c => c.code === currency)?.rate;
  return st && st > 0 ? Math.round(amount / st) : Math.round(amount);
}
