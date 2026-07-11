import { NextRequest, NextResponse } from "next/server";
import { getTransfer } from "@/lib/routing";
import { nearestAirport } from "@/lib/nearest-airport";
import { CITY_COORDS } from "@/lib/geo";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

// Public: nearest airport + transfer time for a property's coordinates. First
// call computes (and caches) the precise road time; later calls are instant.
// ?test=1 runs a known-good ORS call and returns the raw result for diagnosis.
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("test") === "1") {
    const ors = process.env.ORS_API_KEY;
    const geoapify = process.env.GEOAPIFY_API_KEY;
    const out: Record<string, unknown> = { orsKeySet: !!ors, orsKeyLen: ors?.length ?? 0, geoapifyKeySet: !!geoapify };
    if (ors) {
      try {
        const r = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
          method: "POST",
          headers: { Authorization: ors, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ coordinates: [[8.681495, 49.41461], [8.687872, 49.420318]] }),
          cache: "no-store",
        });
        out.orsStatus = r.status;
        out.orsBody = (await r.text()).slice(0, 400);
      } catch (e) { out.orsError = String(e).slice(0, 200); }
    }
    return NextResponse.json(out);
  }

  const lat = parseFloat(req.nextUrl.searchParams.get("lat") || "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") || "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) return NextResponse.json({ error: "lat and lng required" }, { status: 400 });

  // ?debug=1 — run the real airport→property route and show the raw ORS result.
  if (req.nextUrl.searchParams.get("debug") === "1") {
    const a = nearestAirport(lat, lng);
    const dest = a ? CITY_COORDS[a.code] : null;
    const out: Record<string, unknown> = { nearest: a, dest };
    const ors = process.env.ORS_API_KEY;
    if (a && dest && ors) {
      try {
        const r = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
          method: "POST",
          headers: { Authorization: ors, "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ coordinates: [[dest[1], dest[0]], [lng, lat]] }),
          cache: "no-store",
        });
        out.status = r.status;
        out.body = (await r.text()).slice(0, 400);
      } catch (e) { out.error = String(e).slice(0, 200); }
    }
    return NextResponse.json(out);
  }

  const transfer = await getTransfer(lat, lng);
  if (!transfer) return NextResponse.json({ transfer: null });
  return NextResponse.json({ transfer });
}
