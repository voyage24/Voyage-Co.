import Link from "next/link";
import Image from "next/image";
import { MapPin, FileText, Wallet, BookOpen, MessageCircle, Siren } from "lucide-react";

export type TodayTrip = {
  reference: string; itemTitle: string; type: string; image: string | null;
  checkIn: string | null; checkOut: string | null; status: string;
};

function daysBetween(a: Date, b: Date) { return Math.round((b.getTime() - a.getTime()) / 86400000); }

// The "Today" card: highlights the trip in progress (or the next one up) with a
// live day counter and the actions a traveller reaches for mid-trip.
export default function TripToday({ trip, whatsapp }: { trip: TodayTrip; whatsapp: string }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const start = trip.checkIn ? new Date(trip.checkIn) : null;
  const end = trip.checkOut ? new Date(trip.checkOut) : null;

  let heading = "Your next trip";
  let sub = "";
  let onTrip = false;
  if (start && end && today >= start && today <= end) {
    const day = daysBetween(start, today) + 1;
    const total = daysBetween(start, end) + 1;
    heading = "You're on your trip";
    sub = `Day ${day} of ${total}`;
    onTrip = true;
  } else if (start) {
    const away = daysBetween(today, start);
    sub = away === 0 ? "Starts today" : away === 1 ? "Starts tomorrow" : `In ${away} days`;
  }

  return (
    <div className="rounded-2xl overflow-hidden border border-line shadow-card mb-10">
      <div className="relative h-28 bg-vc-950">
        {trip.image && <Image src={trip.image} alt={trip.itemTitle} fill className="object-cover opacity-60" sizes="100vw" />}
        <div className="absolute inset-0 bg-gradient-to-t from-vc-950/90 to-transparent" />
        <div className="absolute bottom-3 left-5 right-5 text-[#f4f0e9]">
          <p className="text-[10px] tracking-[0.28em] uppercase text-gold">{heading}{sub && ` · ${sub}`}</p>
          <p className="font-serif text-xl font-light truncate">{trip.itemTitle}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 px-5 py-3 bg-panel">
        <Link href={`/account/journey/${trip.reference}`} className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-gold hover:text-ink transition-colors"><BookOpen size={14} /> Journal</Link>
        <Link href={`/account/voucher/${trip.reference}`} className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors"><FileText size={14} /> Voucher</Link>
        <Link href={`/account/pass/${trip.reference}`} className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors"><Wallet size={14} /> Pass</Link>
        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trip.itemTitle)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors"><MapPin size={14} /> Map</a>
        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink transition-colors ml-auto"><MessageCircle size={14} /> Concierge</a>
        {onTrip && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(`🚨 EMERGENCY — I need urgent help during my trip (${trip.itemTitle}).`)}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-red-600 hover:text-red-700 transition-colors"
          >
            <Siren size={14} /> SOS
          </a>
        )}
      </div>
    </div>
  );
}
