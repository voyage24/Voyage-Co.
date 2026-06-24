"use client";

import { useState } from "react";
import { Search, MapPin, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

const CATEGORIES = ["All", "Adventure", "Wellness", "Wildlife", "Cultural", "Culinary", "Spiritual"];

export default function ExperienceSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  const [destination, setDestination] = useState("");
  const [category, setCategory] = useState("All");
  const [people, setPeople] = useState(2);

  const fieldCls = "flex-1 bg-panel border border-line rounded-xl px-4 py-3";
  const labelCls = "text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1 block truncate";

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-2">
        <div className={fieldCls}>
          <label className={labelCls}><MapPin size={10} className="inline mr-1" />{t("hotelSearch.destination")}</label>
          <input
            value={destination}
            onChange={e => setDestination(e.target.value)}
            placeholder={t("experienceSearch.destinationPlaceholder")}
            className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none font-light"
          />
        </div>

        <div className={fieldCls}>
          <label className={labelCls}>{t("experienceSearch.category")}</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className={`${fieldCls} flex-none min-w-[150px]`}>
          <label className={labelCls}><Users size={10} className="inline mr-1" />{t("experienceSearch.people")}</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setPeople(Math.max(1, people - 1))} className="w-6 h-6 rounded-full border border-line text-ink-muted hover:border-ink text-xs flex items-center justify-center">−</button>
            <span className="text-sm font-light text-ink">{people}</span>
            <button onClick={() => setPeople(Math.min(20, people + 1))} className="w-6 h-6 rounded-full border border-line text-ink-muted hover:border-ink text-xs flex items-center justify-center">+</button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => router.push("/experiences")}
          className="flex items-center gap-2 px-8 py-3 bg-ink hover:bg-ink/90 text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95"
        >
          <Search size={15} /> {t("experienceSearch.findExperiences")}
        </button>
      </div>
    </div>
  );
}
