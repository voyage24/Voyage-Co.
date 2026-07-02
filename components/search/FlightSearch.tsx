"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ArrowLeftRight, Search, Calendar, ChevronDown, ChevronLeft, ChevronRight, Plane, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CITIES } from "@/lib/mock-data";
import { AIRLINES } from "@/lib/airlines";
import type { City } from "@/lib/types";
import { useLanguage } from "@/components/providers/LanguageProvider";

// Stable English values — used as the API query param / state value, so
// only their displayed labels (via CABIN_LABEL_KEYS) are translated.
const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First"];
const CABIN_LABEL_KEYS: Record<string, string> = {
  "Economy": "flightSearch.cabin.economy",
  "Premium Economy": "flightSearch.cabin.premiumEconomy",
  "Business": "flightSearch.cabin.business",
  "First": "flightSearch.cabin.first",
};
const POPULAR = ["DEL", "BOM", "BLR", "GOI", "DXB", "LHR", "SIN", "BKK", "JFK", "CDG", "NRT", "SYD", "DPS"];
// Reuses the date picker's translated month/weekday strings (Mon-first order).
const MONTH_KEYS = [
  "datePicker.month.0", "datePicker.month.1", "datePicker.month.2", "datePicker.month.3",
  "datePicker.month.4", "datePicker.month.5", "datePicker.month.6", "datePicker.month.7",
  "datePicker.month.8", "datePicker.month.9", "datePicker.month.10", "datePicker.month.11",
];
const WEEKDAY_KEYS = ["datePicker.day.1", "datePicker.day.2", "datePicker.day.3", "datePicker.day.4", "datePicker.day.5", "datePicker.day.6", "datePicker.day.0"];

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date | null, b: Date | null) => !!a && !!b && a.getTime() === b.getTime();
const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function buildMonthCells(y: number, m: number): (Date | null)[] {
  const first = new Date(y, m, 1);
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday-first offset
  const out: (Date | null)[] = Array(lead).fill(null);
  for (let day = 1; day <= daysInMonth; day++) out.push(new Date(y, m, day));
  while (out.length % 7 !== 0) out.push(null);
  return out;
}

// `label` stays a stable English value used by quickPick()'s "This Weekend"
// special-case comparison; `tKey` drives the translated display text.
const QUICK_PICKS = [
  { label: "Today",       tKey: "flightSearch.quickToday",      offset: 0 },
  { label: "Tomorrow",    tKey: "flightSearch.quickTomorrow",   offset: 1 },
  { label: "This Weekend",tKey: "flightSearch.quickWeekend",    offset: -1 }, // computed specially
  { label: "Next Week",   tKey: "flightSearch.quickNextWeek",   offset: 7 },
  { label: "Next Month",  tKey: "flightSearch.quickNextMonth",  offset: 30 },
];

