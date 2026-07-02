"use client";

import { CalendarPlus } from "lucide-react";

// Generates and downloads an .ics calendar file for a booking (all-day event
// spanning the stay). Works with Apple/Google/Outlook calendars.
export default function AddToCalendar({ title, reference, checkIn, checkOut }: { title: string; reference: string; checkIn: string | null; checkOut: string | null }) {
  if (!checkIn || isNaN(new Date(checkIn).getTime())) return null;

  const toDate = (s: string) => s.replace(/-/g, "");
  const addDay = (s: string) => { const d = new Date(s); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10).replace(/-/g, ""); };

  const download = () => {
    const start = toDate(checkIn);
    const end = checkOut && !isNaN(new Date(checkOut).getTime()) ? toDate(checkOut) : addDay(checkIn);
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Voyages & Co.//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${reference}@voyagesco.com`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${start}`,
      `DTEND;VALUE=DATE:${end}`,
      `SUMMARY:${title} — Voyages & Co.`,
      `DESCRIPTION:Your Voyages & Co. journey. Booking reference ${reference}.`,
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = document.createElement("a");
    a.href = url; a.download = `voyages-${reference}.ics`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button onClick={download} className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-ink-muted rounded px-2.5 py-1.5 border border-transparent hover:bg-panel-soft hover:text-ink hover:border-line active:bg-gold/20 active:text-ink transition-colors whitespace-nowrap">
      <CalendarPlus size={14} /> Add to calendar
    </button>
  );
}
