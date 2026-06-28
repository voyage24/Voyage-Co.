"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { CURRENCIES, type Currency } from "@/lib/currency";

interface CurrencyContextValue {
  currency: Currency;
  setCurrencyCode: (code: string) => void;
  convert: (inrAmount: number) => number;
  format: (inrAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const STORAGE_KEY = "vc-currency";

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useState("INR");
  const [liveRates, setLiveRates] = useState<Record<string, number>>({});

  // Load once on the client (avoids SSR/CSR mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CURRENCIES.some(c => c.code === saved)) setCode(saved);
    } catch {}
  }, []);

  // Pull live FX rates (base INR); silently keep static rates if unavailable.
  useEffect(() => {
    fetch("/api/fx")
      .then(r => r.json())
      .then(d => { if (d?.rates && typeof d.rates === "object") setLiveRates(d.rates); })
      .catch(() => {});
  }, []);

  const setCurrencyCode = useCallback((c: string) => {
    setCode(c);
    try { localStorage.setItem(STORAGE_KEY, c); } catch {}
  }, []);

  const currency = useMemo(() => CURRENCIES.find(c => c.code === code) ?? CURRENCIES[0], [code]);

  // Prefer the live rate for the selected currency; fall back to the static one.
  const effectiveRate = useMemo(
    () => (currency.code !== "INR" && liveRates[currency.code]) || currency.rate,
    [currency, liveRates],
  );

  const convert = useCallback((inrAmount: number) => inrAmount * effectiveRate, [effectiveRate]);

  const format = useCallback((inrAmount: number) => {
    const value = convert(inrAmount);
    const decimals = value < 10 ? 2 : 0;
    const formatted = value.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: 0 });
    return `${currency.symbol}${formatted}`;
  }, [convert, currency]);

  return (
    <CurrencyContext.Provider value={{ currency, setCurrencyCode, convert, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
