"use client";

import Link from "next/link";
import Image from "next/image";
import { X, GitCompareArrows } from "lucide-react";
import { useCompare, removeCompare, clearCompare } from "@/lib/compare";

// Floating bar (bottom-centre) showing the items queued for comparison.
export default function CompareBar() {
  const list = useCompare();
  if (list.length === 0) return null;

  return (
    <div className="fixed bottom-[5.25rem] sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-[min(94vw,640px)]">
      <div className="bg-panel-raised border border-line shadow-luxury rounded-full px-3 py-2 flex items-center gap-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {list.map(item => (
            <div key={`${item.type}-${item.id}`} className="relative shrink-0 w-10 h-10 rounded-full overflow-hidden border border-line">
              <Image src={item.image} alt={item.title} fill sizes="40px" className="object-cover" />
              <button onClick={() => removeCompare(item.type, item.id)} className="absolute inset-0 bg-vc-950/0 hover:bg-vc-950/50 flex items-center justify-center text-transparent hover:text-white transition-colors" aria-label={`Remove ${item.title}`}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <button onClick={clearCompare} className="text-[11px] tracking-[0.1em] uppercase text-ink-faint hover:text-ink">Clear</button>
          <Link href="/compare" className="inline-flex items-center gap-1.5 bg-ink text-page text-[11px] tracking-[0.12em] uppercase px-4 py-2 rounded-full hover:bg-ink/90">
            <GitCompareArrows size={14} /> Compare ({list.length})
          </Link>
        </div>
      </div>
    </div>
  );
}
