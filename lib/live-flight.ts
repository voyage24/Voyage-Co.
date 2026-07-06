// Live aircraft position via the free, key-less adsb.lol ADS-B API. ADS-B
// identifies flights by their ICAO callsign (airline ICAO code + number), so we
// map the IATA airline code the traveller enters to its ICAO designator.
const IATA_TO_ICAO: Record<string, string> = {
  // India
  AI: "AIC", "6E": "IGO", UK: "VTI", SG: "SEJ", QP: "AKJ", G8: "GOW", I5: "IAD", "9I": "LLR", IX: "AXB", S5: "SDG",
  // Middle East
  EK: "UAE", EY: "ETD", FZ: "FDB", G9: "ABY", QR: "QTR", SV: "SVA", F3: "FNS", GF: "GFA", WY: "OMA", KU: "KAC",
  J9: "JZR", RJ: "RJA", LY: "ELY", ME: "MEA", IA: "IAW", IR: "IRA",
  // South & Southeast Asia
  SQ: "SIA", TR: "TGW", TG: "THA", FD: "AIQ", PG: "BKP", MH: "MAS", AK: "AXM", D7: "XAX", GA: "GIA", ID: "BTK",
  JT: "LNI", QZ: "AWQ", PR: "PAL", "5J": "CEB", VN: "HVN", VJ: "VJC", QH: "BAV", UL: "ALK", Q2: "DQA", RA: "RNA",
  KB: "DRK", B3: "BBA", PK: "PIA", BG: "BBC", K6: "KHV", QV: "LAO",
  // East Asia
  CX: "CPA", HX: "CRK", CI: "CAL", BR: "EVA", CA: "CCA", MU: "CES", CZ: "CSN", HU: "CHH", FM: "CSH", MF: "CXA",
  ZH: "CSZ", KE: "KAL", OZ: "AAR", TW: "TWB", NH: "ANA", JL: "JAL", MM: "APJ", GK: "JJP",
  // Oceania
  QF: "QFA", VA: "VOZ", JQ: "JST", NZ: "ANZ", FJ: "FJI",
  // Europe
  BA: "BAW", VS: "VIR", U2: "EZY", AF: "AFR", TX: "FWI", LH: "DLH", EW: "EWG", DE: "CFG", KL: "KLM", LX: "SWR",
  OS: "AUA", IB: "IBE", VY: "VLG", AZ: "ITY", A3: "AEE", TK: "THY", PC: "PGT", SK: "SAS", DY: "NAX", AY: "FIN",
  FI: "ICE", SN: "BEL", TP: "TAP", EI: "EIN", FR: "RYR", LO: "LOT", OK: "CSA", W6: "WZZ", SU: "AFL", S7: "SBI",
  RO: "ROT", FB: "LZB", JU: "ASL", OU: "CTN", BT: "BTI",
  // North America
  AA: "AAL", DL: "DAL", UA: "UAL", WN: "SWA", B6: "JBU", AS: "ASA", NK: "NKS", F9: "FFT", G4: "AAY", HA: "HAL",
  SY: "SCX", AC: "ACA", WS: "WJA", PD: "POE", AM: "AMX", Y4: "VOI", VB: "VIV", CM: "CMP", TA: "AVA", AV: "AVA",
  // South America
  LA: "LAN", G3: "GLO", AD: "AZU", AR: "ARG", H2: "SKU", "5U": "BOV",
  // Africa
  ET: "ETH", KQ: "KQA", SA: "SAA", MN: "LNK", MS: "MSR", AT: "RAM", AH: "DAH", TU: "TAR", WB: "RWD", MK: "MAU",
  HM: "SEY", W3: "ARA", P4: "PCE", KP: "SKK", TC: "ATC", RW: "RWD", BI: "RBA",
};

export interface LivePosition {
  callsign: string;
  lat: number;
  lng: number;
  heading: number;      // degrees (track)
  altitude: number | null; // feet
  speed: number | null;    // knots (ground speed)
  onGround: boolean;
}

export function isSupportedAirline(carrier: string) {
  return !!IATA_TO_ICAO[carrier.toUpperCase()];
}

// Build the ADS-B callsign (ICAO airline + number, digits only) for a flight,
// e.g. carrier "EK", number "EK 502" → "UAE502". Null if the airline isn't
// in our IATA→ICAO map.
export function callsignFor(carrier: string, flightNumber: string): string | null {
  const icao = IATA_TO_ICAO[carrier.toUpperCase()];
  if (!icao) return null;
  const digits = (flightNumber || "").replace(/\D/g, "");
  if (!digits) return null;
  return `${icao}${digits}`;
}

export interface NearbyFlight {
  callsign: string;
  lat: number;
  lng: number;
  heading: number;
  altitude: number | null;
  speed: number | null;
}

// All aircraft currently within `dist` nautical miles of a point.
export async function getNearbyFlights(lat: number, lng: number, dist = 150): Promise<NearbyFlight[]> {
  const res = await fetch(`https://api.adsb.lol/v2/lat/${lat}/lon/${lng}/dist/${dist}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: 8 },
  });
  if (!res.ok) throw new Error(`ADS-B error ${res.status}`);
  const json = await res.json();
  return (json.ac ?? [])
    .filter((a: { lat?: number; lon?: number; flight?: string }) => a.lat != null && a.lon != null && a.flight)
    .slice(0, 80)
    .map((a: { flight?: string; lat: number; lon: number; track?: number; alt_baro?: number | string; gs?: number }) => ({
      callsign: (a.flight ?? "").trim(),
      lat: a.lat,
      lng: a.lon,
      heading: typeof a.track === "number" ? a.track : 0,
      altitude: typeof a.alt_baro === "number" ? a.alt_baro : null,
      speed: typeof a.gs === "number" ? Math.round(a.gs) : null,
    }));
}

export async function getLivePosition(carrier: string, number: string): Promise<LivePosition | null> {
  const icao = IATA_TO_ICAO[carrier.toUpperCase()];
  if (!icao) throw new Error("UNSUPPORTED_AIRLINE");
  const digits = number.replace(/\D/g, "");
  const callsign = `${icao}${digits}`;

  const res = await fetch(`https://api.adsb.lol/v2/callsign/${callsign}`, {
    headers: { "Accept": "application/json" },
    next: { revalidate: 8 },
  });
  if (!res.ok) throw new Error(`ADS-B error ${res.status}`);
  const json = await res.json();
  const ac = (json.ac ?? []).find((a: { lat?: number; lon?: number }) => a.lat != null && a.lon != null) ?? (json.ac ?? [])[0];
  if (!ac || ac.lat == null || ac.lon == null) return null;

  const alt = typeof ac.alt_baro === "number" ? ac.alt_baro : (typeof ac.alt_geom === "number" ? ac.alt_geom : null);
  return {
    callsign: (ac.flight ?? callsign).trim(),
    lat: ac.lat,
    lng: ac.lon,
    heading: typeof ac.track === "number" ? ac.track : 0,
    altitude: alt,
    speed: typeof ac.gs === "number" ? Math.round(ac.gs) : null,
    onGround: ac.alt_baro === "ground",
  };
}
