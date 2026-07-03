// Live aircraft position via the free, key-less adsb.lol ADS-B API. ADS-B
// identifies flights by their ICAO callsign (airline ICAO code + number), so we
// map the IATA airline code the traveller enters to its ICAO designator.
const IATA_TO_ICAO: Record<string, string> = {
  AI: "AIC", "6E": "IGO", UK: "VTI", SG: "SEJ", IX: "AXB", "9I": "LLR", QP: "AKJ", I5: "IAD",
  EK: "UAE", EY: "ETD", FZ: "FDB", QR: "QTR", SV: "SVA", GF: "GFA", WY: "OMA", KU: "KAC", RJ: "RJA", ME: "MEA",
  SQ: "SIA", TG: "THA", MH: "MAS", CX: "CPA", BR: "EVA", CI: "CAL", JL: "JAL", NH: "ANA", KE: "KAL", OZ: "AAR",
  GA: "GIA", VN: "HVN", PR: "PAL", CZ: "CSN", MU: "CES", CA: "CCA", HU: "CHH", BI: "RBA", UL: "ALK", PG: "BKP",
  QF: "QFA", NZ: "ANZ", VA: "VOZ", FJ: "FJI",
  BA: "BAW", VS: "VIR", LH: "DLH", AF: "AFR", KL: "KLM", LX: "SWR", AZ: "ITY", IB: "IBE", TP: "TAP", SK: "SAS",
  AY: "FIN", OS: "AUA", SN: "BEL", LO: "LOT", TK: "THY", SU: "AFL", EW: "EWG", U2: "EZY", FR: "RYR", VY: "VLG",
  AA: "AAL", UA: "UAL", DL: "DAL", AC: "ACA", WN: "SWA", B6: "JBU", AS: "ASA", F9: "FFT", NK: "NKS", WS: "WJA",
  AM: "AMX", LA: "LAN", AV: "AVA", CM: "CMP", AR: "ARG", G3: "GLO", AD: "AZU", ET: "ETH", MS: "MSR", SA: "SAA",
  AT: "RAM", KQ: "KQA", RW: "RWD",
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
