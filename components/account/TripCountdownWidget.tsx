"use client";

import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";

// Interactive trip day-counter. Before the trip it counts down (days, then
// hours:minutes in the final stretch); during the trip it shows "Day X of Y"
// with a live progress bar. Updates on its own. Renders nothing once the trip
// has passed or dates are missing.
export default function TripCountdownWidget({ checkIn, checkOut, title }: { checkIn: string | null; checkOut: string | null; title: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!checkIn || now === null) return null;
  const start = new Date(checkIn).getTime();
  const end = checkOut ? new Date(checkOut).getTime() : start + 86_400_000;
  if (isNaN(start)) return null;

  const startOfDay = (t: number) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const dayDiff = (a: number, b: number) => Math.round((startOfDay(a) - startOfDay(b)) / 86_400_000);

  let phase: "before" | "during" | "after";
  if (now < startOfDay(start)) phase = "before";
  else if (now <= end) phase = "during";
  else phase = "after";
  if (phase === "after") return null;

  let big = "", small = "", progress = 0;
  if (phase === "before") {
    const days = dayDiff(start, now);
    if (days > 1) { big = String(days); small = "days to go"; }
    else {
      // Final 48h: tick down in hours / minutes.
      const ms = start - now;
      const h = Math.max(0, Math.floor(ms / 3_600_000));
      const m = Math.max(0, Math.floor((ms % 3_600_000) / 60_000));
      big = days === 1 && h > 24 ? "Tomorrow" : `${h}h ${m}m`;
      small = days === 1 && h > 24 ? "you leave" : "until you leave";
    }
  } else {
    const total = Math.max(1, dayDiff(end, start) + 1);
    const day = Math.min(total, dayDiff(now, start) + 1);
    big = `Day ${day}`;
    small = `of ${total}`;
    progress = Math.min(1, Math.max(0, (now - start) / (end - start)));
  }

  return (
    <div className="rounded-2xl border border-line bg-gradient-to-br from-vc-950 to-[#2a1216] text-[#f4f0e9] p-6 mb-4 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <CalendarClock size={15} className="text-gold" />
        <p className="text-[10px] tracking-[0.28em] uppercase text-gold">{phase === "during" ? "You're on your trip" : "Countdown"}</p>
      </div>
      <div className="flex items-end gap-3">
        <span className="font-serif text-5xl sm:text-6xl font-light leading-none">{big}</span>
        <span className="text-sm text-white/70 pb-1.5">{small}</span>
      </div>
      <p className="text-sm text-white/60 font-light mt-2 truncate">{title}</p>
      {phase === "during" && (
        <div className="mt-4 h-1.5 rounded-full bg-white/15 overflow-hidden">
          <div className="h-full rounded-full bg-gold transition-[width] duration-1000" style={{ width: `${Math.round(progress * 100)}%` }} />
        </div>
      )}
    </div>
  );
}
