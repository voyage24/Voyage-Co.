"use client";

import { TrendingUp } from "lucide-react";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import type { PriceContext as PC } from "@/lib/price-context";

// Value indicator for a nightly rate vs comparable stays. A slim range bar with
// the property's position marked, plus a plain-language verdict. Currency is
// formatted client-side to the guest's chosen currency.
export default function PriceContext({ ctx, category, country }: { ctx: PC; category: string; country: string }) {
  const { format } = useCurrency();

  const tone =
    ctx.band === "value" ? { dot: "bg-emerald-500", text: "text-emerald-600", fill: "bg-emerald-500/70" }
    : ctx.band === "premium" ? { dot: "bg-gold", text: "text-gold", fill: "bg-gold/70" }
    : { dot: "bg-ink/50", text: "text-ink-muted", fill: "bg-ink/30" };

  return (
    <div className="mt-4 rounded-xl border border-line bg-panel-soft p-4">
      <div className="flex items-center gap-1.5 mb-2.5">
        <TrendingUp size={13} className={tone.text} />
        <span className={`text-xs font-medium ${tone.text}`}>{ctx.label}</span>
        <span className="text-[11px] text-ink-faint ml-auto">vs {ctx.count} similar stays</span>
      </div>

      {/* range bar: min ── marker ── max */}
      <div className="relative h-1.5 rounded-full bg-line-strong/40">
        <div className={`absolute inset-y-0 left-0 rounded-full ${tone.fill}`} style={{ width: `${ctx.position * 100}%` }} />
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-panel ${tone.dot}`}
          style={{ left: `${ctx.position * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] text-ink-faint">
        <span>{format(ctx.min)}</span>
        <span>{format(ctx.max)}</span>
      </div>

      <p className="text-[11px] text-ink-faint mt-2 font-light">
        Among {category.toLowerCase()} stays in {country}, typically {format(ctx.min)}–{format(ctx.max)} · median {format(ctx.median)}.
      </p>
    </div>
  );
}
