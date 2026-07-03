// Server-only Amadeus Self-Service client. Never import this from a "use client" file —
// it reads AMADEUS_CLIENT_ID / AMADEUS_CLIENT_SECRET, which must stay off the browser bundle.

const TOKEN_URL  = "https://test.api.amadeus.com/v1/security/oauth2/token";
const SEARCH_URL = "https://test.api.amadeus.com/v2/shopping/flight-offers";

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5_000) return cachedToken.value;

  const clientId     = process.env.AMADEUS_CLIENT_ID;
  const clientSecret = process.env.AMADEUS_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Amadeus API not configured — set AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET in .env.local");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),
    cache: "no-store",
  });

  if (!res.ok) throw new Error(`Amadeus authentication failed (${res.status})`);

  const json = await res.json();
  cachedToken = { value: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.value;
}

// "PT3H35M" -> "3h 35m"
function parseISODuration(iso: string): string {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?/);
  const h = m?.[1] ? `${m[1]}h ` : "";
  const min = m?.[2] ? `${m[2]}m` : "";
  return (h + min).trim() || "—";
}

// "2026-07-01T21:30:00" -> "21:30"
function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export interface LiveFlight {
  id: string;
  origin: string;
  destination: string;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  departure: string;
  arrival: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
}

export async function searchFlights({
  origin, destination, departureDate, returnDate, adults = 1, travelClass,
}: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
  travelClass?: string;
}): Promise<LiveFlight[]> {
  const token = await getAccessToken();

  const params = new URLSearchParams({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: String(adults),
    currencyCode: "INR",
    max: "15",
  });
  if (returnDate) params.set("returnDate", returnDate);

  const classMap: Record<string, string> = {
    Economy: "ECONOMY",
    "Premium Economy": "PREMIUM_ECONOMY",
    Business: "BUSINESS",
    First: "FIRST",
  };
  if (travelClass && classMap[travelClass]) params.set("travelClass", classMap[travelClass]);

  const res = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Amadeus flight search failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const json = await res.json();
  const carriers: Record<string, string> = json.dictionaries?.carriers ?? {};
  const offers = (json.data ?? []) as Array<{
    id: string;
    price: { total: string; currency: string };
    itineraries: Array<{ duration: string; segments: Array<{
      departure: { iataCode: string; at: string };
      arrival: { iataCode: string; at: string };
      carrierCode: string;
      number: string;
    }> }>;
  }>;

  return offers.map((offer, i): LiveFlight => {
    const itinerary = offer.itineraries[0];
    const segments  = itinerary.segments;
    const first = segments[0];
    const last  = segments[segments.length - 1];
    return {
      id: offer.id ?? String(i),
      origin: first.departure.iataCode,
      destination: last.arrival.iataCode,
      airline: carriers[first.carrierCode] ?? first.carrierCode,
      airlineCode: first.carrierCode,
      flightNumber: `${first.carrierCode} ${first.number}`,
      departure: timeOf(first.departure.at),
      arrival: timeOf(last.arrival.at),
      duration: parseISODuration(itinerary.duration),
      stops: segments.length - 1,
      price: Math.round(parseFloat(offer.price.total)),
      currency: offer.price.currency,
    };
  });
}

const SCHEDULE_URL = "https://test.api.amadeus.com/v2/schedule/flights";

export interface FlightStatus {
  carrier: string;
  flightNumber: string;
  date: string;
  origin: string;
  destination: string;
  departureTime: string | null;
  arrivalTime: string | null;
  departureTerminal: string | null;
  arrivalTerminal: string | null;
  aircraft: string | null;
  duration: string | null;
}

// Looks up a flight's scheduled status/route by carrier + number + date, using
// the same Amadeus credentials as the flight search.
export async function getFlightStatus({
  carrierCode, flightNumber, date,
}: { carrierCode: string; flightNumber: string; date: string }): Promise<FlightStatus | null> {
  const token = await getAccessToken();
  const params = new URLSearchParams({ carrierCode, flightNumber, scheduledDepartureDate: date });

  const res = await fetch(`${SCHEDULE_URL}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Amadeus flight status failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const flight = (json.data ?? [])[0];
  if (!flight) return null;

  const points = flight.flightPoints ?? [];
  const dep = points[0];
  const arr = points[points.length - 1];
  const leg = (flight.legs ?? [])[0];

  return {
    carrier: flight.flightDesignator?.carrierCode ?? carrierCode,
    flightNumber: String(flight.flightDesignator?.flightNumber ?? flightNumber),
    date: flight.scheduledDepartureDate ?? date,
    origin: dep?.iataCode ?? "",
    destination: arr?.iataCode ?? "",
    departureTime: dep?.departure?.timings?.[0]?.value ?? null,
    arrivalTime: arr?.arrival?.timings?.[0]?.value ?? null,
    departureTerminal: dep?.departure?.terminal?.code ?? null,
    arrivalTerminal: arr?.arrival?.terminal?.code ?? null,
    aircraft: leg?.aircraftEquipment?.aircraftType ?? null,
    duration: leg?.scheduledLegDuration ? parseISODuration(leg.scheduledLegDuration) : null,
  };
}
