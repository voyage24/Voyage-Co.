"use client";

import { useState } from "react";
import { Search, MapPin, Route } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

const TRIP_TYPES = ["Any", "One-way", "Round-trip"];

export default function OutstationCabSearch({ cities }: { cities: string[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [tripType, setTripType] = useState("Any");

  const fieldCls = "flex-1 bg-panel border border-line rounded-xl px-4 py-2.5";
  const labelCls = "text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1 block truncate";

  const search = () => {
    const p = new URLSearchParams();
    if (from) p.set("from", from);
    if (to) p.set("to", to);
    if (tripType !== "Any") p.set("tripType", tripType);
    router.push(`/outstation-cabs${p.toString() ? `?${p.toString()}` : ""}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className={fieldCls}>
          <label className={labelCls}><MapPin size={10} className="inline mr-1" />{t("outstationCabSearch.from")}</label>
          <select
            value={from}
            onChange={e => setFrom(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            <option value="">Any city</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className={fieldCls}>
          <label className={labelCls}><MapPin size={10} className="inline mr-1" />{t("outstationCabSearch.to")}</label>
          <select
            value={to}
            onChange={e => setTo(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            <option value="">Any city</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className={`${fieldCls} flex-none lg:min-w-[170px]`}>
          <label className={labelCls}><Route size={10} className="inline mr-1" />{t("outstationCabSearch.tripType")}</label>
          <select
            value={tripType}
            onChange={e => setTripType(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            {TRIP_TYPES.map(tt => <option key={tt} value={tt}>{tt}</option>)}
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={search}
          className="flex items-center gap-2 px-7 py-2.5 bg-ink hover:bg-ink/90 text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95"
        >
          <Search size={15} /> {t("outstationCabSearch.search")}
        </button>
      </div>
    </div>
  );
}
