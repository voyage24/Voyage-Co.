"use client";

import { useMemo, useState } from "react";
import { Leaf, MessageCircle } from "lucide-react";
import { GATEWAYS, estimateFlightCarbon, haversineKm } from "@/lib/carbon";
import { useSetting } from "@/components/providers/SettingsProvider";

// Round-trip flight carbon estimate for the destination. The guest picks their
// departure gateway; we show the estimated CO2 and a tree-equivalent, plus a
// one-tap concierge request to arrange a verified offset (offsets are arranged
// by the team rather than sold online today).
export default function CarbonEstimate({ lat, lng, destination }: { lat: number; lng: number; destination?: string }) {
  const wa = useSetting("contact.whatsapp") || "919919910213";
  // Default to the nearest gateway so the first number shown is sensible.
  const nearest = useMemo(() => {
    let best = GATEWAYS[0], bd = Infinity;
    for (const g of GATEWAYS) { const d = haversineKm(g.lat, g.lng, lat, lng); if (d < bd) { bd = d; best = g; } }
    return best.code;
  }, [lat, lng]);
  const [origin, setOrigin] = useState(nearest);

  const g = GATEWAYS.find(x => x.code === origin) || GATEWAYS[0];
  const est = estimateFlightCarbon(g.lat, g.lng, lat, lng);
  const sameCity = est.km < 60; // origin ≈ destination — no meaningful flight

  const waText = encodeURIComponent(
    `Hello, I'd like to arrange a verified carbon offset for my trip${destination ? ` to ${destination}` : ""} (estimated ${est.kg} kg CO₂e round-trip from ${g.label}).`,
  );

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <Leaf size={16} className="text-emerald-600" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Travel footprint</p>
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-muted mb-3">
        <span>Flying from</span>
        <select
          value={origin}
          onChange={e => setOrigin(e.target.value)}
          className="bg-panel border border-line rounded-sm px-2 py-1 text-ink text-xs focus:outline-none focus:border-gold"
        >
          {GATEWAYS.map(x => <option key={x.code} value={x.code}>{x.label}</option>)}
        </select>
      </div>

      {sameCity ? (
        <p className="text-xs text-ink-muted font-light">Choose your departure city to estimate the round-trip flight footprint.</p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-2xl font-light text-ink">{est.kg.toLocaleString()}</span>
            <span className="text-xs text-ink-faint">kg CO₂e · round trip</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-1">
            ≈ {est.km.toLocaleString()} km each way · what {est.trees} tree{est.trees > 1 ? "s" : ""} absorb in a year.
          </p>
          <a
            href={`https://wa.me/${wa}?text=${waText}`} target="_blank" rel="noopener noreferrer"
            className="mt-4 w-full inline-flex items-center justify-center gap-2 py-2.5 border border-emerald-600/40 text-emerald-700 text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-emerald-50 transition-colors"
          >
            <MessageCircle size={14} /> Arrange a verified offset
          </a>
        </>
      )}
      <p className="text-[10px] text-ink-faint mt-3 font-light">Estimate only — economy class, including high-altitude effects.</p>
    </div>
  );
}
