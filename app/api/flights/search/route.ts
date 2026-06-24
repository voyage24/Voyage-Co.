import { NextRequest, NextResponse } from "next/server";
import { searchFlights } from "@/lib/amadeus";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const origin        = searchParams.get("origin");
  const destination    = searchParams.get("destination");
  const departureDate  = searchParams.get("departureDate");
  const returnDate     = searchParams.get("returnDate") ?? undefined;
  const adults         = Number(searchParams.get("adults") ?? "1");
  const travelClass    = searchParams.get("travelClass") ?? undefined;

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: "origin, destination and departureDate are required" },
      { status: 400 }
    );
  }

  try {
    const flights = await searchFlights({ origin, destination, departureDate, returnDate, adults, travelClass });
    return NextResponse.json({ flights });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error fetching live flights" },
      { status: 502 }
    );
  }
}
