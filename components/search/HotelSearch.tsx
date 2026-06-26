"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, Users, Search, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/providers/LanguageProvider";

function CityAutocomplete({
  cities, value, onChange, onSelect,
}: {
  cities: string[];
  value: string;
  onChange: (v: string) => void;
  onSelect: (city: string) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const matches = value.length > 0
    ? cities.filter(c => c.toLowerCase().includes(value.toLowerCase()))
    : cities;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-1">
      <p className="text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1">{t("hotelSearch.destination")}</p>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={t("hotelSearch.cityOrHotel")}
        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none font-light"
      />
      {open && matches.length > 0 && (
        <div className="absolute top-full left-0 mt-2 w-64 max-w-[90vw] max-h-72 overflow-y-auto bg-panel-raised border border-line rounded-xl shadow-widget z-50">
          {matches.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => { onChange(c); onSelect(c); setOpen(false); }}
              className="w-full px-4 py-2.5 text-left hover:bg-panel-soft transition-colors border-b border-line last:border-0 text-sm text-ink font-light"
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HotelSearch({
  cities, defaultCity, onCitySelect,
}: {
  cities?: string[];
  defaultCity?: string;
  onCitySelect?: (city: string) => void;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [city, setCity] = useState(defaultCity ?? "");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [showGuests, setShowGuests] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) setShowGuests(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fieldCls = "flex-1 bg-panel border border-line rounded-xl px-4 py-3";
  const labelCls = "text-[10px] tracking-[0.16em] uppercase text-ink-faint mb-1 block truncate";

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Destination */}
        <div className={fieldCls}>
          <CityAutocomplete
            cities={cities ?? []}
            value={city}
            onChange={setCity}
            onSelect={c => onCitySelect?.(c)}
          />
        </div>

        {/* Check-in */}
        <div className={fieldCls}>
          <label className={labelCls}><Calendar size={10} className="inline mr-1" />{t("hotelSearch.checkIn")}</label>
          <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light" />
        </div>

        {/* Check-out */}
        <div className={fieldCls}>
          <label className={labelCls}><Calendar size={10} className="inline mr-1" />{t("hotelSearch.checkOut")}</label>
          <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
            className="w-full bg-transparent text-sm text-ink focus:outline-none font-light" />
        </div>

        {/* Rooms & Guests */}
        <div ref={guestRef} className="relative">
          <div
            className={`${fieldCls} min-w-[160px] cursor-pointer flex-none`}
            onClick={() => setShowGuests(!showGuests)}
          >
            <label className={labelCls}><Users size={10} className="inline mr-1" />{t("hotelSearch.roomsGuests")}</label>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-sm text-ink font-light truncate min-w-0">{rooms} {rooms > 1 ? t("hotelSearch.rooms") : t("hotelSearch.room")} · {guests} {guests > 1 ? t("hotelSearch.guests") : t("hotelSearch.guest")}</span>
              <ChevronDown size={13} className={`text-ink-faint transition-transform shrink-0 ${showGuests ? "rotate-180" : ""}`} />
            </div>
          </div>
          {showGuests && (
            <div className="absolute top-full left-0 mt-2 w-64 max-w-[90vw] bg-panel-raised border border-line rounded-xl shadow-widget z-50 p-5 animate-slide-down space-y-4">
              {[
                { key: "rooms", labelKey: "hotelSearch.rooms", value: rooms, set: setRooms, min: 1, max: 8 },
                { key: "guests", labelKey: "hotelSearch.guests", value: guests, set: setGuests, min: 1, max: 16 },
              ].map(({ key, labelKey, value, set, min, max }) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-sm text-ink font-light">{t(labelKey)}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => set(Math.max(min, value - 1))} className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-ink-muted hover:border-ink transition-colors">−</button>
                    <span className="w-4 text-center text-sm font-medium text-ink">{value}</span>
                    <button onClick={() => set(Math.min(max, value + 1))} className="w-7 h-7 rounded-full border border-line flex items-center justify-center text-ink-muted hover:border-ink transition-colors">+</button>
                  </div>
                </div>
              ))}
              <button onClick={() => setShowGuests(false)} className="w-full py-2.5 bg-ink text-page text-xs font-medium tracking-[0.12em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
                {t("hotelSearch.apply")}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => router.push(`/hotels${city ? `?city=${encodeURIComponent(city)}` : ""}`)}
          className="flex items-center gap-2 px-8 py-3 bg-ink hover:bg-ink/90 text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95"
        >
          <Search size={15} /> {t("hotelSearch.searchHotels")}
        </button>
      </div>
    </div>
  );
}
