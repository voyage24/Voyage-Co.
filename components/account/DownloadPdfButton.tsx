"use client";

import { useState } from "react";
import { Download } from "lucide-react";

export type PdfRow = { label: string; value: string };
export type PdfData = {
  filename: string;
  subtitle: string;          // header eyebrow, e.g. "Travel Voucher"
  image?: string;            // destination photo banner at the top
  headingLabel?: string;     // small centred label above the heading
  heading?: string;          // large centred value (e.g. the reference)
  intro?: string;            // a short lead paragraph
  rows?: PdfRow[];           // label / value detail rows
  paragraphs?: string[];     // free narrative (journal)
  footer?: string;           // fine print at the base
};

// Fetches a remote image and returns a data URL + format. Returns null on any
// failure (e.g. CORS) so the PDF still generates without the photo.
async function loadImage(src: string): Promise<{ url: string; fmt: "JPEG" | "PNG" } | null> {
  try {
    const res = await fetch(src, { mode: "cors" });
    if (!res.ok) return null;
    const blob = await res.blob();
    const url = await new Promise<string>((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.onerror = reject;
      fr.readAsDataURL(blob);
    });
    return { url, fmt: blob.type.includes("png") ? "PNG" : "JPEG" };
  } catch {
    return null;
  }
}

// Generates a real, downloadable PDF in the browser (works on phones, unlike
// window.print() which silently no-ops in many mobile / in-app browsers).
// jsPDF is imported lazily so it never weighs down the main bundle.
export default function DownloadPdfButton({ data, label = "Download PDF" }: { data: PdfData; label?: string }) {
  const [busy, setBusy] = useState(false);

  const make = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210;
      const M = 16;

      // Optional destination photo banner across the top.
      let top = 0;
      if (data.image) {
        const img = await loadImage(data.image);
        if (img) {
          doc.addImage(img.url, img.fmt, 0, 0, W, 60);
          top = 60;
        }
      }

      // Header band (sits below the photo, or at the very top if none loaded)
      doc.setFillColor(33, 29, 24);
      doc.rect(0, top, W, 22, "F");
      doc.setTextColor(244, 240, 233);
      doc.setFont("times", "normal");
      doc.setFontSize(20);
      doc.text("Voyages & Co.", M, top + 12);
      doc.setTextColor(201, 174, 119);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(data.subtitle.toUpperCase(), M, top + 18, { charSpace: 1.2 });

      let y = top + 38;

      if (data.heading) {
        if (data.headingLabel) {
          doc.setTextColor(130, 130, 130);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.text(data.headingLabel.toUpperCase(), W / 2, y, { align: "center", charSpace: 1.5 });
          y += 8;
        }
        doc.setTextColor(33, 29, 24);
        doc.setFont("times", "normal");
        doc.setFontSize(24);
        doc.text(data.heading, W / 2, y, { align: "center" });
        y += 12;
      }

      if (data.intro) {
        doc.setTextColor(80, 74, 66);
        doc.setFont("times", "italic");
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(data.intro, W - M * 2);
        doc.text(lines, W / 2, y, { align: "center" });
        y += lines.length * 6 + 4;
      }

      if (data.rows?.length) {
        doc.setFontSize(10);
        for (const r of data.rows) {
          doc.setDrawColor(224, 218, 205);
          doc.line(M, y, W - M, y);
          y += 6.5;
          doc.setTextColor(130, 130, 130);
          doc.setFont("helvetica", "normal");
          doc.text(r.label.toUpperCase(), M, y, { charSpace: 0.4 });
          doc.setTextColor(33, 29, 24);
          const val = doc.splitTextToSize(r.value, 110);
          doc.text(val, W - M, y, { align: "right" });
          y += Math.max(1, val.length) * 5 + 1.5;
        }
        doc.setDrawColor(224, 218, 205);
        doc.line(M, y, W - M, y);
        y += 10;
      }

      if (data.paragraphs?.length) {
        doc.setTextColor(60, 54, 46);
        doc.setFont("times", "normal");
        doc.setFontSize(11.5);
        for (const p of data.paragraphs) {
          const lines = doc.splitTextToSize(p, W - M * 2);
          if (y + lines.length * 6 > 278) { doc.addPage(); y = 22; }
          doc.text(lines, M, y);
          y += lines.length * 6 + 5;
        }
      }

      if (data.footer) {
        doc.setTextColor(140, 140, 140);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        const fl = doc.splitTextToSize(data.footer, W - M * 2);
        doc.text(fl, M, 286);
      }

      doc.save(data.filename);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={make}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink disabled:opacity-50 print:hidden"
    >
      <Download size={15} /> {busy ? "Preparing…" : label}
    </button>
  );
}
