"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import CurrencyConverter from "@/components/tools/CurrencyConverter";

// Quick currency converter opened from the navbar. Reuses the full converter
// (live /api/fx rates) inside a dropdown panel.
export default function NavConverter({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative group" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Currency converter"
        title="Currency converter"
        className={`inline-flex items-center gap-1.5 text-[13px] font-normal tracking-[0.08em] uppercase leading-none transition-all duration-200 py-2 hover:scale-105 active:scale-95 ${
          tone === "light" ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink"
        }`}
      >
        <ArrowLeftRight size={14} />
        Convert
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[92vw] z-[60] shadow-luxury">
          <CurrencyConverter />
        </div>
      )}
    </div>
  );
}
