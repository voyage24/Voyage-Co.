"use client";

import { useEffect, useState } from "react";
import { Plane, Clock, MapPin, Car } from "lucide-react";
import { nearestAirport, formatDuration, type NearestAirport as NA } from "@/lib/nearest-airport";

type Transfer = NA & { source: "precise" | "estimate"; km?: number };

// Nearest airport + transfer time. Shows the instant distance-based estimate
// immediately, then upgrades to the precise road time once the API responds
// (computed via OpenRouteService and cached). Islands / no-road stay on estimate.
export default function NearestAirport({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  const [data, setData] = useState<Transfer | null>(() =>
    lat != null && lng != null ? (() => { const a = nearestAirport(lat, lng); return a ? { ...a, source: "estimate" as const } : null; })() : null,
  );

  useEffect(() => {
    if (lat == null || lng == null) return;
    let on = true;
    fetch(`/api/route/transfer?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(d => { if (on && d?.transfer) setData(d.transfer); })
      .catch(() => {});
    return () => { on = false; };
  }, [lat, lng]);

  if (!data) return null;
  const precise = data.source === "precise";
  const km = precise ? (data.km ?? data.distanceKm) : data.distanceKm;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-panel-soft p-5">
      <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
        <Plane size={17} className="text-gold" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint mb-1">Nearest airport</p>
        <p className="text-sm text-ink font-medium">{data.name} <span className="text-ink-faint font-normal">({data.code})</span></p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> {precise ? "" : "~"}{km} km</span>
          <span className="inline-flex items-center gap-1.5">
            {precise ? <Car size={12} className="text-gold" /> : <Clock size={12} className="text-gold" />}
            {precise ? `${formatDuration(data.minutes)} drive` : `approx. ${formatDuration(data.minutes)} transfer`}
          </span>
        </div>
      </div>
    </div>
  );
}
