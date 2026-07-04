"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { hashRef, fmtDate, boardingDetails } from "@/lib/boarding-pass";

export type BoardingPassData = {
  airline: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departure: string;
  arrival: string;
  duration?: string | null;
  businessPrice?: number | null;
  passenger: string;
  reference: string;
  date?: string | null;
  guests: number;
  total: number;
};

// Draws a real boarding-pass-shaped PDF (landscape card + tear-off stub +
// barcode) rather than the generic document layout. jsPDF is loaded lazily.
export default function DownloadBoardingPassButton({ data, label = "Download boarding pass" }: { data: BoardingPassData; label?: string }) {
  const [busy, setBusy] = useState(false);

  const make = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });
      const { klass, seat, gate, zone, boarding } = boardingDetails(data);

      // palette
      const ink = () => doc.setTextColor(33, 29, 24);
      const gold = () => doc.setTextColor(201, 174, 119);
      const faint = () => doc.setTextColor(140, 140, 140);
      const page = () => doc.setTextColor(244, 240, 233);

      const CX = 20, CY = 48, CW = 257, CH = 114;       // card
      const STUB = 208;                                  // perforation x

      // card + stub tint
      doc.setFillColor(247, 244, 238);
      doc.rect(STUB, CY, CX + CW - STUB, CH, "F");
      doc.setDrawColor(210, 204, 190);
      doc.rect(CX, CY, CW, CH, "S");

      // header band
      doc.setFillColor(33, 29, 24);
      doc.rect(CX, CY, CW, 22, "F");
      gold(); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("BOARDING PASS", CX + 8, CY + 9, { charSpace: 1.5 });
      page(); doc.setFont("times", "normal"); doc.setFontSize(16);
      doc.text(data.airline, CX + 8, CY + 17.5);
      doc.setTextColor(180, 176, 168); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
      doc.text("FLIGHT", CX + CW - 8, CY + 8, { align: "right", charSpace: 1 });
      page(); doc.setFont("courier", "normal"); doc.setFontSize(13);
      doc.text(data.flightNumber, CX + CW - 8, CY + 16, { align: "right" });

      // field helper
      const field = (l: string, v: string, x: number, y: number, mono = false) => {
        faint(); doc.setFont("helvetica", "normal"); doc.setFontSize(7);
        doc.text(l.toUpperCase(), x, y, { charSpace: 0.8 });
        ink(); doc.setFont(mono ? "courier" : "helvetica", mono ? "normal" : "bold"); doc.setFontSize(10.5);
        doc.text(v, x, y + 5);
      };

      // route
      ink(); doc.setFont("times", "normal"); doc.setFontSize(40);
      doc.text(data.origin, CX + 12, CY + 46);
      doc.text(data.destination, STUB - 4, CY + 46, { align: "right" });
      faint(); doc.setFont("helvetica", "normal"); doc.setFontSize(9);
      doc.text(data.originCity, CX + 12, CY + 53);
      doc.text(data.destinationCity, STUB - 4, CY + 53, { align: "right" });
      // connector line + plane + duration
      const midY = CY + 40;
      doc.setDrawColor(201, 174, 119); doc.setLineWidth(0.3);
      doc.line(CX + 78, midY, STUB - 58, midY);
      doc.setFillColor(201, 174, 119);
      doc.triangle(STUB - 58, midY - 1.6, STUB - 58, midY + 1.6, STUB - 54, midY, "F");
      if (data.duration) { faint(); doc.setFontSize(8); doc.text(data.duration, (CX + 78 + STUB - 58) / 2, midY - 2.5, { align: "center" }); }

      // detail grid
      field("Passenger", data.passenger, CX + 12, CY + 72);
      field("Class", klass, CX + 128, CY + 72);
      field("Date", fmtDate(data.date), CX + 12, CY + 88);
      field("Departs", data.departure || "—", CX + 92, CY + 88);
      field("Arrives", data.arrival || "—", CX + 140, CY + 88);
      field("Boarding", boarding, CX + 12, CY + 104);
      field("Gate", gate, CX + 60, CY + 104);
      field("Seat", seat, CX + 100, CY + 104, true);
      field("Zone", String(zone), CX + 140, CY + 104);

      // perforation
      doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.2);
      doc.setLineDashPattern([1.4, 1.4], 0);
      doc.line(STUB, CY + 2, STUB, CY + CH - 2);
      doc.setLineDashPattern([], 0);

      // stub
      const SX = STUB + 6;
      gold(); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text("BOARDING PASS", SX, CY + 12, { charSpace: 1 });
      field("Passenger", data.passenger, SX, CY + 24);
      field("Flight", data.flightNumber, SX, CY + 38, true);
      field("Seat", seat, SX, CY + 52, true);
      field("Gate", gate, SX + 30, CY + 52);
      field("Booking", data.reference, SX, CY + 66, true);

      // barcode
      let bx = SX, h = hashRef(data.reference);
      const barTop = CY + 82, barH = 16, barRight = CX + CW - 6;
      while (bx < barRight) {
        h = (h * 1103515245 + 12345) & 0x7fffffff;
        const w = 0.4 + (h % 3) * 0.35;
        const light = ((h >> 4) & 3) === 0;
        doc.setFillColor(light ? 150 : 33, light ? 150 : 29, light ? 150 : 24);
        doc.rect(bx, barTop, w, barH, "F");
        bx += w + 0.5;
      }
      faint(); doc.setFont("courier", "normal"); doc.setFontSize(8);
      doc.text(data.reference, (SX + barRight) / 2, barTop + barH + 4, { align: "center" });

      // footer
      faint(); doc.setFont("helvetica", "normal"); doc.setFontSize(7.5);
      doc.text(
        "Seat, gate & boarding are indicative — the airline confirms final details at online check-in. Carry a valid photo ID/passport.  Voyages & Co. · voyagesco.com",
        CX, CY + CH + 8
      );

      doc.save(`boarding-pass-${data.reference}.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={make}
      disabled={busy}
      className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted rounded px-3 py-1.5 border border-transparent hover:bg-panel-soft hover:text-ink hover:border-line active:bg-gold/20 active:text-ink disabled:opacity-50 transition-colors print:hidden"
    >
      <Download size={15} /> {busy ? "Preparing…" : label}
    </button>
  );
}
