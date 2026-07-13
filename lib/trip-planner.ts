import { prisma } from "@/lib/prisma";
import { generateText, aiConfigured } from "@/lib/ai";
import { resolveCoords } from "@/lib/place-coords";
import { nearestAirport, formatDuration } from "@/lib/nearest-airport";
import { getGettingAround } from "@/lib/getting-around";
import { getTypicalCosts } from "@/lib/typical-costs";
import { getSeasonality } from "@/lib/seasonality";
import { getCountryMeta } from "@/lib/country-meta";

// ── Smart Trip Planner ──────────────────────────────────────────────────────
// Turns a single natural-language wish ("Paris for 5 days in September") into a
// complete, grounded itinerary: real bookable stays & experiences from our
// catalogue, a day-by-day plan, restaurants/museums/day-trips, weather/season,
// getting-around & metro notes, nearest-airport transfer and an estimated cost.
// The narrative is written by AI when a key is configured; a deterministic plan
// built from real data is used otherwise, so the feature always works.

export type PlanDay = { day: number; title: string; morning: string; afternoon: string; evening: string };
export type NamedPick = { name: string; note?: string };
export type PlanHotel = { id: string; name: string; city: string; image: string; pricePerNight: number; href: string; rating: number };
export type PlanExperience = { id: string; title: string; image: string; price: number; href: string };

export type TripPlan =
  | { ok: false; error: string; suggestions: string[] }
  | {
      ok: true;
      query: string;
      city: string | null;
      country: string;
      days: number;
      travellers: number;
      month: string | null;
      season: string | null;
      isPeak: boolean;
      currency: { code: string; name: string; symbol: string } | null;
      gettingAround: { transit: string; apps: string[]; driveSide: string } | null;
      airport: { name: string; code: string; transfer: string } | null;
      overview: string;
      hotels: PlanHotel[];
      experiences: PlanExperience[];
      itinerary: PlanDay[];
      restaurants: NamedPick[];
      museums: NamedPick[];
      dayTrips: NamedPick[];
      tips: string[];
      cost: { flights: number; hotel: number; daily: number; experiences: number; total: number; nights: number; perDaySpend: number };
      flightsHref: string;
      aiSource: string | null;
      aiError?: string | null;
    };

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
const DELHI: [number, number] = [28.61, 77.20]; // fare-distance origin (INR-base site)

function haversineKm(a: [number, number], b: [number, number]): number {
  const R = 6371, dLat = ((b[0] - a[0]) * Math.PI) / 180, dLng = ((b[1] - a[1]) * Math.PI) / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos((a[0] * Math.PI) / 180) * Math.cos((b[0] * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function parseMonth(s: string): { name: string; index: number } | null {
  const l = s.toLowerCase();
  for (let i = 0; i < 12; i++) {
    if (new RegExp(`\\b(${MONTHS[i]}|${MONTHS[i].slice(0, 3)})\\b`).test(l)) return { name: cap(MONTHS[i]), index: i };
  }
  return null;
}
function parseDays(s: string): number {
  const wk = s.match(/(\d+)\s*week/i);
  if (wk) return clamp(parseInt(wk[1]) * 7, 1, 21);
  const d = s.match(/(\d+)\s*(day|night|nite)/i);
  if (d) return clamp(parseInt(d[1]), 1, 21);
  return 5;
}
function parseTravellers(s: string): number {
  const l = s.toLowerCase();
  if (/\b(solo|myself|just me)\b/.test(l)) return 1;
  if (/\b(honeymoon|couple|my (wife|husband|partner)|two of us)\b/.test(l)) return 2;
  if (/\bfamily\b/.test(l)) return 4;
  const m = l.match(/(\d+)\s*(people|persons?|adults?|travell?ers?|guests?|pax)/);
  if (m) return clamp(parseInt(m[1]), 1, 9);
  return 2;
}

async function usdToInr(): Promise<number> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    const d = await r.json();
    const inr = d?.result === "success" ? d.rates?.INR : null;
    return typeof inr === "number" && inr > 0 ? inr : 83;
  } catch { return 83; }
}

function extractJson(text: string): any | null {
  // Free models often wrap JSON in ```json fences, add prose, or leave trailing
  // commas — strip/repair those before parsing so the AII plan isn't dropped.
  let t = text.replace(/```json\s*/gi, "").replace(/```/g, "").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  if (a < 0 || b <= a) return null;
  t = t.slice(a, b + 1);
  const attempts = [t, t.replace(/,\s*([}\]])/g, "$1")]; // second: drop trailing commas
  for (const cand of attempts) {
    try { return JSON.parse(cand); } catch { /* try next */ }
  }
  return null;
}

