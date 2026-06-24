"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import TrainCard from "@/components/cards/TrainCard";
import { TRAINS, STATIONS } from "@/lib/mock-data";
import { useLanguage } from "@/components/providers/LanguageProvider";

const CLASS_OPTIONS = [
  { code: "1A", labelKey: "trainsPage.class.1A" },
  { code: "EC", labelKey: "trainsPage.class.EC" },
  { code: "2A", labelKey: "trainsPage.class.2A" },
  { code: "3A", labelKey: "trainsPage.class.3A" },
  { code: "CC", labelKey: "trainsPage.class.CC" },
  { code: "SL", labelKey: "trainsPage.class.SL" },
  { code: "FC", labelKey: "trainsPage.class.FC" },
];

// `label` stays a stable English value used as the filter state key; the
// display text is translated separately via `tKey` so changing language
// never breaks the active-filter comparisons in `times`.
const TIME_BUCKETS = [
  { label: "Early (00–06)", tKey: "trainsPage.time.early", test: (h: number) => h >= 0 && h < 6 },
  { label: "Morning (06–12)", tKey: "trainsPage.time.morning", test: (h: number) => h >= 6 && h < 12 },
  { label: "Afternoon (12–18)", tKey: "trainsPage.time.afternoon", test: (h: number) => h >= 12 && h < 18 },
  { label: "Night (18–00)", tKey: "trainsPage.time.night", test: (h: number) => h >= 18 },
];

function TrainsContent() {
  const { t } = useLanguage();
  const params = useSearchParams();
  const fromCode = params.get("from");
  const toCode = params.get("to");

  const [classes, setClasses] = useState<string[]>([]);
  const [times, setTimes] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) =>
    setList(list.includes(value) ? list.filter(v => v !== value) : [...list, value]);

  const fromStation = fromCode ? STATIONS.find(s => s.code === fromCode) : null;
  const toStation = toCode ? STATIONS.find(s => s.code === toCode) : null;

  const filtered = useMemo(() => TRAINS
    .filter(train => !fromCode || train.origin === fromCode)
    .filter(train => !toCode || train.destination === toCode)
    .filter(train => classes.length === 0 || train.classes.some(c => classes.includes(c.type)))
    .filter(train => {
      if (times.length === 0) return true;
      const hour = Number(train.departure.split(":")[0]);
      return TIME_BUCKETS.some(b => times.includes(b.label) && b.test(hour));
    }),
    [fromCode, toCode, classes, times]
  );

  const hasActiveFilters = classes.length > 0 || times.length > 0;
  const resetFilters = () => { setClasses([]); setTimes([]); };

  const FilterPanel = () => (
    <div className="bg-panel rounded-2xl border border-line shadow-card p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-light text-ink">{t("listing.refine")}</h3>
        {hasActiveFilters && (
          <button onClick={resetFilters} className="text-[11px] tracking-[0.1em] uppercase text-gold hover:underline">
            {t("listing.reset")}
          </button>
        )}
      </div>
      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-3">{t("trainsPage.classes")}</p>
        <div className="space-y-2.5">
          {CLASS_OPTIONS.map(c => (
            <label key={c.code} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={classes.includes(c.code)}
                onChange={() => toggle(classes, setClasses, c.code)}
                className="accent-gold w-4 h-4"
              />
              <span className="text-sm text-ink-muted font-light">{t(c.labelKey)}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] tracking-[0.14em] uppercase text-ink-faint mb-3">{t("trainsPage.departureTime")}</p>
        <div className="space-y-2.5">
          {TIME_BUCKETS.map(bucket => (
            <label key={bucket.label} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={times.includes(bucket.label)}
                onChange={() => toggle(times, setTimes, bucket.label)}
                className="accent-gold w-4 h-4"
              />
              <span className="text-sm text-ink-muted font-light">{t(bucket.tKey)}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">{t("searchTabs.trains")}</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">
            {fromStation && toStation ? (
              <>{fromStation.city} <span className="text-gold">→</span> {toStation.city}</>
            ) : (
              t("trainsPage.allRailJourneys")
            )}
          </h1>
          <p className="text-sm text-ink-muted mt-1 font-light">
            {filtered.length} {filtered.length !== 1 ? t("trainsPage.services") : t("trainsPage.service")} {fromStation || toStation ? t("trainsPage.matchingRoute") : t("trainsPage.acrossIndia")}
          </p>
        </div>
        <button
          onClick={() => setShowFilters(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2 border border-line rounded-sm text-xs font-medium tracking-wide uppercase text-ink-muted shrink-0"
        >
          <SlidersHorizontal size={15} /> {t("listing.refine")}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Filter sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterPanel />
        </aside>

        <div className="flex-1 min-w-0">
          <div className="space-y-4">
            {filtered.length > 0 ? (
              filtered.map(train => <TrainCard key={train.id} train={train} />)
            ) : (
              <div className="text-center py-20">
                <p className="font-serif text-2xl font-light text-ink mb-2">{t("trainsPage.noMatch")}</p>
                <button onClick={resetFilters} className="mt-3 text-xs tracking-[0.12em] uppercase text-gold hover:underline">
                  {t("listing.clearFilters")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-vc-950/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-page overflow-y-auto p-5">
            <div className="flex items-center justify-end mb-4">
              <button onClick={() => setShowFilters(false)} className="text-ink-muted"><X size={20} /></button>
            </div>
            <FilterPanel />
            <button onClick={() => setShowFilters(false)} className="w-full mt-6 py-3 bg-ink text-page text-xs font-medium tracking-[0.14em] uppercase rounded-sm">
              {t("listing.showResultsPrefix")} {filtered.length} {t("listing.showResultsSuffix")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainsPage() {
  return (
    <Suspense>
      <TrainsContent />
    </Suspense>
  );
}
