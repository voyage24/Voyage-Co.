import { TrendingUp } from "lucide-react";
import { getSeasonality } from "@/lib/seasonality";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// One-hue ordinal ramp (validated: node scripts/validate_palette.js --ordinal,
// both modes pass — lightness-monotone, ≥0.06 adjacent steps, light end ≥2:1 on
// surface). Cheap = least salient, expensive = most salient in both modes —
// dark mode flips its anchor (near-surface end is the *dark* step there, not
// the light one), per the sequential-ramp convention.
const TIER_CLASS = [
  "bg-[#c9a05c] dark:bg-[#6b5220]", // low season -> lower typical rates
  "bg-[#8c6528] dark:bg-[#c79a4c]", // shoulder
  "bg-[#664616] dark:bg-[#f0cf82]", // peak season -> higher typical rates
];
const TIER_LABEL = ["Lower rates", "Typical rates", "Higher rates"];

// Illustrative month-by-month rate indicator for a destination, derived from
// the same seasonality data as BestTimeToVisit — peak (ideal) months read as
// pricier, off-season (poor) months as cheaper. There's no live pricing engine
// behind this site, so this is a typical-demand estimate, not a real rate
// calendar — labelled as such. Hides for countries we lack data for.
export default function SeasonalPriceIndicator({ country }: { country?: string | null }) {
  const s = getSeasonality(country);
  if (!s) return null;

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Typical seasonal rates</p>
      </div>
      <div className="flex gap-1">
        {s.months.map((r, i) => (
          <div key={i} className="flex-1 text-center" title={`${FULL[i]}: ${TIER_LABEL[r]}`}>
            <div className={`h-6 rounded-sm ${TIER_CLASS[r]}`} aria-hidden />
            <span className="text-[9px] text-ink-faint mt-1 block">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-ink-faint">
        {TIER_LABEL.map((label, i) => (
          <span key={label} className="inline-flex items-center gap-1.5">
            <i className={`w-2.5 h-2.5 rounded-sm inline-block ${TIER_CLASS[i]}`} /> {label}
          </span>
        ))}
      </div>
      <p className="text-[10px] text-ink-faint font-light mt-3">
        Illustrative — based on typical seasonal demand, not a live rate calendar.
      </p>
    </div>
  );
}
