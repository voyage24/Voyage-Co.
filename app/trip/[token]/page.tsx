import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { CalendarDays, MapPin, FileText, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "A Shared Trip — Voyages & Co.", robots: { index: false } };

type Doc = { label: string; url: string };
const fmt = (s?: string | null) => (s && !isNaN(Date.parse(s)) ? new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(s)) : s || "");

// Read-only trip view for a travelling companion — shared via a capability
// token, no sign-in needed. Shows the itinerary essentials + documents.
export default async function SharedTripPage({ params }: { params: { token: string } }) {
  const b = await prisma.booking.findUnique({ where: { shareToken: params.token } });
  if (!b) notFound();

  const documents = (b.documents as Doc[] | null) ?? [];
  const daysToGo = b.checkIn && !isNaN(Date.parse(b.checkIn))
    ? Math.ceil((new Date(b.checkIn).getTime() - Date.now()) / 86_400_000)
    : null;

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">A shared trip</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{b.itemTitle}</h1>
        <p className="text-ink-muted font-light mt-2 capitalize">{b.type} · {b.status}</p>
      </div>

      {daysToGo !== null && daysToGo >= 0 && (
        <div className="text-center mb-8">
          <span className="font-serif text-5xl font-light text-ink">{daysToGo}</span>
          <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint mt-1">{daysToGo === 0 ? "Today" : daysToGo === 1 ? "day to go" : "days to go"}</p>
        </div>
      )}

      <div className="bg-panel border border-line rounded-2xl shadow-card p-6 sm:p-8 space-y-4">
        <Row icon={<Users size={15} className="text-gold" />} label="Guest" value={`${b.guestName}${b.guests > 1 ? ` · ${b.guests} travelling` : ""}`} />
        {b.checkIn && <Row icon={<CalendarDays size={15} className="text-gold" />} label={b.type === "flight" ? "Departs" : "Check-in"} value={fmt(b.checkIn)} />}
        {b.checkOut && <Row icon={<CalendarDays size={15} className="text-gold" />} label="Check-out" value={fmt(b.checkOut)} />}
        <Row icon={<MapPin size={15} className="text-gold" />} label="Reference" value={b.reference} mono />

        {documents.length > 0 && (
          <div className="border-t border-line pt-4">
            <p className="text-[11px] tracking-[0.16em] uppercase text-ink-faint mb-2">Documents</p>
            <ul className="space-y-1.5">
              {documents.map((d, i) => (
                <li key={i}>
                  <a href={d.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-gold link-underline">
                    <FileText size={14} /> {d.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-ink-faint mt-6">
        Shared with you by a fellow traveller · <Link href="/" className="text-gold link-underline">Voyages &amp; Co.</Link>
      </p>
    </div>
  );
}

function Row({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.12em] uppercase text-ink-faint">{icon} {label}</span>
      <span className={`text-sm text-ink text-right ${mono ? "font-mono tracking-wide" : ""}`}>{value}</span>
    </div>
  );
}
