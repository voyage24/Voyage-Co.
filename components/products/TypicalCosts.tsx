"use client";

import { useEffect, useState } from "react";
import { Coffee, Car, GlassWater, UtensilsCrossed } from "lucide-react";
import { getTypicalCosts } from "@/lib/typical-costs";
import { useCurrency } from "@/components/providers/CurrencyProvider";

// "What things cost" snapshot for the destination, shown in the guest's chosen
// currency. USD reference prices (lib/typical-costs) × the live USD→currency rate
// from /api/content/rates. Hides for unknown countries or if rates are down.
export default function TypicalCosts({ country }: { country?: string | null }) {
  const costs = getTypicalCosts(country);
  const { currency } = useCurrency();
  const [usdRate, setUsdRate] = useState<number | null>(null); // display units per 1 USD

  useEffect(() => {
    if (!costs) return;
    let on = true;
    fetch("/api/content/rates")
      .then(r => r.json())
      .then(d => { if (on && d?.rates?.[currency.code]) setUsdRate(d.rates[currency.code]); })
      .catch(() => {});
    return () => { on = false; };
  }, [costs, currency.code]);

  if (!costs || !usdRate) return null;

  const money = (usd: number) => {
    const v = usd * usdRate;
    const rounded = v >= 100 ? Math.round(v / 10) * 10 : v >= 10 ? Math.round(v) : Math.round(v * 10) / 10;
    return `${currency.symbol}${rounded.toLocaleString()}`;
  };

  const rows = [
    { icon: <Coffee size={14} className="text-gold" />, label: "Coffee", value: money(costs.coffee) },
    { icon: <GlassWater size={14} className="text-gold" />, label: "Bottled water", value: money(costs.water) },
    { icon: <Car size={14} className="text-gold" />, label: "Short taxi ride", value: money(costs.taxi) },
    { icon: <UtensilsCrossed size={14} className="text-gold" />, label: "Dinner for one", value: money(costs.dinner) },
  ];

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Typical costs</p>
        <span className="text-[10px] text-ink-faint">in {currency.code}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            {r.icon}
            <div className="min-w-0">
              <p className="text-sm text-ink leading-none">{r.value}</p>
              <p className="text-[11px] text-ink-faint mt-0.5">{r.label}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-ink-faint mt-3 font-light">Indicative mid-market prices.</p>
    </div>
  );
}
