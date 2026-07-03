import { NextRequest, NextResponse } from "next/server";
import { getFlightStatus } from "@/lib/amadeus";

export async function GET(req: NextRequest) {
  const p = new URL(req.url).searchParams;
  const carrierCode = (p.get("carrier") ?? "").toUpperCase().trim();
  const flightNumber = (p.get("number") ?? "").replace(/\D/g, "").trim();
  const date = (p.get("date") ?? "").trim();
  if (!carrierCode || !flightNumber || !date) {
    return NextResponse.json({ error: "carrier, number and date are required" }, { status: 400 });
  }
  try {
    const status = await getFlightStatus({ carrierCode, flightNumber, date });
    if (!status) return NextResponse.json({ error: "No flight found for that number and date." }, { status: 404 });
    return NextResponse.json({ status });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error fetching flight status" }, { status: 502 });
  }
}
