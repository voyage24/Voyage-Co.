import { Navigation, Smartphone, TrainFront } from "lucide-react";
import { getGettingAround } from "@/lib/getting-around";

// "Getting around" reference for the destination: driving side, ride-hailing
// apps that work locally, and a public-transport note. Hides for unknown
// countries.
export default function GettingAround({ country }: { country?: string | null }) {
  const g = getGettingAround(country);
  if (!g) return null;

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <Navigation size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Getting around</p>
      </div>

      {g.apps.length > 0 && (
        <div className="flex items-start gap-2 text-xs text-ink-muted mb-2">
          <Smartphone size={13} className="text-gold shrink-0 mt-0.5" />
          <span><span className="text-ink font-medium">Ride-hailing:</span> {g.apps.join(" · ")}</span>
        </div>
      )}
      <div className="flex items-start gap-2 text-xs text-ink-muted">
        <TrainFront size={13} className="text-gold shrink-0 mt-0.5" />
        <span>{g.transit}</span>
      </div>
      <p className="text-[11px] text-ink-faint mt-3">
        They drive on the <span className="text-ink font-medium">{g.driveSide}</span>
        {g.driveSide === "left" ? " — look right first when crossing." : " — look left first when crossing."}
      </p>
    </div>
  );
}
