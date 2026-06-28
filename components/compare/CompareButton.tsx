"use client";

import { GitCompareArrows, Check } from "lucide-react";
import { useCompare, toggleCompare, type CompareItem } from "@/lib/compare";

// Toggle an item in/out of the side-by-side comparison list.
export default function CompareButton({ label, ...item }: CompareItem & { label?: boolean }) {
  const list = useCompare();
  const active = list.some(x => x.type === item.type && x.id === item.id);

  return (
    <button
      type="button"
      onClick={() => toggleCompare(item)}
      aria-pressed={active}
      className={`inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${active ? "text-gold" : "text-ink-muted hover:text-ink"}`}
    >
      {active ? <Check size={15} /> : <GitCompareArrows size={15} />}
      {label && (active ? "Comparing" : "Compare")}
    </button>
  );
}