/* ─── Airport Portal Dropdown ────────────────────────────────────────── */
function AirportDropdown({
  style, query, exclude, onSelect, dropRef,
}: {
  style: React.CSSProperties;
  query: string;
  exclude?: string;
  onSelect: (c: City) => void;
  dropRef: React.RefObject<HTMLDivElement>;
}) {
  const { t } = useLanguage();
  const { matches, isFallback } = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { matches: CITIES.filter(c => POPULAR.includes(c.code) && c.code !== exclude), isFallback: false };
    }

    // Multi-word queries ("new york", "united arab emirates") — every token
    // must match somewhere so partial / multi-word searches still resolve.
    const tokens = q.split(/\s+/).filter(Boolean);

    const scored = CITIES
      .filter(c => c.code !== exclude)
      .map(c => {
        const code = c.code.toLowerCase();
        const name = c.name.toLowerCase();
        const country = c.country.toLowerCase();
        const fullName = c.fullName.toLowerCase();

        let total = 0;
        for (const token of tokens) {
          let best = 0;
          if (code === token)              best = 100;
          else if (code.startsWith(token)) best = 80;
          else if (name.startsWith(token)) best = 60;
          else if (name.includes(token))   best = 45;
          else if (country.startsWith(token)) best = 38;
          else if (country.includes(token))   best = 32;
          else if (fullName.includes(token))  best = 15;
          if (best === 0) return { city: c, score: 0 }; // every token must match
          total += best;
        }
        return { city: c, score: total };
      })
      .filter(x => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 12)
      .map(x => x.city);

    if (scored.length > 0) return { matches: scored, isFallback: false };

    // Nothing matched — nudge the customer toward popular airports rather
    // than leaving them stuck on a dead end.
    return { matches: CITIES.filter(c => POPULAR.includes(c.code) && c.code !== exclude), isFallback: true };
  }, [query, exclude]);

  return createPortal(
    <div
      ref={dropRef}
      style={{ ...style, position: "fixed", zIndex: 9999 }}
      className="bg-panel-raised border border-line rounded-xl shadow-luxury overflow-hidden max-w-[90vw]"
    >
      <div className="px-4 py-2 border-b border-line">
        <p className="text-[10px] tracking-[0.16em] uppercase text-ink-faint font-medium">
          {query.length === 0
            ? t("flightSearch.popularAirports")
            : isFallback
              ? t("flightSearch.noExactMatch")
              : t("flightSearch.matchingAirports")}
        </p>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {matches.map((c, i) => (
          <button
            key={c.code}
            type="button"
            onMouseDown={e => e.preventDefault()}
            onClick={() => onSelect(c)}
            className={`w-full px-4 py-2.5 text-left hover:bg-panel-soft transition-colors flex items-center gap-2.5 ${
              i < matches.length - 1 ? "border-b border-line" : ""
            }`}
          >
            <div className="shrink-0 w-10 h-10 rounded-lg bg-panel-soft border border-line flex items-center justify-center">
              <span className="text-[11px] font-bold text-gold tracking-widest">{c.code}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink leading-tight truncate">{c.name}</p>
              <p className="text-[11px] text-ink-faint font-light truncate">{c.fullName} · {c.country}</p>
            </div>
          </button>
        ))}
      </div>
    </div>,
    document.body
  );
}

