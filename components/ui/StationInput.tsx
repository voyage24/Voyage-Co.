"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Train, Search, MapPin } from "lucide-react";
import { STATIONS } from "@/lib/mock-data";
import type { Station } from "@/lib/types";
import { useIsMobile } from "@/lib/useIsMobile";
import MobilePickerSheet from "@/components/ui/MobilePickerSheet";

interface StationInputProps {
  label: string;
  value: Station | null;
  onChange: (station: Station) => void;
  placeholder?: string;
}

// Popular city order for default (no-query) view
const POPULAR_CITIES = [
  "New Delhi", "Mumbai", "Kolkata", "Chennai", "Bengaluru",
  "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Kochi", "Patna", "Bhopal", "Nagpur", "Visakhapatnam",
];

function groupByCity(stations: Station[]): { city: string; stations: Station[] }[] {
  const map: Record<string, Station[]> = {};
  stations.forEach(s => {
    if (!map[s.city]) map[s.city] = [];
    map[s.city].push(s);
  });
  return Object.entries(map).map(([city, stns]) => ({ city, stations: stns }));
}

export default function StationInput({ label, value, onChange, placeholder = "City or station" }: StationInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filtered + grouped stations
  const groups = useMemo(() => {
    if (query.length === 0) {
      // Default: popular cities first, up to 3 stations each
      const popularGroups = POPULAR_CITIES.flatMap(city => {
        const stns = STATIONS.filter(s => s.city === city).slice(0, 3);
        return stns.length ? [{ city, stations: stns }] : [];
      });
      return popularGroups.slice(0, 6);
    }

    const q = query.toLowerCase();
    const matched = STATIONS.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q) ||
      s.state.toLowerCase().includes(q)
    );
    return groupByCity(matched);
  }, [query]);

  useEffect(() => {
    if (isMobile) return; // mobile sheet manages its own dismissal
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMobile]);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    if (!isMobile) setTimeout(() => inputRef.current?.focus(), 50);
  };
  const close = () => { setOpen(false); setQuery(""); };

  const handleSelect = (station: Station) => {
    onChange(station);
    setOpen(false);
    setQuery("");
  };

  const totalResults = groups.reduce((n, g) => n + g.stations.length, 0);

  const stationList = totalResults === 0 ? (
    <p className="px-4 py-4 text-sm text-gray-600 text-center">No stations found</p>
  ) : groups.map(({ city, stations }) => (
    <div key={city}>
      <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 border-y border-gray-100">
        <MapPin size={11} className="text-brand-blue shrink-0" />
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">{city}</span>
      </div>
      {stations.map(station => (
        <button
          key={station.code}
          type="button"
          onClick={() => handleSelect(station)}
          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="w-10 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-gray-600">{station.code}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{station.name}</p>
            <p className="text-[11px] text-gray-600 truncate">{station.fullName}</p>
          </div>
        </button>
      ))}
    </div>
  ));

  const stationFooter = query.length === 0 ? (
    <div className="px-4 py-2.5 border-t border-gray-100">
      <p className="text-[11px] text-gray-600">Showing popular stations · Type to search all</p>
    </div>
  ) : null;

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={handleOpen} className="flex items-center gap-2 w-full text-left">
        <Train size={16} className="text-brand-blue shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wide">{label}</p>
          {value ? (
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">{value.name}</p>
              <p className="text-[11px] text-gray-600 truncate">{value.code} · {value.city}, {value.state}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{placeholder}</p>
          )}
        </div>
      </button>

      {open && (isMobile ? (
        <MobilePickerSheet title="Select station" query={query} onQueryChange={setQuery} onClose={close} searchPlaceholder="Search station or city…">
          <div className="py-1">{stationList}</div>
          {stationFooter}
        </MobilePickerSheet>
      ) : (
        <div className="absolute top-full left-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-widget border border-gray-100 z-50 animate-slide-down">
          {/* Search bar */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-600 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search station or city…"
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-600"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto py-1">{stationList}</div>
          {stationFooter}
        </div>
      ))}
    </div>
  );
}
