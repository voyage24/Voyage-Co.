"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";

// Live converter. Rates are "units of currency per ₹1" (matches /api/fx and the
// static CURRENCIES table). We convert via INR as the pivot.
export default function CurrencyConverter() {
  const [rates, setRates] = useState<Record<string, number>>({});
  const [updated, setUpdated] = useState<string | null>(null);
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("USD");

  useEffect(() => {
    fetch("/api/fx").then(r => r.json()).then(d => {
      if (d?.rates && Object.keys(d.rates).length) { setRates(d.rates); setUpdated(d.updated ?? null); }
    }).catch(() => {});
  }, []);

  const rateOf = useCallback(
    (code: string) => rates[code] ?? CURRENCIES.find(c => c.code === code)?.rate ?? 1,
    [rates],
  );

  const result = useMemo(() => {
    const a = parseFloat(amount);
    if (!isFinite(a)) return null;
    const inr = a / rateOf(from);      // to INR
    return inr * rateOf(to);            // to target
  }, [amount, from, to, rateOf]);

  const unitRate = useMemo(() => rateOf(to) / rateOf(from), [from, to, rateOf]);
  const fmt = (n: number, code: string) => {
    const sym = CURRENCIES.find(c => c.code === code)?.symbol ?? "";
    return `${sym}${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  };
  const swap = () => { setFrom(to); setTo(from); };

  return (
    <div className="bg-panel border border-line rounded-2xl shadow-card p-6 sm:p-8">
      <label className="block text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-2">Amount</label>
      <input
        type="number"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full bg-panel-raised border border-line px-4 py-3 text-2xl font-light text-ink focus:outline-none focus:border-gold mb-5"
      />

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-2">From</label>
          <select value={from} onChange={e => setFrom(e.target.value)} className="w-full bg-panel-raised border border-line px-3 py-3 text-sm text-ink focus:outline-none focus:border-gold">
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
        </div>
        <button onClick={swap} aria-label="Swap currencies" className="shrink-0 mb-1 w-11 h-11 flex items-center justify-center border border-line text-ink-muted hover:text-gold hover:border-gold transition-colors">
          <ArrowLeftRight size={18} />
        </button>
        <div className="flex-1">
          <label className="block text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-2">To</label>
          <select value={to} onChange={e => setTo(e.target.value)} className="w-full bg-panel-raised border border-line px-3 py-3 text-sm text-ink focus:outline-none focus:border-gold">
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-7 pt-6 border-t border-line text-center">
        <p className="text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-1">{fmt(parseFloat(amount) || 0, from)} equals</p>
        <p className="font-serif text-4xl font-light text-ink">{result != null ? fmt(result, to) : "—"}</p>
        <p className="text-xs text-ink-faint font-light mt-3">1 {from} = {unitRate.toLocaleString("en-IN", { maximumFractionDigits: 4 })} {to}</p>
        <p className="text-[10px] text-ink-faint/70 mt-1">
          {Object.keys(rates).length ? `Live rates${updated ? ` · updated ${updated}` : ""}` : "Indicative rates"}
        </p>
      </div>
    </div>
  );
}
