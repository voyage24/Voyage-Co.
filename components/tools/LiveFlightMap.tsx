"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Plane, Loader2 } from "lucide-react";
import { getWorldMap, getWorldDotsSVG } from "@/lib/world-map-singleton";
import { AIRLINES } from "@/lib/airlines";

// Lucide "Plane" path, drawn natively inside the map's SVG coordinate space.
const PLANE_PATH =
  "M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z";

type Pos = { callsign: string; lat: number; lng: number; heading: number; altitude: number | null; speed: number | null; onGround: boolean; updated: number };

export default function LiveFlightMap() {
  const map = useMemo(() => getWorldMap(), []);
  const dotsSVG = useMemo(() => getWorldDotsSVG("meet", 0.5), []);
  const { width, height } = map.image;

  const [carrier, setCarrier] = useState("");
  const [number, setNumber] = useState("");
  const [tracking, setTracking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pos, setPos] = useState<Pos | null>(null);
  const timer = useRef<ReturnType<typeof setInterval>>();

  const airlines = useMemo(() => [...AIRLINES].sort((a, b) => a.name.localeCompare(b.name)), []);
  const pin = useMemo(() => (pos ? map.getPin({ lat: pos.lat, lng: pos.lng }) : null), [pos, map]);

  const fetchPos = async (c: string, n: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/flights/live?carrier=${encodeURIComponent(c)}&number=${encodeURIComponent(n)}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Couldn't track that flight."); setPos(null); return; }
      if (!data.position) { setError("This flight isn't broadcasting a live position right now (it may be on the ground or between flights)."); setPos(null); }
      else { setPos({ ...data.position, updated: Date.now() }); setError(""); }
    } catch {
      setError("Couldn't reach the live flight service.");
    } finally {
      setLoading(false);
    }
  };

  const start = (e: React.FormEvent) => {
    e.preventDefault();
    if (!carrier.trim() || !number.trim()) return;
    setTracking(true); setError(""); setPos(null);
    fetchPos(carrier.trim(), number.trim());
    clearInterval(timer.current);
    timer.current = setInterval(() => fetchPos(carrier.trim(), number.trim()), 15000);
  };

  useEffect(() => () => clearInterval(timer.current), []);

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <div>
      <form onSubmit={start} className="bg-panel border border-line rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end mb-6">
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Airline</label>
          <input list="live-airlines" required value={carrier} onChange={e => setCarrier(e.target.value.toUpperCase())} placeholder="e.g. AI" maxLength={3} className={field} />
          <datalist id="live-airlines">{airlines.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}</datalist>
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Flight no.</label>
          <input required value={number} onChange={e => setNumber(e.target.value)} placeholder="e.g. 101" className={field} />
        </div>
        <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Plane size={15} />} Track live
        </button>
      </form>

      {tracking && (
        <>
          <div className="relative w-full overflow-hidden rounded-2xl border border-line" style={{ aspectRatio: "2 / 1", background: "radial-gradient(140% 115% at 50% 55%, #51565c 0%, #3b3f45 52%, #24272b 100%)" }}>
            <div className="absolute inset-0 [&>svg]:w-full [&>svg]:h-full" dangerouslySetInnerHTML={{ __html: dotsSVG }} />
            {pin && pos && (
              <svg viewBox={`0 0 ${width} ${height}`} className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
                <circle cx={pin.x} cy={pin.y} r={0.7} fill="rgb(var(--gold-soft))" className="pulse-ring" />
                <g transform={`translate(${pin.x}, ${pin.y}) rotate(${pos.heading}) scale(0.11) translate(-12,-12)`}>
                  <path d={PLANE_PATH} fill="#f4f0e9" stroke="#f4f0e9" strokeWidth={0.6} strokeLinejoin="round" />
                </g>
              </svg>
            )}
            {loading && !pos && (
              <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm gap-2"><Loader2 size={16} className="animate-spin" /> Locating aircraft…</div>
            )}
          </div>

          {error && <p className="text-sm text-ink-muted mt-4 text-center">{error}</p>}

          {pos && (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div><p className="font-serif text-2xl font-light text-ink">{pos.altitude != null ? `${pos.altitude.toLocaleString()} ft` : "—"}</p><p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mt-1">Altitude</p></div>
              <div><p className="font-serif text-2xl font-light text-ink">{pos.speed != null ? `${pos.speed} kt` : "—"}</p><p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mt-1">Ground speed</p></div>
              <div><p className="font-serif text-2xl font-light text-ink">{Math.round(pos.heading)}°</p><p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mt-1">Heading</p></div>
              <div><p className="font-serif text-2xl font-light text-gold">{pos.callsign}</p><p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mt-1">Callsign · live</p></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
