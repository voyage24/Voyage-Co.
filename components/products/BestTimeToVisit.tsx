import { CalendarRange } from "lucide-react";
import { getSeasonality } from "@/lib/seasonality";

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const FULL = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// A 12-month "best time to visit" strip for a destination country. Green = ideal,
// gold = good/shoulder, muted = less ideal. Renders nothing for countries we have
// no data for, so it degrades gracefully.
export default function BestTimeToVisit({ country }: { country?: string | null }) {
  const s = getSeasonality(country);
  if (!s) return null;

  const ideal = s.months
    .map((r, i) => (r === 2 ? FULL[i] : null))
    .filter(Boolean) as string[];

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <CalendarRange size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Best time to visit</p>
      </div>
      <div className="flex gap-1">
        {s.months.map((r, i) => (
          <div key={i} className="flex-1 text-center" title={`${FULL[i]}: ${r === 2 ? "ideal" : r === 1 ? "good" : "less ideal"}`}>
            <div
              className={`h-6 rounded-sm ${r === 2 ? "bg-emerald-500/80" : r === 1 ? "bg-gold/60" : "bg-line-strong/50"}`}
              aria-hidden
            />
            <span className="text-[9px] text-ink-faint mt-1 block">{MONTHS[i]}</span>
          </div>
        ))}
      </div>
      {ideal.length > 0 && (
        <p className="text-xs text-ink-muted mt-3">
          <span className="text-ink font-medium">Peak months:</span> {formatMonths(ideal)}.
        </p>
      )}
      <p className="text-xs text-ink-muted mt-1 font-light">{s.note}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-[10px] text-ink-faint">
        <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 inline-block" /> Ideal</span>
        <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-gold/60 inline-block" /> Good</span>
        <span className="inline-flex items-center gap-1.5"><i className="w-2.5 h-2.5 rounded-sm bg-line-strong/50 inline-block" /> Less ideal</span>
      </div>
    </div>
  );
}

// ["April","May","September","October"] → "Apr–May and Sep–Oct" style summary.
function formatMonths(names: string[]): string {
  const idx = names.map(n => FULL.indexOf(n)).sort((a, b) => a - b);
  const runs: [number, number][] = [];
  for (const i of idx) {
    const last = runs[runs.length - 1];
    if (last && i === last[1] + 1) last[1] = i;
    else runs.push([i, i]);
  }
  const abbr = (i: number) => FULL[i].slice(0, 3);
  return runs.map(([a, b]) => (a === b ? abbr(a) : `${abbr(a)}–${abbr(b)}`)).join(" and ");
}
