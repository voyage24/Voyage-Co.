"use client";

import { useCurrency } from "@/components/providers/CurrencyProvider";

/**
 * Renders an INR amount converted to the globally selected currency.
 * Lets server components (e.g. statically generated detail pages) display
 * a currency-aware price without themselves becoming client components.
 */
export default function Price({ amount, className }: { amount: number; className?: string }) {
  const { format } = useCurrency();
  return <span className={className}>{format(amount)}</span>;
}
