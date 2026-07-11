"use client";

import { Download } from "lucide-react";

// "Download PDF" via the browser's print dialog (Save as PDF) — a branded,
// dependency-free export of the on-screen quote. Site chrome is hidden by the
// @media print rules in globals.css.
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print w-full inline-flex items-center justify-center gap-2 py-3 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-colors"
    >
      <Download size={14} /> Download PDF
    </button>
  );
}
