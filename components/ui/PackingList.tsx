"use client";

import { useEffect, useMemo, useState } from "react";
import { Luggage, Check, Minus, Plus } from "lucide-react";
import { buildPackingList } from "@/lib/packing";
import { haptic } from "@/lib/haptics";

// Weather-aware packing checklist. Pulls a short forecast (key-less Open-Meteo)
// to tailor the clothing, and remembers ticked items per destination on-device.
export default function PackingList({ lat, lng, destinationKey }: { lat?: number; lng?: number; destinationKey: string }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(5);
  const [fc, setFc] = useState<{ maxTemp?: number; minTemp?: number; rainChance?: number }>({});
  const [ticked, setTicked] = useState<Record<string, boolean>>({});
  const storeKey = `vc-packing-${destinationKey}`;

  useEffect(() => {
    try { const raw = localStorage.getItem(storeKey); if (raw) setTicked(JSON.parse(raw)); } catch { /* ignore */ }
  }, [storeKey]);

  useEffect(() => {
    if (lat == null || lng == null || !open) return;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&forecast_days=7&timezone=auto`)
      .then(r => r.json())
      .then(d => {
        if (!d?.daily) return;
        const max = d.daily.temperature_2m_max as number[];
        const min = d.daily.temperature_2m_min as number[];
        const rain = (d.daily.precipitation_probability_max as number[]) || [];
        setFc({ maxTemp: Math.round(Math.max(...max)), minTemp: Math.round(Math.min(...min)), rainChance: rain.length ? Math.max(...rain) : undefined });
      })
      .catch(() => {});
  }, [lat, lng, open]);

  const list = useMemo(() => buildPackingList({ ...fc, days }), [fc, days]);

  const toggle = (item: string) => {
    setTicked(prev => {
      const next = { ...prev, [item]: !prev[item] };
      try { localStorage.setItem(storeKey, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
    haptic("select");
  };

  const total = Object.values(list).flat().length;
  const done = Object.values(list).flat().filter(i => ticked[i]).length;

  return (
    <div className="border border-line rounded-2xl bg-panel-soft overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-3 p-5 text-left">
        <span className="flex items-center gap-2">
          <Luggage size={16} className="text-gold" />
          <span className="font-serif text-lg font-light text-ink">Packing list</span>
        </span>
        <span className="text-xs text-ink-faint">{open ? `${done}/${total} packed` : "Open"}</span>
      </button>

      {open && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs tracking-[0.12em] uppercase text-ink-faint">Trip length</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setDays(d => Math.max(1, d - 1))} aria-label="Fewer days" className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-panel"><Minus size={13} /></button>
              <span className="text-sm text-ink w-14 text-center">{days} {days === 1 ? "day" : "days"}</span>
              <button onClick={() => setDays(d => Math.min(30, d + 1))} aria-label="More days" className="w-7 h-7 rounded-full border border-line flex items-center justify-center hover:bg-panel"><Plus size={13} /></button>
            </div>
            {fc.maxTemp != null && <span className="text-xs text-ink-faint ml-auto">Forecast {fc.minTemp}–{fc.maxTemp}°C{fc.rainChance != null && fc.rainChance >= 40 ? " · rain likely" : ""}</span>}
          </div>

          <div className="space-y-4">
            {Object.entries(list).map(([cat, items]) => (
              <div key={cat}>
                <p className="text-[11px] tracking-[0.16em] uppercase text-gold mb-2">{cat}</p>
                <ul className="space-y-1.5">
                  {items.map(item => (
                    <li key={item}>
                      <button onClick={() => toggle(item)} className="flex items-center gap-2.5 text-left w-full group">
                        <span className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 ${ticked[item] ? "bg-ink border-ink" : "border-line-strong"}`}>
                          {ticked[item] && <Check size={11} className="text-page" />}
                        </span>
                        <span className={`text-sm ${ticked[item] ? "text-ink-faint line-through" : "text-ink-muted"}`}>{item}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
