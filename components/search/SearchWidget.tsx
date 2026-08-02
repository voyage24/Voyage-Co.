"use client";

import { useState, useRef, useEffect } from "react";
import FlightSearch from "./FlightSearch";
import HotelSearch from "./HotelSearch";
import TrainSearch from "./TrainSearch";
import ExperienceSearch from "./ExperienceSearch";
import PackageSearch from "./PackageSearch";
import CruiseSearch from "./CruiseSearch";
import AirportCabSearch from "./AirportCabSearch";
import OutstationCabSearch from "./OutstationCabSearch";
import HourlyStaySearch from "./HourlyStaySearch";
import type { City } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

// Alphabetical by label, so the order stays sensible as more tabs get added.
const TABS = [
  { id: "airportCabs",     labelKey: "searchTabs.airportCabs" },
  { id: "packages",        labelKey: "searchTabs.packages" },
  { id: "cruises",         labelKey: "searchTabs.cruises" },
  { id: "experiences",     labelKey: "searchTabs.experiences" },
  { id: "flights",         labelKey: "searchTabs.flights" },
  { id: "hourlyStays",     labelKey: "searchTabs.hourlyStays" },
  { id: "hotels",          labelKey: "searchTabs.hotels" },
  { id: "outstationCabs",  labelKey: "searchTabs.outstationCabs" },
  { id: "trains",          labelKey: "searchTabs.trains" },
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

  // With 9 tabs the row now overflows on most screens, not just phones;
  // gently auto-scroll it back and forth so travellers see there's more than
  // just Flights. Pauses on touch/hover. The step() loop below only ever
  // moves the row when it actually overflows, so this is a no-op on any
  // screen wide enough to show every tab at once.
  const tabsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    if (typeof window === "undefined") return;
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
    <div>
      {/* Tab strip — plain underlined text links, separate from the form card
          below (rather than a boxed row fused to it), so the picker reads as
          a light-touch selector instead of part of one big control. A
          translucent pill backing keeps it legible over any photo/map. */}
      <div
        ref={tabsRef}
        className="flex items-center gap-5 overflow-x-auto scrollbar-none w-fit max-w-full bg-panel-raised/95 backdrop-blur-sm rounded-full px-5 py-2.5 shadow-card mb-3"
      >
        {TABS.map(tab => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`shrink-0 text-[11px] font-normal tracking-[0.08em] uppercase whitespace-nowrap pb-0.5 border-b-2 transition-colors duration-200 ${
                isActive ? "border-ink text-ink font-medium" : "border-transparent text-ink-faint hover:text-ink-muted"
              }`}
            >
              {t(tab.labelKey)}
            </button>
          );
        })}
      </div>

      {/* Search form — its own compact card */}
      <div className="bg-panel-raised rounded-sm shadow-widget border border-line p-4">
        {active === "flights"     && <FlightSearch defaultFrom={flightFrom} defaultTo={flightTo} onRouteChange={onFlightRouteChange} />}
        {active === "hotels"      && <HotelSearch cities={hotelCities} defaultCity={hotelCity} onCitySelect={onHotelCitySelect} />}
        {active === "cruises"     && <CruiseSearch />}
        {active === "trains"      && <TrainSearch />}
        {active === "experiences" && <ExperienceSearch />}
        {active === "packages"    && <PackageSearch />}
        {active === "airportCabs"    && <AirportCabSearch cities={hotelCities ?? []} />}
        {active === "outstationCabs" && <OutstationCabSearch cities={hotelCities ?? []} />}
        {active === "hourlyStays"    && <HourlyStaySearch cities={hotelCities ?? []} />}
      </div>
    </div>
  );
}
