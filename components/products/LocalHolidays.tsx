"use client";

import { useEffect, useState } from "react";
import { CalendarHeart } from "lucide-react";

type Holiday = { date: string; name: string; localName: string };

// Upcoming public holidays / festivals at the destination. Loads async from
// /api/content/holidays (Nager.Date, cached) and hides entirely if there are
// none / the country isn't supported.
export default function LocalHolidays({ country }: { country?: string | null }) {
  const [holidays, setHolidays] = useState<Holiday[] | null>(null);

  useEffect(() => {
    if (!country) return;
    let on = true;
    fetch(`/api/content/holidays?country=${encodeURIComponent(country)}`)
      .then(r => r.json())
      .then(d => { if (on) setHolidays(Array.isArray(d?.holidays) ? d.holidays : []); })
      .catch(() => { if (on) setHolidays([]); });
    return () => { on = false; };
  }, [country]);

  if (!holidays || holidays.length === 0) return null;

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <CalendarHeart size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Holidays &amp; festivals ahead</p>
      </div>
      <ul className="space-y-2">
        {holidays.map((h, i) => (
          <li key={i} className="flex items-baseline justify-between gap-3">
            <span className="text-sm text-ink">
              {h.name}
              {h.localName && h.localName !== h.name && <span className="text-ink-faint text-xs"> · {h.localName}</span>}
            </span>
            <span className="text-xs text-ink-muted shrink-0 tabular-nums">{fmt(h.date)}</span>
          </li>
        ))}
      </ul>
      <p className="text-[10px] text-ink-faint mt-3 font-light">Banks and some attractions may close on public holidays.</p>
    </div>
  );
}

function fmt(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}
