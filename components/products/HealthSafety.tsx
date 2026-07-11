import { HeartPulse, Droplets } from "lucide-react";
import { getHealthSafety } from "@/lib/health-safety";

const WATER = {
  safe: { label: "Tap water is safe to drink", cls: "text-emerald-600" },
  caution: { label: "Tap water — bottled recommended", cls: "text-amber-600" },
  bottled: { label: "Drink bottled or purified water", cls: "text-amber-600" },
};

// Health & safety brief for the destination: tap-water guidance + a couple of
// reference notes, always with a travel-clinic + insurance footer. Reference
// only, non-prescriptive. Hides for unknown countries.
export default function HealthSafety({ country }: { country?: string | null }) {
  const h = getHealthSafety(country);
  if (!h) return null;
  const w = WATER[h.tapWater];

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <HeartPulse size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Health &amp; safety</p>
      </div>

      <div className="flex items-center gap-2 text-xs mb-2">
        <Droplets size={13} className={`${w.cls} shrink-0`} />
        <span className={`font-medium ${w.cls}`}>{w.label}</span>
      </div>

      <ul className="space-y-1.5">
        {h.notes.map((n, i) => (
          <li key={i} className="text-xs text-ink-muted flex gap-2">
            <span className="text-gold mt-0.5">·</span>
            <span>{n}</span>
          </li>
        ))}
      </ul>

      <p className="text-[10px] text-ink-faint mt-3 font-light">
        General guidance — confirm vaccinations with a travel clinic 4–6 weeks ahead. Comprehensive travel insurance is strongly recommended.
      </p>
    </div>
  );
}
