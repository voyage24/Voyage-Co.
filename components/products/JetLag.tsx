"use client";

import { useEffect, useState } from "react";
import { Plane, MoonStar } from "lucide-react";
import { getEmergency } from "@/lib/emergency";

// Time-difference & jet-lag helper. Compares the destination's timezone with the
// visitor's own (from the browser) and gives a plain-language read on the gap
// plus a recovery estimate. Client-only so it can read the local timezone; hides
// when we don't know the destination timezone.
export default function JetLag({ country, city }: { country?: string | null; city?: string }) {
  const tz = getEmergency(country).tz;
  const [diff, setDiff] = useState<number | null>(null); // minutes: destination − home

  useEffect(() => {
    if (!tz) return;
    try {
      const now = new Date();
      const dest = new Date(now.toLocaleString("en-US", { timeZone: tz }));
      const home = new Date(now.toLocaleString("en-US"));
      setDiff(Math.round((dest.getTime() - home.getTime()) / 60000));
    } catch { setDiff(null); }
  }, [tz]);

  if (!tz || diff === null) return null;

  const abs = Math.abs(diff);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  const label = abs < 60 && mm !== 0 ? `${mm} min` : `${hh}h${mm ? ` ${mm}m` : ""}`;
  const ahead = diff > 0;
  const minimal = abs < 120;
  // Rough recovery: ~1 day per 1.5 timezones crossed; eastward is harder.
  const days = Math.max(1, Math.round(hh / 1.5));

  const where = city || country;

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <Plane size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Time difference</p>
      </div>

      {minimal ? (
        <p className="text-sm text-ink">
          {where} is {abs === 0 ? "in your time zone" : <><span className="font-medium">{label}</span> {ahead ? "ahead" : "behind"}</>} — little to no jet lag.
        </p>
      ) : (
        <>
          <p className="text-sm text-ink">
            {where} is <span className="font-medium">{label} {ahead ? "ahead of" : "behind"}</span> your time.
          </p>
          <div className="flex items-start gap-2 mt-2 text-xs text-ink-muted">
            <MoonStar size={13} className="text-gold shrink-0 mt-0.5" />
            <span>
              Allow roughly <span className="text-ink font-medium">{days} day{days > 1 ? "s" : ""}</span> to adjust.
              {ahead
                ? " Flying east feels harder — get morning light and shift your bedtime earlier a few days before."
                : " Flying west is easier — stay up to local bedtime and soak up afternoon light."}
            </span>
          </div>
        </>
      )}
    </div>
  );
}
