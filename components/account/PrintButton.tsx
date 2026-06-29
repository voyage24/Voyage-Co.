"use client";

import { Download } from "lucide-react";

export default function PrintButton({ label = "Save as PDF" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink print:hidden">
      <Download size={15} /> {label}
    </button>
  );
}
