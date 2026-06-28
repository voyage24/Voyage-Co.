import { NextResponse } from "next/server";

// Live FX rates, base INR (units of each currency per ₹1) — matches the
// CURRENCIES `rate` semantics. Cached for 6h; falls back to {} (the app then
// uses the built-in static rates) if the source is unreachable.
export const revalidate = 21600;

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/INR", { next: { revalidate: 21600 } });
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (data?.result !== "success" || !data.rates) throw new Error("bad payload");
    return NextResponse.json({ rates: data.rates, updated: data.time_last_update_utc ?? null });
  } catch (err) {
    console.error("FX fetch failed:", err);
    return NextResponse.json({ rates: {} });
  }
}
