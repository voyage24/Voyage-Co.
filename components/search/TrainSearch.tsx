"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowLeftRight, Search, Calendar, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { STATIONS } from "@/lib/mock-data";
import type { Station } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useIsMobile } from "@/lib/useIsMobile";
import MobilePickerSheet from "@/components/ui/MobilePickerSheet";

// `tClass` state stores the English code and is sent as the API query param;
// only the displayed label is translated, via this lookup.
const TRAIN_CLASSES = ["SL", "3A", "2A", "1A", "CC", "EC"];
const CLASS_LABEL_KEYS: Record<string, string> = {
  SL: "trainSearch.classLabel.SL", "3A": "trainSearch.classLabel.3A", "2A": "trainSearch.classLabel.2A",
  "1A": "trainSearch.classLabel.1A", CC: "trainSearch.classLabel.CC", EC: "trainSearch.classLabel.EC",
};

function StationAutocomplete({
  label, value, onChange,
}: { label: string; value: Station | null; onChange: (s: Station) => void }) {
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [query, setQuery] = useState(value ? `${value.name} (${value.code})` : ""); // display value
  const [search, setSearch] = useState(""); // mobile sheet search
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) setQuery(`${value.name} (${value.code})`);
  }, [value]);

  useEffect(() => {
    if (isMobile) return; // mobile sheet manages its own dismissal
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile]);

  const term = isMobile ? search : query;
  const matches = term.length > 1
    ? STATIONS.filter(s =>
        s.name.toLowerCase().includes(term.toLowerCase()) ||
        s.city.toLowerCase().includes(term.toLowerCase()) ||
        s.code.toLowerCase().includes(term.toLowerCase())
      ).slice(0, 6)
    : STATIONS.slice(0, 6);

  const pick = (s: Station) => { onChange(s); setQuery(`${s.name} (${s.code})`); setOpen(false); setSearch(""); };
  const close = () => { setOpen(false); setSearch(""); };

  const items = matches.map(s => (
    <button
      key={s.code}
      type="button"
      onClick={() => pick(s)}
      className="w-full px-4 py-2.5 text-left hover:bg-panel-soft transition-colors border-b border-line last:border-0"
    >
      <span className="font-medium text-ink text-sm">{s.name}</span>
      <span className="text-xs text-ink-faint ml-2">{s.code}</span>
      <span className="text-xs text-ink-faint ml-2">· {s.city}</span>
    </button>
  ));

  return (
    <div ref={ref} className="relative">
      <p className="text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1">{label}</p>
      <input
        value={query}
        onChange={e => { if (!isMobile) { setQuery(e.target.value); setOpen(true); } }}
        onFocus={isMobile ? undefined : () => setOpen(true)}
        onClick={isMobile ? () => { setSearch(""); setOpen(true); } : undefined}
        readOnly={isMobile}
        inputMode={isMobile ? "none" : undefined}
        placeholder={t("trainSearch.cityOrStation")}
        className={`w-full bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none font-light ${isMobile ? "cursor-pointer" : ""}`}
      />
      {open && (isMobile ? (
        <MobilePickerSheet title={label} query={search} onQueryChange={setSearch} onClose={close} searchPlaceholder={t("trainSearch.cityOrStation")}>
          <div className="py-1">{items}</div>
        </MobilePickerSheet>
      ) : (
        matches.length > 0 && (
          <div className="absolute top-full left-0 mt-2 w-72 max-w-[90vw] bg-panel-raised border border-line rounded-xl shadow-widget z-50 overflow-hidden">
            {items}
          </div>
        )
      ))}
    </div>
  );
}

export default function TrainSearch() {
  const { t } = useLanguage();
  const router = useRouter();
  // Start empty rather than a fixed New Delhi → Mumbai CST default, so the bar
  // isn't "stuck" on a route the traveller didn't choose.
  const [from, setFrom] = useState<Station | null>(null);
  const [to, setTo]   = useState<Station | null>(null);
  const [date, setDate] = useState("");
  const [tClass, setTClass] = useState("3A");
  const [showClass, setShowClass] = useState(false);
  const classRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (classRef.current && !classRef.current.contains(e.target as Node)) setShowClass(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const swap = () => { const temp = from; setFrom(to); setTo(temp); };

  const fieldCls = "flex-1 bg-panel border border-line rounded-xl px-4 py-3";
  const labelCls = "text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1 block truncate";

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-2">
        {/* From / To */}
        <div className="flex flex-1 bg-panel border border-line rounded-xl overflow-visible relative">
          <div className="flex-1 px-4 py-3 min-w-0">
            <StationAutocomplete label={t("flightSearch.from")} value={from} onChange={setFrom} />
          </div>

          {/* Dedicated column for the swap button — reserves real layout space so it
              can never overlap the From/To text, matching the flights search pattern. */}
          <div className="relative flex items-center justify-center w-14 shrink-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-line" />
            <button
              type="button"
              onClick={swap}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-panel-raised border border-line flex items-center justify-center hover:border-ink hover:text-ink transition-colors shadow-card"
            >
              <ArrowLeftRight size={14} />
            </button>
          </div>

          <div className="flex-1 px-4 py-3 min-w-0">
            <StationAutocomplete label={t("flightSearch.to")} value={to} onChange={setTo} />
          </div>
        </div>

        {/* Date */}
        <div className={fieldCls}>
          <label className={labelCls}><Calendar size={10} className="inline mr-1" />{t("trainSearch.dateOfJourney")}</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="w-full bg-transparent text-base text-ink focus:outline-none font-light" />
        </div>

        {/* Class */}
        <div ref={classRef} className="relative">
          <div className={`${fieldCls} min-w-[160px] cursor-pointer`} onClick={() => setShowClass(!showClass)}>
            <label className={labelCls}>{t("trainSearch.travelClass")}</label>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-sm text-ink font-light truncate min-w-0">{tClass} — {t(CLASS_LABEL_KEYS[tClass])}</span>
              <ChevronDown size={13} className={`text-ink-faint transition-transform shrink-0 ${showClass ? "rotate-180" : ""}`} />
            </div>
          </div>
          {showClass && (
            <div className="absolute top-full left-0 mt-2 w-64 max-w-[90vw] bg-panel-raised border border-line rounded-xl shadow-widget z-50 p-4 animate-slide-down">
              <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-3">{t("trainSearch.chooseClass")}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {TRAIN_CLASSES.map(c => (
                  <button key={c} type="button" onClick={() => { setTClass(c); setShowClass(false); }}
                    className={`px-2 py-2 rounded-sm text-xs border transition-colors text-left ${tClass === c ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/40"}`}>
                    <span className="block font-medium">{c}</span>
                    <span className="block text-[10px] font-light opacity-70">{t(CLASS_LABEL_KEYS[c])}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-ink-faint font-light">
          {from && to ? `${from.city} → ${to.city}` : t("flightSearch.selectOriginDestination")}
        </p>
        <button
          type="button"
          disabled={!from || !to}
          onClick={() => {
            if (!from || !to) return;
            const p = new URLSearchParams();
            p.set("from", from.code);
            p.set("to", to.code);
            if (date) p.set("date", date);
            p.set("class", tClass);
            router.push(`/trains?${p.toString()}`);
          }}
          className="flex items-center gap-2 px-8 py-3 bg-ink hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95 disabled:hover:scale-100"
        >
          <Search size={15} /> {t("trainSearch.searchTrains")}
        </button>
      </div>
    </div>
  );
}
