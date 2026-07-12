import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPushToCustomer } from "@/lib/push";
import { resolveCoords } from "@/lib/place-coords";
import { getCountryMeta } from "@/lib/country-meta";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const dayOf = (iso: string) => { const d = new Date(iso); d.setHours(0, 0, 0, 0); return d; };

async function isRainTomorrow(lat: number, lng: number): Promise<boolean> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=precipitation_probability_max&forecast_days=2&timezone=auto`;
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) return false;
    const probs: number[] = (await r.json())?.daily?.precipitation_probability_max ?? [];
    return typeof probs[1] === "number" && probs[1] >= 60;
  } catch { return false; }
}

async function fetchRates(): Promise<Record<string, number> | null> {
  try {
    const r = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const d = await r.json();
    return d?.result === "success" ? d.rates : null;
  } catch { return null; }
}

// Smart traveller nudges: "check-in / trip is soon", "rain tomorrow at your
// destination", and "the exchange rate has improved". Each de-dupes so it fires
// once. Runs from the daily cron fan-out; keyless.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const authed = req.headers.get("authorization") === `Bearer ${secret}` || req.nextUrl.searchParams.get("key") === secret;
  if (secret && !authed) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().slice(0, 10);
  let checkin = 0, rain = 0, fx = 0;

  // 1) Check-in / trip-soon reminders — 1–2 days out, once.
  const soonBookings = await prisma.booking.findMany({
    where: { status: "confirmed", customerId: { not: null }, checkinRemindedAt: null, checkIn: { not: null } },
    select: { id: true, customerId: true, itemTitle: true, type: true, checkIn: true }, take: 200,
  });
  for (const b of soonBookings) {
    const days = Math.round((dayOf(b.checkIn!).getTime() - today.getTime()) / 86_400_000);
    if (days !== 1 && days !== 2) continue;
    const flight = b.type === "flight";
    await sendPushToCustomer(b.customerId!, {
      title: flight ? "✈️ Check-in opens soon" : `🧳 Your trip is in ${days} day${days > 1 ? "s" : ""}`,
      body: flight ? `Online check-in for ${b.itemTitle} opens soon — have your documents ready in your Travel Wallet.` : `${b.itemTitle} — your passes and documents are ready in your Travel Wallet.`,
      url: "/account/wallet",
    }).catch(() => {});
    await prisma.booking.update({ where: { id: b.id }, data: { checkinRemindedAt: new Date() } }).catch(() => {});
    checkin++;
  }

  // Destinations for weather + currency (hotel bookings active or starting within a week).
  const hotelBookings = await prisma.booking.findMany({
    where: { type: "hotel", status: "confirmed", customerId: { not: null }, checkIn: { not: null } },
    select: { id: true, customerId: true, itemId: true, itemTitle: true, checkIn: true, weatherRemindedOn: true, fxBaseRate: true, fxRemindedAt: true }, take: 200,
  });
  const upcoming = hotelBookings.filter(b => { const d = Math.round((dayOf(b.checkIn!).getTime() - today.getTime()) / 86_400_000); return d >= -3 && d <= 7; });
  const hotelIds = Array.from(new Set(upcoming.map(b => b.itemId)));
  const hotels = hotelIds.length ? await prisma.hotel.findMany({ where: { id: { in: hotelIds } }, select: { id: true, city: true, country: true, lat: true, lng: true } }) : [];
  const hotelById = new Map(hotels.map(h => [h.id, h]));
  const rates = await fetchRates();

  for (const b of upcoming) {
    const h = hotelById.get(b.itemId);
    if (!h) continue;

    // 2) Rain tomorrow — once per day.
    if (b.weatherRemindedOn !== todayStr) {
      const coords = h.lat != null && h.lng != null ? [h.lat, h.lng] as [number, number] : resolveCoords(h.city, null);
      if (coords && await isRainTomorrow(coords[0], coords[1])) {
        await sendPushToCustomer(b.customerId!, { title: "🌧️ Rain forecast tomorrow", body: `Showers expected in ${h.city || h.country} — pack accordingly, or ask the concierge for indoor gems.`, url: "/account" }).catch(() => {});
        await prisma.booking.update({ where: { id: b.id }, data: { weatherRemindedOn: todayStr } }).catch(() => {});
        rain++;
      }
    }

    // 3) Currency improved — baseline then alert on a ≥3% gain, at most weekly.
    if (rates) {
      const meta = getCountryMeta(h.country);
      const inr = rates.INR;
      const dest = meta ? rates[meta.ccy] : undefined;
      if (meta && inr && dest) {
        const rate = dest / inr; // destination units per 1 INR
        if (b.fxBaseRate == null) {
          await prisma.booking.update({ where: { id: b.id }, data: { fxBaseRate: rate } }).catch(() => {});
        } else if (rate > b.fxBaseRate * 1.03 && (!b.fxRemindedAt || Date.now() - b.fxRemindedAt.getTime() > 7 * 86_400_000)) {
          const pct = Math.round(((rate - b.fxBaseRate) / b.fxBaseRate) * 100);
          await sendPushToCustomer(b.customerId!, { title: "💱 Better exchange rate", body: `The ${meta.ccy} rate has improved ~${pct}% — your ${h.city || h.country} trip just got better value.`, url: "/account" }).catch(() => {});
          await prisma.booking.update({ where: { id: b.id }, data: { fxBaseRate: rate, fxRemindedAt: new Date() } }).catch(() => {});
          fx++;
        }
      }
    }
  }

  return NextResponse.json({ ok: true, checkin, rain, fx });
}