/* ─── Airport Input ──────────────────────────────────────────────────── */
function AirportInput({
  label, value, onChange, exclude,
}: {
  label: string;
  value: City | null;
  onChange: (c: City) => void;
  exclude?: string;
}) {
  const { t } = useLanguage();
  const [query, setQuery]     = useState("");
  const [open, setOpen]       = useState(false);
  const [focused, setFocused] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef  = useRef<HTMLDivElement>(null);
  const dropRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const calcDropPos = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    setDropStyle({ top: r.bottom + 8, left: r.left, width: Math.max(320, r.width) });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideWrap = wrapRef.current?.contains(target);
      const insideDrop = dropRef.current?.contains(target);
      if (!insideWrap && !insideDrop) {
        setOpen(false);
        setFocused(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Keeps the dropdown anchored to the input as the page scrolls — it's
  // portaled with position:fixed (viewport coordinates), so without this
  // it would stay frozen in place while the rest of the page scrolls past it.
  useEffect(() => {
    if (!open) return;
    const reposition = () => calcDropPos();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [open]);

  const handleFocus = () => { calcDropPos(); setFocused(true); setQuery(""); setOpen(true); };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setQuery(e.target.value); calcDropPos(); setOpen(true); };
  const handleSelect = (city: City) => { onChange(city); setQuery(""); setOpen(false); setFocused(false); };

  const displayText = focused ? query : (value ? `${value.name} · ${value.code}` : "");

  return (
    <div ref={wrapRef} className="min-w-0 w-full">
      <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-1 font-medium select-none truncate">{label}</p>
      <div className="flex items-center gap-1">
        <input
          ref={inputRef}
          type="text"
          value={displayText}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={focused ? t("flightSearch.typeCityOrCode") : t("flightSearch.cityOrAirport")}
          autoComplete="off"
          className="w-full bg-transparent text-base text-ink placeholder:text-ink-faint focus:outline-none font-light leading-tight cursor-text"
        />
        {value && focused && (
          <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="shrink-0 text-ink-faint hover:text-ink">
            <X size={13} />
          </button>
        )}
      </div>
      {value && !focused && <p className="text-[11px] text-ink-faint font-light truncate mt-0.5">{value.fullName}</p>}

      {open && mounted && (
        <AirportDropdown style={dropStyle} query={query} exclude={exclude} onSelect={handleSelect} dropRef={dropRef} />
      )}
    </div>
  );
}

/* ─── Date Range Calendar (portal) ───────────────────────────────────── */
function DateRangeCalendar({
  style, tripType, departure, returnDate, onPickDeparture, onPickReturn, onClose, dropRef,
}: {
  style: React.CSSProperties;
  tripType: "one-way" | "round-trip";
  departure: Date | null;
  returnDate: Date | null;
  onPickDeparture: (d: Date | null) => void;
  onPickReturn: (d: Date | null) => void;
  onClose: () => void;
  dropRef: React.RefObject<HTMLDivElement>;
}) {
  const { t } = useLanguage();
  const today = useMemo(() => startOfDay(new Date()), []);
  const [view, setView] = useState(() => {
    const base = departure ?? today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });
  const [hover, setHover] = useState<Date | null>(null);

  const nextView = view.m === 11 ? { y: view.y + 1, m: 0 } : { y: view.y, m: view.m + 1 };
  const cellsA = useMemo(() => buildMonthCells(view.y, view.m), [view]);
  const cellsB = useMemo(() => buildMonthCells(nextView.y, nextView.m), [nextView.y, nextView.m]);

  const move = (dir: number) => setView(v => {
    const d = new Date(v.y, v.m + dir, 1);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const inRange = (d: Date) => {
    if (!departure) return false;
    const end = returnDate ?? hover;
    if (!end) return false;
    const lo = departure < end ? departure : end;
    const hi = departure < end ? end : departure;
    return d > lo && d < hi;
  };

  const handleDayClick = (date: Date) => {
    if (date < today) return;
    if (tripType === "one-way") {
      onPickDeparture(date);
      onClose();
      return;
    }
    if (!departure || (departure && returnDate)) {
      onPickDeparture(date);
      onPickReturn(null);
    } else if (date <= departure) {
      onPickDeparture(date);
    } else {
      onPickReturn(date);
    }
  };

  const quickPick = (offset: number, label: string) => {
    let d: Date;
    if (label === "This Weekend") {
      d = new Date(today);
      const day = d.getDay();
      const toSat = (6 - day + 7) % 7 || 7;
      d.setDate(d.getDate() + toSat);
    } else {
      d = new Date(today);
      d.setDate(d.getDate() + offset);
    }
    onPickDeparture(d);
    onPickReturn(null);
    setView({ y: d.getFullYear(), m: d.getMonth() });
  };

  const renderMonth = (y: number, m: number, cells: (Date | null)[], side: "left" | "right") => (
    <div className="flex-1 min-w-[260px]">
      <div className="flex items-center justify-between mb-4">
        {side === "left" ? (
          <button type="button" onClick={() => move(-1)} className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-muted hover:border-ink hover:text-ink transition-colors">
            <ChevronLeft size={14} />
          </button>
        ) : <span className="w-8 h-8" />}
        <h3 className="font-serif font-light text-ink text-lg tracking-wide">{t(MONTH_KEYS[m])} {y}</h3>
        {side === "right" ? (
          <button type="button" onClick={() => move(1)} className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-muted hover:border-ink hover:text-ink transition-colors">
            <ChevronRight size={14} />
          </button>
        ) : <span className="w-8 h-8" />}
      </div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_KEYS.map(w => (
          <div key={w} className="text-center text-[10px] tracking-wide uppercase text-ink-faint py-1">{t(w)}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((date, i) => {
          if (!date) return <div key={`x${i}`} />;
          const past         = date < today;
          const isDeparture   = sameDay(date, departure);
          const isReturn      = sameDay(date, returnDate);
          const isRangeMember = inRange(date);
          const isToday       = sameDay(date, today);

          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={past}
              onMouseEnter={() => setHover(date)}
              onClick={() => handleDayClick(date)}
              className={`relative h-10 w-full flex items-center justify-center text-sm font-light transition-colors
                ${past ? "text-ink-faint/30 cursor-not-allowed" : "cursor-pointer text-ink"}
                ${isRangeMember && !past ? "bg-gold-soft/20" : ""}
                ${(isDeparture || isReturn) ? "bg-ink text-page rounded-full font-medium" : !past ? "hover:bg-panel-soft rounded-full" : ""}
              `}
            >
              {date.getDate()}
              {isToday && !isDeparture && !isReturn && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-gold" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  const maxH = (style as { maxHeight?: number }).maxHeight;

  return createPortal(
    <div
      ref={dropRef}
      style={{ ...style, position: "fixed", zIndex: 9999, maxHeight: maxH, display: "flex", flexDirection: "column" }}
      className="bg-panel-raised border border-line shadow-luxury w-[640px] max-w-[94vw] overflow-hidden"
      onMouseLeave={() => setHover(null)}
    >
      {/* Scrollable body — quick picks + months. Capped height with internal
          scroll so the calendar is always fully reachable regardless of
          where the field sits on the page. */}
      <div className="overflow-y-auto p-6 flex-1 min-h-0">
        <div className="flex flex-wrap gap-2 mb-5 pb-5 border-b border-line">
          {QUICK_PICKS.map(q => (
            <button
              key={q.label}
              type="button"
              onClick={() => quickPick(q.offset, q.label)}
              className="px-3 py-1.5 text-[11px] tracking-wide border border-line text-ink-muted hover:border-ink hover:text-ink transition-colors"
            >
              {t(q.tKey)}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-8">
          {renderMonth(view.y, view.m, cellsA, "left")}
          {renderMonth(nextView.y, nextView.m, cellsB, "right")}
        </div>
      </div>

      {/* Footer — outside the scroll area, always visible */}
      <div className="flex items-center justify-between px-6 py-5 border-t border-line shrink-0">
        <p className="text-sm text-ink-muted font-light">
          {departure
            ? tripType === "round-trip"
              ? returnDate ? `${fmtShort(departure)} — ${fmtShort(returnDate)}` : `${fmtShort(departure)} → choose return`
              : fmtShort(departure)
            : t("flightSearch.selectDepartureDate")}
        </p>
        <div className="flex items-center gap-3">
          {departure && (
            <button
              type="button"
              onClick={() => { onPickDeparture(null); onPickReturn(null); }}
              className="text-[11px] tracking-wide uppercase text-ink-faint hover:text-ink transition-colors"
            >
              {t("datePicker.clear")}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-ink text-page text-xs font-medium tracking-[0.12em] uppercase rounded-sm hover:bg-ink/90 transition-colors"
          >
            {t("datePicker.done")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function DateRangeField({
  tripType, departure, returnDate, onPickDeparture, onPickReturn,
}: {
  tripType: "one-way" | "round-trip";
  departure: Date | null;
  returnDate: Date | null;
  onPickDeparture: (d: Date | null) => void;
  onPickReturn: (d: Date | null) => void;
}) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});
  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Computes a position that always fits fully inside the viewport — flips
  // the calendar above the field when there isn't enough room below, and
  // caps its height (with internal scroll) rather than letting it run off
  // the bottom of the screen with no way to reach the rest.
  const calcDropPos = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const width  = 640;
    const margin = 16;
    const preferred = 580;

    let left = r.left;
    if (left + width > window.innerWidth - margin) left = Math.max(margin, window.innerWidth - width - margin);

    const spaceBelow = window.innerHeight - r.bottom - margin;
    const spaceAbove = r.top - margin;

    let top: number;
    let maxHeight: number;
    if (spaceBelow >= preferred || spaceBelow >= spaceAbove) {
      top = r.bottom + 8;
      maxHeight = Math.max(320, Math.min(preferred, window.innerHeight - top - margin));
    } else {
      maxHeight = Math.max(320, Math.min(preferred, spaceAbove - 8));
      top = Math.max(margin, r.top - 8 - maxHeight);
    }

    setDropStyle({ top, left, maxHeight });
  };

  // Keep the calendar correctly anchored if the page scrolls or resizes while open.
  useEffect(() => {
    if (!open) return;
    const onChange = () => calcDropPos();
    window.addEventListener("resize", onChange);
    window.addEventListener("scroll", onChange, true);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("scroll", onChange, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideWrap = wrapRef.current?.contains(target);
      const insideDrop = dropRef.current?.contains(target);
      if (!insideWrap && !insideDrop) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const display = departure
    ? tripType === "round-trip"
      ? returnDate ? `${fmtShort(departure)} — ${fmtShort(returnDate)}` : `${fmtShort(departure)} — ${t("flightSearch.addReturn")}`
      : fmtShort(departure)
    : t("flightSearch.addDates");

  return (
    <div ref={wrapRef} className="relative shrink-0">
      <div
        className="h-full flex flex-col justify-center bg-panel border border-line rounded-xl px-4 py-3 w-full lg:w-[200px] cursor-pointer"
        onClick={() => { calcDropPos(); setOpen(v => !v); }}
      >
        <label className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-1 block font-medium truncate">
          <Calendar size={10} className="inline mr-1" />{tripType === "round-trip" ? t("flightSearch.departureReturn") : t("datePicker.departure")}
        </label>
        <span className="text-sm text-ink font-light truncate block">{display}</span>
      </div>

      {open && mounted && (
        <DateRangeCalendar
          style={dropStyle}
          tripType={tripType}
          departure={departure}
          returnDate={returnDate}
          onPickDeparture={onPickDeparture}
          onPickReturn={onPickReturn}
          onClose={() => setOpen(false)}
          dropRef={dropRef}
        />
      )}
    </div>
  );
}

/* ─── Flight Search Widget ───────────────────────────────────────────── */
export default function FlightSearch({
  defaultFrom, defaultTo, defaultAirline, onRouteChange,
}: {
  defaultFrom?: City | null;
  defaultTo?: City | null;
  defaultAirline?: string;
  onRouteChange?: (from: City | null, to: City | null) => void;
}) {
  const router = useRouter();
  const { t } = useLanguage();
  const [tripType, setTripType] = useState<"one-way" | "round-trip" | "multi-city">("round-trip");
  const [legs, setLegs] = useState<{ from: City | null; to: City | null; date: Date | null }[]>([
    { from: null, to: null, date: null },
    { from: null, to: null, date: null },
  ]);
  // Start empty by default — only prefilled when a caller passes an explicit
  // From/To (e.g. deep-linked results). No more sticky Delhi → Dubai.
  const [from, setFrom] = useState<City | null>(defaultFrom ?? null);
  const [to, setTo] = useState<City | null>(defaultTo ?? null);
  const [departure, setDeparture]   = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [cabin, setCabin]   = useState("Economy");
  const [guests, setGuests] = useState(1);
  const [airline, setAirline] = useState(defaultAirline ?? "");
  const [showCabin, setShowCabin] = useState(false);
  const cabinRef = useRef<HTMLDivElement>(null);

  const sortedAirlines = useMemo(
    () => [...AIRLINES].sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // Let an ancestor (e.g. the homepage's destination map) react to the
  // user's current From/To selection as it changes.
  useEffect(() => {
    onRouteChange?.(from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  // ...and the reverse: if an ancestor changes defaultFrom/defaultTo after
  // mount (e.g. the traveller clicks a destination point on the map), sync
  // it into the form so the two stay consistent.
  useEffect(() => {
    if (defaultTo !== undefined && defaultTo?.code !== to?.code) setTo(defaultTo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultTo]);
  useEffect(() => {
    if (defaultFrom !== undefined && defaultFrom?.code !== from?.code) setFrom(defaultFrom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultFrom]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cabinRef.current && !cabinRef.current.contains(e.target as Node)) setShowCabin(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const swap = () => { const prevFrom = from; setFrom(to); setTo(prevFrom); };

  const setTripTypeSafe = (nextType: "one-way" | "round-trip" | "multi-city") => {
    setTripType(nextType);
    if (nextType === "one-way") setReturnDate(null);
  };

  const toISO = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  const search = () => {
    const p = new URLSearchParams();
    if (from) p.set("from", from.code);
    if (to)   p.set("to",   to.code);
    if (departure)  p.set("dep", toISO(departure));
    if (returnDate) p.set("ret", toISO(returnDate));
    p.set("cabin",  cabin);
    p.set("guests", String(guests));
    if (airline) p.set("airline", airline);
    router.push(`/flights?${p.toString()}`);
  };

  // Multi-city updates/adds/removes a leg, each with its own From/To/date.
  const updateLeg = (i: number, patch: Partial<{ from: City | null; to: City | null; date: Date | null }>) =>
    setLegs(prev => prev.map((leg, idx) => (idx === i ? { ...leg, ...patch } : leg)));
  const addLeg = () => setLegs(prev => (prev.length < 6 ? [...prev, { from: null, to: null, date: null }] : prev));
  const removeLeg = (i: number) => setLegs(prev => (prev.length > 2 ? prev.filter((_, idx) => idx !== i) : prev));

  // The mock flight results page only models a single route, so a multi-city
  // itinerary (which the results page can't represent) is instead handed to
  // the concierge team as an enquiry — fitting for a bespoke travel atelier,
  // where multi-leg routings are quoted by a specialist rather than self-served.
  const multiCityComplete = legs.every(leg => leg.from && leg.to && leg.date);
  const requestMultiCity = () => {
    const lines = legs.map((leg, i) =>
      `${i + 1}. ${leg.from!.name} (${leg.from!.code}) → ${leg.to!.name} (${leg.to!.code}) — ${fmtShort(leg.date!)}`
    );
    const message = [
      t("flightSearch.multiCityMessageIntro"),
      "",
      ...lines,
      "",
      `${t("flightSearch.travellersClass")}: ${guests} ${t("flightSearch.pax")} · ${t(CABIN_LABEL_KEYS[cabin])}`,
    ].join("\n");
    const p = new URLSearchParams({ subject: t("contact.topicNewJourney"), message });
    router.push(`/contact?${p.toString()}`);
  };

  const fieldCls = "bg-panel border border-line rounded-xl px-4 py-3";
  const labelCls = "text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-1 block font-medium truncate";

  return (
    <div className="space-y-4">
      {/* Trip type */}
      <div className="flex gap-6">
        {(["round-trip", "one-way", "multi-city"] as const).map(tripOption => (
          <label key={tripOption} className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="radio"
              name="flightTripType"
              value={tripOption}
              checked={tripType === tripOption}
              onChange={() => setTripTypeSafe(tripOption)}
              className="accent-gold w-3.5 h-3.5"
            />
            <span className="text-xs font-light text-ink-muted capitalize">
              {t(tripOption === "round-trip" ? "flightSearch.roundTrip" : tripOption === "one-way" ? "flightSearch.oneWay" : "flightSearch.multiCity")}
            </span>
          </label>
        ))}
      </div>

      {/* Multi-city legs — each with its own From/To/date, since the mock
          results page only models a single route, this gets handed to the
          concierge as an itinerary request rather than self-served results. */}
      {tripType === "multi-city" && (
        <div className="space-y-2">
          {legs.map((leg, i) => (
            <div key={i} className="flex flex-col lg:flex-row gap-2">
              <div className="flex flex-1 min-w-0 bg-panel border border-line relative">
                <div className="flex-1 px-4 py-3 min-w-0">
                  <AirportInput label={`${t("flightSearch.from")} ${i + 1}`} value={leg.from} onChange={c => updateLeg(i, { from: c })} exclude={leg.to?.code} />
                </div>
                <div className="w-px bg-line shrink-0 my-3" />
                <div className="flex-1 px-4 py-3 min-w-0">
                  <AirportInput label={`${t("flightSearch.to")} ${i + 1}`} value={leg.to} onChange={c => updateLeg(i, { to: c })} exclude={leg.from?.code} />
                </div>
              </div>
              <div className={`${fieldCls} w-full lg:w-[200px] shrink-0`}>
                <label className={labelCls}>{t("datePicker.departure")}</label>
                <input
                  type="date"
                  value={leg.date ? toISO(leg.date) : ""}
                  onChange={e => updateLeg(i, { date: e.target.value ? new Date(e.target.value) : null })}
                  className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer"
                />
              </div>
              {legs.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeLeg(i)}
                  className="shrink-0 self-center lg:self-stretch px-3 text-ink-faint hover:text-ink transition-colors"
                  title={t("flightSearch.removeFlight")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {legs.length < 6 && (
            <button
              type="button"
              onClick={addLeg}
              className="text-[11px] tracking-[0.14em] uppercase text-gold hover:underline"
            >
              + {t("flightSearch.addAnotherFlight")}
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:flex-wrap gap-2">
        {tripType !== "multi-city" && (
          <>
            {/* From / To */}
            <div className="flex flex-1 min-w-0 bg-panel border border-line relative">
              <div className="flex-1 px-4 py-3 min-w-0">
                <AirportInput label={t("flightSearch.from")} value={from} onChange={setFrom} exclude={to?.code} />
              </div>

              {/* Dedicated column for the swap button — reserves real layout space so it
                  can never overlap the From/To text, unlike absolute positioning. */}
              <div className="relative flex items-center justify-center w-14 shrink-0">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-8 bg-line" />
                <button
                  type="button"
                  onClick={swap}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-panel-raised border border-line flex items-center justify-center hover:border-ink hover:text-ink transition-all shadow-card"
                  title={t("flightSearch.swapAirports")}
                >
                  <ArrowLeftRight size={14} />
                </button>
              </div>

              <div className="flex-1 px-4 py-3 min-w-0">
                <AirportInput label={t("flightSearch.to")} value={to} onChange={setTo} exclude={from?.code} />
              </div>
            </div>

            {/* Dates */}
            <DateRangeField
              tripType={tripType}
              departure={departure}
              returnDate={returnDate}
              onPickDeparture={setDeparture}
              onPickReturn={setReturnDate}
            />
          </>
        )}

        {/* Cabin & Pax */}
        <div ref={cabinRef} className="relative shrink-0">
          <div className={`${fieldCls} h-full flex flex-col justify-center w-full lg:w-[200px] cursor-pointer`} onClick={() => setShowCabin(v => !v)}>
            <label className={labelCls}>{t("flightSearch.travellersClass")}</label>
            <div className="flex items-center justify-between gap-2 min-w-0">
              <span className="text-sm text-ink font-light truncate min-w-0">{guests} {t("flightSearch.pax")} · {t(CABIN_LABEL_KEYS[cabin])}</span>
              <ChevronDown size={13} className={`text-ink-faint shrink-0 transition-transform ${showCabin ? "rotate-180" : ""}`} />
            </div>
          </div>

          {showCabin && (
            <div className="absolute top-full right-0 mt-2 w-64 max-w-[90vw] bg-panel-raised border border-line rounded-xl shadow-widget z-50 p-5 animate-slide-down space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-ink">{t("flightSearch.passengers")}</p>
                  <p className="text-[11px] text-ink-faint font-light">{t("flightSearch.adults")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-muted hover:border-ink hover:text-ink transition-colors">−</button>
                  <span className="w-5 text-center text-sm font-semibold text-ink">{guests}</span>
                  <button type="button" onClick={() => setGuests(Math.min(9, guests + 1))}
                    className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-muted hover:border-ink hover:text-ink transition-colors">+</button>
                </div>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint mb-2 font-medium">{t("flightSearch.cabinClass")}</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {CABIN_CLASSES.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => { setCabin(c); setShowCabin(false); }}
                      className={`px-3 py-2 rounded-sm text-xs border transition-all text-left ${
                        cabin === c ? "bg-ink border-ink text-page" : "border-line text-ink-muted hover:border-ink/50 hover:text-ink"
                      }`}
                    >
                      {t(CABIN_LABEL_KEYS[c])}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Airline preference — sourced from every airline worldwide */}
        <div className="relative shrink-0">
          <div className={`${fieldCls} h-full flex flex-col justify-center w-full lg:w-[200px]`}>
            <label className={labelCls}><Plane size={10} className="inline mr-1" />{t("card.airline")}</label>
            <select
              value={airline}
              onChange={e => setAirline(e.target.value)}
              className="w-full bg-transparent text-sm text-ink focus:outline-none font-light cursor-pointer truncate"
            >
              <option value="">{t("flightSearch.anyAirline")}</option>
              {sortedAirlines.map(a => (
                <option key={a.code} value={a.code}>{a.name} ({a.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Search button */}
      {tripType === "multi-city" ? (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-ink-faint font-light">
            {t("flightSearch.multiCityHint")}
          </p>
          <button
            type="button"
            onClick={requestMultiCity}
            disabled={!multiCityComplete}
            className="flex items-center gap-2 px-8 py-3 bg-ink hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            <Search size={15} /> {t("flightSearch.requestItinerary")}
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-ink-faint font-light">
            {from && to ? `${from.name} → ${to.name}` : t("flightSearch.selectOriginDestination")}
          </p>
          <button
            type="button"
            onClick={search}
            disabled={!from || !to}
            className="flex items-center gap-2 px-8 py-3 bg-ink hover:bg-ink/90 disabled:opacity-40 disabled:cursor-not-allowed text-page font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-200 text-xs hover:scale-105 active:scale-95 disabled:hover:scale-100"
          >
            <Search size={15} /> {t("flightSearch.searchFlights")}
          </button>
        </div>
      )}
    </div>
  );
}
