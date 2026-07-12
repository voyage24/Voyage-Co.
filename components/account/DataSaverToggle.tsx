"use client";

import { useEffect, useState } from "react";
import { Gauge } from "lucide-react";

// Data-saver toggle: persists a preference that (via globals.css) skips
// autoplaying video and heavy decorative motion — real savings on roaming data
// and battery. Applied before paint by the layout head script.
export default function DataSaverToggle() {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(typeof document !== "undefined" && document.documentElement.dataset.saver === "1");
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try { localStorage.setItem("vc-data-saver", next ? "1" : "0"); } catch { /* private mode */ }
    if (next) document.documentElement.dataset.saver = "1";
    else delete document.documentElement.dataset.saver;
  };

  return (
    <div className="flex items-center justify-between gap-4 border border-line rounded-2xl p-5 bg-panel-soft">
      <div className="flex items-start gap-3">
        <Gauge size={18} className="text-gold mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-ink">Data saver</p>
          <p className="text-xs text-ink-muted font-light mt-0.5">Skip autoplaying video and heavy motion to save data and battery abroad.</p>
        </div>
      </div>
      <button
        onClick={toggle} role="switch" aria-checked={on}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${on ? "bg-gold" : "bg-line-strong"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${on ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );
}
