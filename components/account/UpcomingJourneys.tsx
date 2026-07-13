import Link from "next/link";
import { CalendarClock, ChevronDown, Plane, TrainFront, Ship, Sparkles, Package, BedDouble } from "lucide-react";

type Trip = { reference: string; title: string; type: string; checkIn: string | null; checkOut: string | null; status?: string };

const ICON: Record<string, typeof Plane> = { flight: Plane, train: TrainFront, cruise: Ship, experience: Sparkles, package: Package, hotel: BedDouble };

function counter(checkIn: string | null, checkOut: string | null): string {
  if (!checkIn || isNaN(Date.parse(checkIn))) return "";
  const start = new Date(checkIn); start.setHours(0, 0, 0, 0);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const days = Math.round((start.getTime() - now.getTime()) / 86_400_000);
  const end = checkOut && !isNaN(Date.parse(checkOut)) ? new Date(checkOut) : null;
  if (end) { end.setHours(0, 0, 0, 0); if (now >= start && now <= end) { const day = Math.round((now.getTime() - start.getTime()) / 86_400_000) + 1; const total = Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1; return `Day ${day} of ${total}`; } }
  if (days === 0) return "Today ✦";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

// A collapsible list of day-counters for every upcoming journey — flights,
// experiences, cruises, rail, packages and stays alike, not just the soonest.
export default function UpcomingJourneys({ trips }: { trips: Trip[] }) {
  if (trips.length === 0) return null;
  return (
    <details className="group mt-4 rounded-2xl border border-line bg-panel-soft/60 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center gap-3 cursor-pointer list-none px-5 py-4">
        <CalendarClock size={17} className="text-gold shrink-0" />
        <p className="text-sm font-medium text-ink">Upcoming journeys</p>
        <span className="text-[11px] text-ink-faint">{trips.length}</span>
        <ChevronDown size={18} className="ml-auto shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <ul className="px-3 pb-3 space-y-1.5">
        {trips.map(t => {
          const Icon = ICON[t.type] || CalendarClock;
          return (
            <li key={t.reference}>
              <Link href={`/account/pass/${t.reference}`} className="flex items-center gap-3 rounded-xl bg-panel border border-line px-4 py-3 hover:border-gold/40 transition-colors">
                <Icon size={16} className="text-gold shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-ink truncate">{t.title}</span>
                  <span className="block text-[11px] text-ink-faint capitalize">
                    {t.type}
                    {t.status === "pending" && <span className="ml-1.5 text-amber-600">· awaiting confirmation</span>}
                  </span>
                </span>
                <span className="text-xs font-medium text-gold shrink-0">{counter(t.checkIn, t.checkOut)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
