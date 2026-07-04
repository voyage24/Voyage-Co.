"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin, Search } from "lucide-react";
import { CITIES } from "@/lib/mock-data";
import type { City } from "@/lib/types";
import { useIsMobile } from "@/lib/useIsMobile";
import MobilePickerSheet from "@/components/ui/MobilePickerSheet";

interface CityInputProps {
  label: string;
  value: City | null;
  onChange: (city: City) => void;
  placeholder?: string;
  icon?: React.ReactNode;
}

export default function CityInput({ label, value, onChange, placeholder = "City or airport", icon }: CityInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const isMobile = useIsMobile();
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.length > 0
    ? CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.code.toLowerCase().includes(query.toLowerCase()) ||
        c.fullName.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : CITIES.slice(0, 8);

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
    // Desktop only: auto-focus the search box. On mobile it stays opt-in so the
    // keyboard never pops up until the traveller taps to type.
    if (!isMobile) setTimeout(() => inputRef.current?.focus(), 50);
  };
  const close = () => { setOpen(false); setQuery(""); };

  const handleSelect = (city: City) => {
    onChange(city);
    setOpen(false);
    setQuery("");
  };

  const cityItems = filtered.map(city => (
    <li key={city.code}>
      <button
        type="button"
        onClick={() => handleSelect(city)}
        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <span className="text-xs font-bold text-gray-600">{city.code}</span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">{city.name}</p>
          <p className="text-xs text-gray-600 truncate">{city.fullName}</p>
        </div>
      </button>
    </li>
  ));

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={handleOpen} className="flex items-center gap-2 w-full text-left">
        {icon || <MapPin size={16} className="text-brand-blue shrink-0" />}
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wide">{label}</p>
          {value ? (
            <div>
              <p className="text-sm font-bold text-gray-800 leading-tight">{value.name}</p>
              <p className="text-[11px] text-gray-600 truncate">{value.code} · {value.country}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{placeholder}</p>
          )}
        </div>
      </button>

      {open && (isMobile ? (
        <MobilePickerSheet title="Select city" query={query} onQueryChange={setQuery} onClose={close} searchPlaceholder="Search city or airport…">
          <ul className="py-1">{cityItems}</ul>
        </MobilePickerSheet>
      ) : (
        <div className="absolute top-full left-0 mt-2 w-72 max-w-[90vw] bg-white rounded-2xl shadow-widget border border-gray-100 z-50 animate-slide-down overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-600" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search city or airport…"
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-600"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto py-1">{cityItems}</ul>
        </div>
      ))}
    </div>
  );
}
