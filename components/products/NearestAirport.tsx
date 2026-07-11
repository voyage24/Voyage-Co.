import { Plane, Clock, MapPin } from "lucide-react";
import { nearestAirport, formatDuration } from "@/lib/nearest-airport";

// Nearest airport + estimated transfer time, computed from the property's
// coordinates. Renders nothing if we have no coordinates for it.
export default function NearestAirport({ lat, lng }: { lat?: number | null; lng?: number | null }) {
  if (lat == null || lng == null) return null;
  const a = nearestAirport(lat, lng);
  if (!a) return null;

  return (
    <div className="flex items-start gap-3 rounded-2xl border border-line bg-panel-soft p-5">
      <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
        <Plane size={17} className="text-gold" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint mb-1">Nearest airport</p>
        <p className="text-sm text-ink font-medium">{a.name} <span className="text-ink-faint font-normal">({a.code})</span></p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1.5"><MapPin size={12} className="text-gold" /> ~{a.distanceKm} km</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={12} className="text-gold" /> approx. {formatDuration(a.minutes)} transfer</span>
        </div>
      </div>
    </div>
  );
}
