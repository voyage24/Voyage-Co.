"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { CURRENCIES } from "@/lib/currency";
import { useCurrency } from "@/components/providers/CurrencyProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export default function CurrencySelector({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const { currency, setCurrencyCode } = useCurrency();
  const { t } = useLanguage();
  const [open, setOpen]       = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery]     = useState("");
  const [dropStyle, setDropStyle] = useState<React.CSSProperties>({});

  const wrapRef = useRef<HTMLDivElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const calcPos = () => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const width  = 300;
    const margin = 16;
    let left = r.right - width;
    if (left < margin) left = margin;
    if (left + width > window.innerWidth - margin) left = window.innerWidth - width - margin;

    const spaceBelow = window.innerHeight - r.bottom - margin;
    const preferred  = 380;
    const maxHeight  = Math.max(220, Math.min(preferred, spaceBelow));
    setDropStyle({ top: r.bottom + 8, left, maxHeight });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!wrapRef.current?.contains(target) && !dropRef.current?.contains(target)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CURRENCIES;
    return CURRENCIES.filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
  }, [query]);

  const color = tone === "light" ? "text-white/90 hover:text-white" : "text-ink-muted hover:text-ink";
  const maxH = (dropStyle as { maxHeight?: number }).maxHeight;

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => { calcPos(); setOpen(v => !v); }}
        className={`inline-flex items-center gap-1 text-[13px] font-normal tracking-[0.08em] uppercase transition-all duration-200 py-2 shrink-0 hover:scale-110 active:scale-95 ${color}`}
        aria-label={t("currencySelector.selectCurrency")}
      >
        {currency.code}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && mounted && createPortal(
        <div
          ref={dropRef}
          style={{ ...dropStyle, position: "fixed", zIndex: 9999, display: "flex", flexDirection: "column" }}
          className="bg-panel-raised border border-line shadow-luxury w-[300px] max-w-[92vw] overflow-hidden"
        >
          <div className="p-3 border-b border-line shrink-0">
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={t("currencySelector.searchPlaceholder")}
              className="w-full bg-panel border border-line px-3 py-2 text-sm text-ink placeholder:text-ink-faint focus:outline-none font-light"
            />
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: maxH ? maxH - 64 : undefined }}>
            {matches.length === 0 ? (
              <div className="px-4 py-4 text-sm text-ink-faint font-light">{t("currencySelector.noResults")}</div>
            ) : (
              matches.map(c => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => { setCurrencyCode(c.code); setOpen(false); setQuery(""); }}
                  className={`w-full px-4 py-2.5 text-left hover:bg-panel-soft transition-colors flex items-center justify-between gap-3 border-b border-line last:border-0 ${
                    c.code === currency.code ? "bg-panel-soft" : ""
                  }`}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-medium text-ink w-11 shrink-0">{c.code}</span>
                    <span className="text-xs text-ink-faint font-light truncate">{c.name}</span>
                  </span>
                  <span className="text-sm text-gold font-medium shrink-0">{c.symbol}</span>
                </button>
              ))
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
