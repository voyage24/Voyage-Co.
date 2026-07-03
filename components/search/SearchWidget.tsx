"use client";

import { useState, useRef, useEffect } from "react";
import { Plane, Hotel, Train, Sparkles, Package, Anchor } from "lucide-react";
import FlightSearch from "./FlightSearch";
import HotelSearch from "./HotelSearch";
import TrainSearch from "./TrainSearch";
import ExperienceSearch from "./ExperienceSearch";
import PackageSearch from "./PackageSearch";
import CruiseSearch from "./CruiseSearch";
import type { City } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

const TABS = [
  { id: "flights",     labelKey: "searchTabs.flights",     icon: Plane },
  { id: "hotels",      labelKey: "searchTabs.hotels",      icon: Hotel },
  { id: "cruises",     labelKey: "searchTabs.cruises",     icon: Anchor },
  { id: "trains",      labelKey: "searchTabs.trains",      icon: Train },
  { id: "experiences", labelKey: "searchTabs.experiences", icon: Sparkles },
  { id: "packages",    labelKey: "searchTabs.packages",    icon: Package },
] as const;

export type TabId = typeof TABS[number]["id"];

export default function SearchWidget({
  flightFrom, flightTo, onFlightRouteChange, activeTab, onActiveTabChange,
  hotelCity, onHotelCitySelect, hotelCities,
}: {
  flightFrom?: City | null;
  flightTo?: City | null;
  onFlightRouteChange?: (from: City | null, to: City | null) => void;
  activeTab?: TabId;
  onActiveTabChange?: (tab: TabId) => void;
  hotelCity?: string;
  onHotelCitySelect?: (city: string) => void;
  hotelCities?: string[];
} = {}) {
  const { t } = useLanguage();
  const [internalActive, setInternalActive] = useState<TabId>("flights");
  const active = activeTab ?? internalActive;
  const setActive = (tab: TabId) => {
    setInternalActive(tab);
    onActiveTabChange?.(tab);
  };

  // On phones the tab row overflows; gently auto-scroll it back and forth so
  // travellers see there's more than just Flights. Pauses on touch/hover.
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia("(max-width: 767px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Keep the position in a float accumulator and re-measure overflow every
    // frame: sub-pixel increments written straight to scrollLeft get rounded
    // away on many mobile browsers (so it never moved), and the row's overflow
    // isn't known until after fonts/layout settle.
    el.style.scrollBehavior = "auto";
    let dir = 1;
    let paused = false;
    let raf = 0;
    let pos = el.scrollLeft;
    let resumeT: ReturnType<typeof setTimeout>;
    const speed = 0.6;

    const step = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (!paused && max > 2) {
        pos += dir * speed;
        if (pos >= max) { pos = max; dir = -1; }
        else if (pos <= 0) { pos = 0; dir = 1; }
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    const syncPos = () => { if (paused) pos = el.scrollLeft; };
    const pause = () => { paused = true; clearTimeout(resumeT); };
    const resume = () => { clearTimeout(resumeT); resumeT = setTimeout(() => { pos = el.scrollLeft; paused = false; }, 2500); };
    el.addEventListener("scroll", syncPos, { passive: true });
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });
    el.addEventListener("pointerdown", pause);
    el.addEventListener("pointerup", resume);
    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resumeT);
      el.removeEventListener("scroll", syncPos);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("pointerup", resume);
      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    // Warm atelier card on the cream canvas.
    <div className="bg-panel-raised rounded-sm shadow-widget overflow-visible border border-line">
      {/* Tab bar */}
      <div className="rounded-t-sm overflow-hidden border-b border-line">
        <div ref={tabsRef} className="flex overflow-x-auto scrollbar-none">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-[11px] font-normal tracking-[0.16em] uppercase whitespace-nowrap transition-all duration-200 border-b -mb-px hover:scale-105 active:scale-95 ${
                  isActive
                    ? "border-ink text-ink bg-panel-soft font-medium"
                    : "border-transparent text-ink-faint hover:text-ink-muted hover:bg-panel-soft/50"
                }`}
              >
                <Icon size={15} />
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search form */}
      <div className="p-5">
        {active === "flights"     && <FlightSearch defaultFrom={flightFrom} defaultTo={flightTo} onRouteChange={onFlightRouteChange} />}
        {active === "hotels"      && <HotelSearch cities={hotelCities} defaultCity={hotelCity} onCitySelect={onHotelCitySelect} />}
        {active === "cruises"     && <CruiseSearch />}
        {active === "trains"      && <TrainSearch />}
        {active === "experiences" && <ExperienceSearch />}
        {active === "packages"    && <PackageSearch />}
      </div>
    </div>
  );
}
