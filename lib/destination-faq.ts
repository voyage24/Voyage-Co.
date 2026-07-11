import { getSeasonality } from "@/lib/seasonality";
import { getGettingAround } from "@/lib/getting-around";
import { getCountryMeta } from "@/lib/country-meta";
import { getTippingGuide } from "@/lib/tipping";
import { getHealthSafety } from "@/lib/health-safety";
import { getConnectivity } from "@/lib/connectivity";

// Generates "People also ask"-style Q&As for a country from the curated
// destination data, for both a visible FAQ and FAQ rich-snippet schema. Returns
// only the questions we actually have answers for.
export function destinationFaqs(country: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];

  const s = getSeasonality(country);
  if (s) out.push({ q: `When is the best time to visit ${country}?`, a: s.note });

  const g = getGettingAround(country);
  if (g) {
    const apps = g.apps.length ? ` Ride-hailing apps that work locally: ${g.apps.join(", ")}.` : "";
    out.push({ q: `How do I get around in ${country}?`, a: `${g.transit}${apps} Note they drive on the ${g.driveSide}.` });
  }

  const m = getCountryMeta(country);
  if (m) out.push({ q: `What currency is used in ${country}?`, a: `The local currency is the ${m.ccyName} (${m.ccy}, ${m.symbol}). Cards are widely accepted in cities; carry some cash for smaller places.` });

  const t = getTippingGuide(country);
  if (t) out.push({ q: `Do you tip in ${country}?`, a: `${t.level}. In restaurants: ${t.restaurants}` });

  const h = getHealthSafety(country);
  if (h) {
    const water = h.tapWater === "safe" ? "The tap water is safe to drink." : h.tapWater === "caution" ? "Tap water is generally fine in the main areas, but bottled is recommended." : "Drink bottled or purified water rather than tap.";
    out.push({ q: `Is the tap water safe to drink in ${country}?`, a: `${water} ${h.notes[0] ?? ""} Confirm any vaccinations with a travel clinic before you go.`.trim() });
  }

  const c = getConnectivity(country);
  if (c) {
    const conv = c.converter ? " Visitors from 220–240V regions need a voltage converter for high-wattage devices." : "";
    out.push({ q: `What power plug and voltage does ${country} use?`, a: `${country} uses type ${c.plugs.join(" / ")} plugs at ${c.voltage}, ${c.frequency}.${conv}` });
  }

  return out;
}
