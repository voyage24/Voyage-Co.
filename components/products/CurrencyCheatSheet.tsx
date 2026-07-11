"use client";

import { useEffect, useMemo, useState } from "react";
import { Banknote } from "lucide-react";
import { getCountryMeta } from "@/lib/country-meta";
import { useCurrency } from "@/components/providers/CurrencyProvider";

// Currency cheat-sheet: the destination's currency, the live cross-rate against
// the visitor's chosen display currency, and a quick two-way converter. Rates
// come from /api/content/rates (cached daily). Hides for unknown countries.
export default function CurrencyCheatSheet({ country }: { country?: string | null }) {
  const meta = getCountryMeta(country);
  const { currency } = useCurrency();
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [amount, setAmount] = useState("100");

  useEffect(() => {
    if (!meta) return;
    let on = true;
    fetch("/api/content/rates").then(r => r.json()).then(d => { if (on) setRates(d?.rates ?? null); }).catch(() => {});
    return () => { on = false; };
  }, [meta]);

  // Cross-rate: 1 unit of the visitor's display currency → destination units.
  const rate = useMemo(() => {
    if (!rates || !meta) return null;
    const from = rates[currency.code], to = rates[meta.ccy];
    if (!from || !to) return null;
    return to / from;
  }, [rates, meta, currency.code]);

  if (!meta) return null;

  const same = meta.ccy === currency.code;
  const amt = parseFloat(amount) || 0;
  const nice = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: n < 10 ? 2 : 0 });

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <Banknote size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Currency</p>
      </div>

      <p className="text-sm text-ink">
        {meta.ccyName} <span className="text-ink-faint">({meta.ccy} · {meta.symbol})</span>
      </p>

      {same ? (
        <p className="text-xs text-ink-muted mt-2 font-light">Same as your selected currency — no conversion needed.</p>
      ) : rate ? (
        <>
          <p className="text-xs text-ink-muted mt-1">
            <span className="text-ink font-medium">1 {currency.code}</span> ≈ {meta.symbol}{nice(rate)} · <span className="text-ink font-medium">1 {meta.ccy}</span> ≈ {currency.symbol}{nice(1 / rate)}
          </p>
          <div className="flex items-center gap-2 mt-3 text-sm">
            <span className="text-ink-faint text-xs">{currency.symbol}</span>
            <input
              type="number" inputMode="decimal" value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-24 bg-panel border border-line rounded-sm px-2 py-1 text-ink text-sm focus:outline-none focus:border-gold"
            />
            <span className="text-ink-faint">=</span>
            <span className="text-ink font-medium">{meta.symbol}{nice(amt * rate)}</span>
          </div>
        </>
      ) : (
        <p className="text-xs text-ink-muted mt-2 font-light">Live rate unavailable — check a converter before you travel.</p>
      )}
      <p className="text-[10px] text-ink-faint mt-3 font-light">Indicative rate — cards and bureaux add a margin.</p>
    </div>
  );
}
