import { NextRequest, NextResponse } from "next/server";
import { getTransfer } from "@/lib/routing";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

// Public: nearest airport + transfer time for a property's coordinates. First
// call computes (and caches) the precise road time; later calls are instant.
export async function GET(req: NextRequest) {
  const lat = parseFloat(req.nextUrl.searchParams.get("lat") || "");
  const lng = parseFloat(req.nextUrl.searchParams.get("lng") || "");
  if (Number.isNaN(lat) || Number.isNaN(lng)) return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  const transfer = await getTransfer(lat, lng);
  if (!transfer) return NextResponse.json({ transfer: null });
  return NextResponse.json({ transfer });
}
