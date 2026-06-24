"use client";

import { useState } from "react";
import { Search, Anchor, Calendar, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

const REGIONS = ["All", "Caribbean", "Mediterranean", "Alaska", "Norwegian Fjords", "Antarctica", "Galápagos", "Asia & Far East", "Nile & Egypt", "European Rivers", "Transatlantic", "World Cruise", "South Pacific", "Indian Ocean", "Baltic & Scandinavia"];
const DURATIONS = ["Any", "Up to 7 nights", "8–12 nights", "13+ nights"];

export default function CruiseSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  const [region, setRegion] = useState("All");
  const [duration, setDuration] = useState("Any");
  const [guests, setGuests] = useState(2);

  const fieldCls = "flex-1 bg-panel border border-line rounded-xl px-4 py-3";
  const labelCls = "text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1 block truncate";

  const search = () => {
    const p = new URLSearchParams();
    if (region !== "All") p.set("region", region);
    router.push(`/cruises${p.toString() ? `?${p.toString()}` : ""}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className={fieldCls}>
          <label className={labelCls}><Anchor size={10} className="inline mr-1" />{t("cruiseSearch.region")}</label>
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className={fieldCls}>
          <label className={labelCls}><Calendar size={10} className="inline mr-1" />{t("cruiseSearch.duration")}</label>
          <select
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            {DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div className={`${fieldCls} flex-none min-w-[150px]`}>
          <label className={labelCls}><Users size={10} className="inline mr-1" />{t("cruiseSearch.travellers")}</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 rounded-full border border-line text-ink-muted hover:border-ink text-xs flex items-center justify-center">−</button>
            <span className="text-sm font-light text-ink">{guests}</span>
            <button onClick={() => setGuests(Math.min(12, guests + 1))} className="w-6 h-6 rounded-full border border-line text-ink-muted hover:border-ink text-xs flex items-center justify-center">+</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={search}
          className="flex items-center gap-2 px-8 py-3 bg-ink hover:bg-ink/90 text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95"
        >
          <Search size={15} /> {t("cruiseSearch.findCruises")}
        </button>
      </div>
    </div>
  );
}
