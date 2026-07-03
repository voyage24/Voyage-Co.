"use client";

import { useMemo, useState } from "react";
import { Plane, Loader2, ArrowRight } from "lucide-react";
import { AIRLINES } from "@/lib/airlines";

type Status = {
  carrier: string; flightNumber: string; date: string;
  origin: string; destination: string;
  departureTime: string | null; arrivalTime: string | null;
  departureTerminal: string | null; arrivalTerminal: string | null;
  aircraft: string | null; duration: string | null;
};

const fmt = (iso: string | null) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

export default function FlightTracker() {
  const today = new Date().toISOString().slice(0, 10);
  const [carrier, setCarrier] = useState("");
  const [number, setNumber] = useState("");
  const [date, setDate] = useState(today);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Status | null>(null);

  const airlines = useMemo(() => [...AIRLINES].sort((a, b) => a.name.localeCompare(b.name)), []);

  const track = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(""); setResult(null); setBusy(true);
    try {
      const qp = new URLSearchParams({ carrier: carrier.trim(), number: number.trim(), date });
      const res = await fetch(`/api/flights/status?${qp.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't fetch flight status");
      setResult(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <div>
      <form onSubmit={track} className="bg-panel border border-line rounded-2xl p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <div className="sm:col-span-1">
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Airline</label>
          <input list="tracker-airlines" required value={carrier} onChange={e => setCarrier(e.target.value.toUpperCase())} placeholder="e.g. AI" maxLength={3} className={field} />
          <datalist id="tracker-airlines">
            {airlines.map(a => <option key={a.code} value={a.code}>{a.name}</option>)}
          </datalist>
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Flight no.</label>
          <input required value={number} onChange={e => setNumber(e.target.value)} placeholder="e.g. 111" className={field} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Date</label>
          <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={field} />
        </div>
        <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Plane size={15} />} Track
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 bg-panel border border-line rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <p className="font-serif text-2xl font-light text-ink">{result.carrier} {result.flightNumber}</p>
            <span className="text-[10px] tracking-[0.16em] uppercase text-gold border border-gold/40 px-2.5 py-1 rounded-sm">Scheduled</span>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <p className="font-serif text-3xl font-light text-ink">{result.origin || "—"}</p>
              <p className="text-xs text-ink-faint font-light mt-1">{fmt(result.departureTime)}</p>
              {result.departureTerminal && <p className="text-[11px] text-ink-faint mt-0.5">Terminal {result.departureTerminal}</p>}
            </div>
            <div className="flex-1 flex flex-col items-center gap-1 text-ink-faint">
              {result.duration && <span className="text-[11px]">{result.duration}</span>}
              <div className="w-full flex items-center gap-1"><span className="h-px bg-line flex-1" /><ArrowRight size={14} className="text-gold" /><span className="h-px bg-line flex-1" /></div>
            </div>
            <div className="text-center">
              <p className="font-serif text-3xl font-light text-ink">{result.destination || "—"}</p>
              <p className="text-xs text-ink-faint font-light mt-1">{fmt(result.arrivalTime)}</p>
              {result.arrivalTerminal && <p className="text-[11px] text-ink-faint mt-0.5">Terminal {result.arrivalTerminal}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm border-t border-line pt-4">
            <span className="text-ink-muted">Aircraft: <span className="text-ink">{result.aircraft || "—"}</span></span>
            <span className="text-ink-muted">Date: <span className="text-ink">{result.date}</span></span>
          </div>
        </div>
      )}
    </div>
  );
}
