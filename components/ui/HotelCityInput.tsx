"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Search, Building2, Hotel } from "lucide-react";
import { HOTELS } from "@/lib/mock-data";

interface HotelCityInputProps {
  value: string;
  onChange: (value: string) => void;
}

// City → country mapping for display
const CITY_COUNTRY: Record<string, string> = {
  Mumbai: "India", "New Delhi": "India", Goa: "India", Jaipur: "India",
  Kochi: "India", Bengaluru: "India", Agra: "India", Udaipur: "India",
  Hyderabad: "India", Dubai: "UAE", Singapore: "Singapore",
  Bangkok: "Thailand", Phuket: "Thailand", Bali: "Indonesia",
  Maldives: "Maldives", London: "UK", Paris: "France", Rome: "Italy",
  "New York": "USA", Tokyo: "Japan", Sydney: "Australia",
  Barcelona: "Spain", Nairobi: "Kenya", Mozambique: "Mozambique",
  Paro: "Bhutan", Thimphu: "Bhutan", Punakha: "Bhutan", Gangtey: "Bhutan",
};

const POPULAR_CITIES = [
  "Goa", "Mumbai", "Jaipur", "New Delhi", "Udaipur",
  "Kochi", "Bengaluru", "Dubai", "Bali", "Singapore", "Paro",
];

export default function HotelCityInput({ value, onChange }: HotelCityInputProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Unique cities with hotel counts
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    HOTELS.forEach(h => { map[h.city] = (map[h.city] || 0) + 1; });
    return map;
  }, []);

  const { matchedCities, matchedHotels } = useMemo(() => {
    if (!query) {
      const cities = POPULAR_CITIES.filter(c => cityData[c]).map(c => ({
        city: c, count: cityData[c], country: CITY_COUNTRY[c] || "",
      }));
      return { matchedCities: cities, matchedHotels: [] };
    }
    const q = query.toLowerCase();
    const cities = Object.entries(cityData)
      .filter(([city]) => city.toLowerCase().includes(q))
      .map(([city, count]) => ({ city, count, country: CITY_COUNTRY[city] || "" }))
      .slice(0, 6);
    const hotels = HOTELS
      .filter(h =>
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q)
      )
      .slice(0, 5);
    return { matchedCities: cities, matchedHotels: hotels };
  }, [query, cityData]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    setOpen(true);
    setQuery("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const selectCity = (city: string) => {
    onChange(city);
    setOpen(false);
    setQuery("");
  };

  const selectHotel = (name: string) => {
    onChange(name);
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={ref} className="relative flex-1">
      <button type="button" onClick={handleOpen} className="w-full text-left">
        <label className="text-[11px] text-gray-600 font-medium uppercase tracking-wide block pointer-events-none">
          City, Area or Property
        </label>
        <div className="flex items-center gap-2 mt-1">
          <MapPin size={16} className="text-brand-blue shrink-0" />
          <span className={`text-sm font-semibold ${value ? "text-gray-800" : "text-gray-600 font-normal"}`}>
            {value || "Where are you going?"}
          </span>
        </div>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-80 max-w-[90vw] bg-white rounded-2xl shadow-widget border border-gray-100 z-50 animate-slide-down">
          {/* Search bar */}
          <div className="p-3 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
              <Search size={14} className="text-gray-600 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search city or hotel…"
                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder:text-gray-600"
              />
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto py-1">
            {/* Cities */}
            {matchedCities.length > 0 && (
              <div>
                <p className="px-4 py-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-50 border-y border-gray-100 flex items-center gap-1.5">
                  <Building2 size={10} /> {query ? "Matching cities" : "Popular destinations"}
                </p>
                {matchedCities.map(({ city, count, country }) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => selectCity(city)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <MapPin size={15} className="text-brand-blue" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{city}</p>
                      <p className="text-xs text-gray-600">{country} · {count} hotel{count > 1 ? "s" : ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Individual hotels */}
            {matchedHotels.length > 0 && (
              <div>
                <p className="px-4 py-1.5 text-[10px] font-bold text-gray-600 uppercase tracking-widest bg-gray-50 border-y border-gray-100 flex items-center gap-1.5">
                  <Hotel size={10} /> Hotels
                </p>
                {matchedHotels.map(h => (
                  <button
                    key={h.id}
                    type="button"
                    onClick={() => selectHotel(h.name)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-yellow-50 flex items-center justify-center shrink-0">
                      <Hotel size={15} className="text-brand-yellow-dark" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{h.name}</p>
                      <p className="text-xs text-gray-600 truncate">{h.location} · {"⭐".repeat(h.stars)}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {matchedCities.length === 0 && matchedHotels.length === 0 && (
              <p className="px-4 py-4 text-sm text-gray-600 text-center">No results found</p>
            )}
          </div>

          {!query && (
            <div className="px-4 py-2.5 border-t border-gray-100">
              <p className="text-[11px] text-gray-600">Showing popular destinations · Type to search all</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
