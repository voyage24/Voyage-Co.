"use client";

import { useState, useRef, useEffect } from "react";
import { Users, ChevronDown, Minus, Plus } from "lucide-react";
import type { PassengerCount, CabinClass } from "@/lib/types";

interface PassengerSelectorProps {
  value: PassengerCount;
  cabinClass: CabinClass;
  onChange: (p: PassengerCount, c: CabinClass) => void;
  showClass?: boolean;
}

const CLASSES: CabinClass[] = ["Economy", "Premium Economy", "Business", "First"];

export default function PassengerSelector({
  value, cabinClass, onChange, showClass = true,
}: PassengerSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const total = value.adults + value.children + value.infants;

  const update = (field: keyof PassengerCount, delta: number) => {
    const next = { ...value, [field]: Math.max(field === "adults" ? 1 : 0, value[field] + delta) };
    if (next.adults + next.children + next.infants > 9) return;
    if (next.infants > next.adults) return;
    onChange(next, cabinClass);
  };

  const label = `${total} Traveller${total > 1 ? "s" : ""}${showClass ? `, ${cabinClass}` : ""}`;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left"
      >
        <Users size={16} className="text-brand-blue shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-600 font-medium uppercase tracking-wide">Passengers</p>
          <p className="text-sm font-semibold text-gray-800 truncate">{label}</p>
        </div>
        <ChevronDown size={14} className={`text-gray-600 transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-72 max-w-[90vw] bg-white rounded-2xl shadow-widget border border-gray-100 p-5 z-50 animate-slide-down">
          {([
            { key: "adults", label: "Adults", sub: "12+ years" },
            { key: "children", label: "Children", sub: "2–12 years" },
            { key: "infants", label: "Infants", sub: "Under 2 years" },
          ] as const).map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
              <div>
                <p className="text-sm font-semibold text-gray-800">{label}</p>
                <p className="text-xs text-gray-600">{sub}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => update(key, -1)}
                  disabled={value[key] <= (key === "adults" ? 1 : 0)}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-blue hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="w-5 text-center text-sm font-bold text-gray-800">{value[key]}</span>
                <button
                  type="button"
                  onClick={() => update(key, 1)}
                  disabled={total >= 9 || (key === "infants" && value.infants >= value.adults)}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-brand-blue hover:text-brand-blue disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}

          {showClass && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Cabin Class</p>
              <div className="grid grid-cols-2 gap-2">
                {CLASSES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onChange(value, c)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      cabinClass === c
                        ? "border-brand-blue bg-blue-50 text-brand-blue"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full mt-4 py-2.5 bg-brand-blue text-white rounded-xl text-sm font-semibold hover:bg-brand-blue-dark transition-colors"
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}
