import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Live-ish FX rates for the currency cheat-sheet, from the free open.er-api.com
// (no key). USD-based; the client derives any cross-rate as rates[to]/rates[from].
// Cached a day — FX drift within a day is immaterial for a travel reference.
export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", { next: { revalidate: 86400 } });
    if (!res.ok) return NextResponse.json({ base: "USD", rates: null });
    const data = await res.json();
    if (data?.result !== "success" || !data?.rates) return NextResponse.json({ base: "USD", rates: null });
    return NextResponse.json({ base: "USD", rates: data.rates, updated: data.time_last_update_utc ?? null });
  } catch {
    return NextResponse.json({ base: "USD", rates: null });
  }
}
