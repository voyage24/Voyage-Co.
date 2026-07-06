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

export function statusMessage(phase: FlightPhase, title: string): { title: string; body: string } | null {
  switch (phase) {
    case "airborne": return { title: "Your flight is airborne", body: `${title} has departed and is now in the air. Track it live in your account.` };
    case "landed": return { title: "Your flight has landed", body: `${title} has touched down. Welcome — your concierge is a message away.` };
    default: return null;
  }
}
