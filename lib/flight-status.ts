import { callsignFor } from "@/lib/live-flight";

export type FlightPhase = "scheduled" | "airborne" | "landed";

// Derive a coarse flight phase from the keyless adsb.lol callsign feed:
//  - a match that is airborne  → "airborne"
//  - a match that is on ground → "landed" (only meaningful once it has flown)
//  - no live match             → "scheduled" (not yet flying, or out of ADS-B range)
// This is position-derived, not an airline gate/delay feed — see the cron notes.
export async function getFlightPhase(carrier: string, flightNumber: string): Promise<{ phase: FlightPhase; found: boolean }> {
  const cs = callsignFor(carrier, flightNumber);
  if (!cs) return { phase: "scheduled", found: false };
  try {
    const res = await fetch(`https://api.adsb.lol/v2/callsign/${cs}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return { phase: "scheduled", found: false };
    const json = await res.json();
    const ac = (json.ac ?? [])[0];
    if (!ac) return { phase: "scheduled", found: false };
    const onGround = ac.alt_baro === "ground" || (typeof ac.alt_baro === "number" && ac.alt_baro < 200);
    return { phase: onGround ? "landed" : "airborne", found: true };
  } catch {
    return { phase: "scheduled", found: false };
  }
}

export type LiveFlight = {
  status: string | null;      // scheduled | active | landed | cancelled | delayed …
  gate: string | null;
  terminal: string | null;
  baggage: string | null;     // arrival carousel
  delayMin: number | null;    // departure delay
};

// Live gate / terminal / delay / baggage from an airline-data provider. Uses
// AviationStack when AVIATIONSTACK_API_KEY is set (flight_iata = airline code +
// number). Returns null when unconfigured or on error — the ADS-B phase above
// is the keyless fallback. Any provider returning these fields can be slotted in
// here without touching the cron or UI.
export async function getLiveFlightDetails(airlineCode: string, flightNumber: string): Promise<LiveFlight | null> {
  const key = process.env.AVIATIONSTACK_API_KEY;
  if (!key || !airlineCode || !flightNumber) return null;
  const iata = `${airlineCode}${flightNumber}`.replace(/\s+/g, "").toUpperCase();
  try {
    const res = await fetch(`https://api.aviationstack.com/v1/flights?access_key=${key}&flight_iata=${iata}&limit=1`, { cache: "no-store" });
    if (!res.ok) return null;
    const f = (await res.json())?.data?.[0];
    if (!f) return null;
    return {
      status: f.flight_status ?? null,
      gate: f.departure?.gate ?? null,
      terminal: f.departure?.terminal ?? null,
      baggage: f.arrival?.baggage ?? null,
      delayMin: typeof f.departure?.delay === "number" ? f.departure.delay : null,
    };
  } catch {
    return null;
  }
}

export function statusMessage(phase: FlightPhase, title: string): { title: string; body: string } | null {
  switch (phase) {
    case "airborne": return { title: "Your flight is airborne", body: `${title} has departed and is now in the air. Track it live in your account.` };
    case "landed": return { title: "Your flight has landed", body: `${title} has touched down. Welcome — your concierge is a message away.` };
    default: return null;
  }
}
