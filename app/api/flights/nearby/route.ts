import { NextRequest, NextResponse } from "next/server";
import { getNearbyFlights } from "@/lib/live-flight";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams;
  const lat = parseFloat(p.get("lat") ?? "");
  const lng = parseFloat(p.get("lng") ?? "");
  const dist = Math.min(250, Math.max(10, parseInt(p.get("dist") ?? "150", 10) || 150));
  if (!isFinite(lat) || !isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }
  try {
    const flights = await getNearbyFlights(lat, lng, dist);
    return NextResponse.json({ flights });
  } catch {
    return NextResponse.json({ error: "Couldn't reach the live flight service — please try again shortly." }, { status: 502 });
  }
}
