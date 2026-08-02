"use client";

import { useState } from "react";
import { Search, MapPin, Car, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

const VEHICLES = ["Any", "Sedan", "SUV", "Luxury Sedan", "Van"];

export default function AirportCabSearch({ cities }: { cities: string[] }) {
  const { t } = useLanguage();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [vehicle, setVehicle] = useState("Any");
  const [date, setDate] = useState("");

  const fieldCls = "flex-1 bg-panel border border-line rounded-xl px-4 py-3";
  const labelCls = "text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1 block truncate";

  const search = () => {
    const p = new URLSearchParams();
    if (city) p.set("city", city);
    if (vehicle !== "Any") p.set("vehicle", vehicle);
    if (date) p.set("date", date);
    router.push(`/airport-cabs${p.toString() ? `?${p.toString()}` : ""}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className={fieldCls}>
          <label className={labelCls}><MapPin size={10} className="inline mr-1" />{t("airportCabSearch.city")}</label>
          <select
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            <option value="">Any city</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className={fieldCls}>
          <label className={labelCls}><Car size={10} className="inline mr-1" />{t("airportCabSearch.vehicle")}</label>
          <select
            value={vehicle}
            onChange={e => setVehicle(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            {VEHICLES.map(v => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>

        <div className={`${fieldCls} flex-none lg:min-w-[170px]`}>
          <label className={labelCls}><Calendar size={10} className="inline mr-1" />{t("airportCabSearch.date")}</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={search}
          className="flex items-center gap-2 px-8 py-3 bg-ink hover:bg-ink/90 text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95"
        >
          <Search size={15} /> {t("airportCabSearch.search")}
        </button>
      </div>
    </div>
  );
}