// A structured, real-data itinerary when AI isn't available (or fails/parses bad).
function fallbackDays(place: string, days: number, experiences: PlanExperience[]): PlanDay[] {
  const out: PlanDay[] = [];
  for (let i = 1; i <= days; i++) {
    if (i === 1) out.push({ day: 1, title: "Arrival & first impressions", morning: `Private transfer from the airport to your hotel in ${place}.`, afternoon: `Settle in, then a gentle wander through the neighbourhood to get your bearings.`, evening: `An unhurried dinner near your hotel.` });
    else if (i === days) out.push({ day: i, title: "At leisure & departure", morning: `A relaxed morning — coffee, any last sights or shopping.`, afternoon: `Check out and private transfer to the airport.`, evening: `Onward journey.` });
    else {
      const exp = experiences[(i - 2) % Math.max(1, experiences.length)];
      out.push({ day: i, title: `Discovering ${place}`, morning: `A signature landmark or quarter of ${place}.`, afternoon: exp ? `${exp.title}.` : `Museums, galleries and the historic centre.`, evening: `Dinner at a celebrated local table.` });
    }
  }
  return out;
}

export async function buildTripPlan(query: string): Promise<TripPlan> {
  const days = parseDays(query);
  const travellers = parseTravellers(query);
  const month = parseMonth(query);

  // Match the destination against our real catalogue (city first, then country).
  const hotelRows = await prisma.hotel.findMany({
    where: { published: true },
    select: { id: true, name: true, city: true, country: true, image: true, pricePerNight: true, rating: true, reviewCount: true, lat: true, lng: true },
  });
  const cities = Array.from(new Set(hotelRows.map(h => h.city).filter(Boolean)));
  const countries = Array.from(new Set(hotelRows.map(h => h.country).filter(Boolean)));

  const match = (name: string) => new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(query);
  const cityHit = cities.filter(match).sort((a, b) => b.length - a.length)[0] || null;
  const countryHit = cityHit ? hotelRows.find(h => h.city === cityHit)!.country : (countries.filter(match).sort((a, b) => b.length - a.length)[0] || null);

  if (!countryHit) {
    const suggestions = Array.from(new Set(hotelRows.map(h => h.city))).slice(0, 6);
    return { ok: false, error: "We couldn't place that destination yet. Try a city or country we cover.", suggestions };
  }
  const country = countryHit;
  const city = cityHit;

  // Bookable stays & experiences in the destination.
  const inDest = hotelRows
    .filter(h => (city ? h.city === city : h.country === country))
    .sort((a, b) => (b.rating - a.rating) || (b.reviewCount - a.reviewCount));
  const hotels: PlanHotel[] = inDest.slice(0, 4).map(h => ({ id: h.id, name: h.name, city: h.city, image: h.image, pricePerNight: h.pricePerNight, rating: h.rating, href: `/hotels/${h.id}` }));

  const expRows = await prisma.experience.findMany({ where: { published: true, country }, orderBy: { price: "desc" }, take: 4, select: { id: true, title: true, image: true, price: true } });
  const experiences: PlanExperience[] = expRows.map(e => ({ id: e.id, title: e.title, image: e.image, price: e.price, href: `/experiences/${e.id}` }));

  // Grounding context.
  const anchor = inDest.find(h => h.lat != null && h.lng != null);
  const coords: [number, number] | null = anchor ? [anchor.lat!, anchor.lng!] : resolveCoords(city, country);
  const place = city || country;
  const season = getSeasonality(country);
  const isPeak = !!(season && month && season.months[month.index] === 2);
  const ga = getGettingAround(country);
  const meta = getCountryMeta(country);
  const air = coords ? nearestAirport(coords[0], coords[1]) : null;

  // ── Narrative: AI when configured, deterministic otherwise ────────────────
  let overview = `A ${days}-day journey through ${place}${month ? ` in ${month.name}` : ""}, balancing the icons with time to simply be there.`;
  let itinerary = fallbackDays(place, days, experiences);
  let restaurants: NamedPick[] = [];
  let museums: NamedPick[] = [];
  let dayTrips: NamedPick[] = [];
  let tips: string[] = [];
  let aiSource: string | null = null;
  let aiError: string | null = null;

  if (aiConfigured()) {
    const system = `You are a discerning luxury travel concierge. Design a ${days}-day itinerary for ${place}${city ? `, ${country}` : ""}${month ? `, travelling in ${month.name}` : ""}.
Return ONLY a single raw JSON object — no markdown, no code fences, no commentary before or after — matching exactly:
{"overview":string,"days":[{"title":string,"morning":string,"afternoon":string,"evening":string}],"restaurants":[{"name":string,"note":string}],"museums":[{"name":string,"note":string}],"dayTrips":[{"name":string,"note":string}],"tips":[string]}
Rules: exactly ${days} day objects; use REAL, well-known places in ${place}; one crisp sentence per activity; 4-6 restaurants, 4-6 museums/sights, 2-4 day-trips, 3-5 practical tips; refined, warm tone; never invent our hotels.`;
    const hotelNames = hotels.map(h => h.name).join("; ") || "(none listed)";
    const user = `Traveller's request: "${query}". Our bookable stays there: ${hotelNames}. Season note: ${season?.note || "n/a"}. Write the itinerary now as raw JSON only.`;
    try {
      const r = await generateText(system, [{ role: "user", content: user }], 3500, { json: true });
      const j = r.text ? extractJson(r.text) : null;
      if (!r.text) aiError = `no text (${r.source}${r.error ? `: ${r.error}` : ""})`;
      else if (!j) aiError = `unparseable (${r.source}, ${r.text.length} chars)`;
      else if (!Array.isArray(j.days) || !j.days.length) aiError = `no days (${r.source})`;
      if (j && Array.isArray(j.days) && j.days.length) {
        aiSource = r.source;
        if (typeof j.overview === "string" && j.overview.trim()) overview = j.overview.trim();
        itinerary = j.days.slice(0, days).map((d: any, i: number) => ({
          day: i + 1,
          title: String(d.title || `Day ${i + 1}`).slice(0, 90),
          morning: String(d.morning || "").slice(0, 240),
          afternoon: String(d.afternoon || "").slice(0, 240),
          evening: String(d.evening || "").slice(0, 240),
        }));
        const picks = (v: any): NamedPick[] => Array.isArray(v) ? v.filter((x: any) => x?.name).slice(0, 6).map((x: any) => ({ name: String(x.name).slice(0, 80), note: x.note ? String(x.note).slice(0, 160) : undefined })) : [];
        restaurants = picks(j.restaurants);
        museums = picks(j.museums);
        dayTrips = picks(j.dayTrips);
        tips = Array.isArray(j.tips) ? j.tips.filter((t: any) => typeof t === "string").slice(0, 5).map((t: string) => t.slice(0, 200)) : [];
      }
    } catch (e) { aiError = `threw: ${String(e).slice(0, 100)}`; }
  } else {
    aiError = "no ai key";
  }

  // ── Estimated cost (INR base; the client converts to the guest's currency) ─
  const rate = await usdToInr();
  const costs = getTypicalCosts(country);
  const dailyUsd = costs ? costs.dinner + costs.coffee * 2 + costs.water * 2 + costs.taxi * 2 : 80;
  const perDaySpend = Math.round((dailyUsd * rate) / 100) * 100;
  const dailyTotal = perDaySpend * days * travellers;

  const nights = days;
  const rooms = Math.ceil(travellers / 2);
  const hotelTotal = hotels[0] ? hotels[0].pricePerNight * nights * rooms : 0;

  const distKm = coords ? haversineKm(DELHI, coords) : 3000;
  const flightPer = clamp(Math.round((distKm * 9) / 500) * 500, 12000, 160000);
  const flightTotal = flightPer * travellers;

  const expTotal = experiences.slice(0, 2).reduce((s, e) => s + e.price, 0) * travellers;
  const total = flightTotal + hotelTotal + dailyTotal + expTotal;

  return {
    ok: true,
    query,
    city,
    country,
    days,
    travellers,
    month: month?.name ?? null,
    season: season?.note ?? null,
    isPeak,
    currency: meta ? { code: meta.ccy, name: meta.ccyName, symbol: meta.symbol } : null,
    gettingAround: ga ? { transit: ga.transit, apps: ga.apps, driveSide: ga.driveSide } : null,
    airport: air ? { name: air.name, code: air.code, transfer: `${air.code} · ~${air.distanceKm} km, about ${formatDuration(air.minutes)} by car` } : null,
    overview,
    hotels,
    experiences,
    itinerary,
    restaurants,
    museums,
    dayTrips,
    tips,
    cost: { flights: flightTotal, hotel: hotelTotal, daily: dailyTotal, experiences: expTotal, total, nights, perDaySpend },
    flightsHref: air ? `/flights?to=${air.code}` : "/flights",
    aiSource,
    aiError,
  };
}
