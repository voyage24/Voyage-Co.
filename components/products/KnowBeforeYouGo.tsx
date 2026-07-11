import { Compass, ChevronDown } from "lucide-react";

// Collapsible "Know before you go" wrapper for the destination reference cards
// (best time, currency, costs, tipping, connectivity, jet lag, holidays…), so
// the property page stays elegant while keeping the detail a tap away. Native
// <details> — no JS, and works with both server and client card children.
export default function KnowBeforeYouGo({ children }: { children: React.ReactNode }) {
  return (
    <details className="group mt-4 rounded-2xl border border-line bg-panel-soft/50 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center gap-3 cursor-pointer list-none px-5 py-4">
        <span className="w-9 h-9 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
          <Compass size={17} className="text-gold" />
        </span>
        <div className="min-w-0">
          <p className="font-serif text-lg font-light text-ink leading-tight">Know before you go</p>
          <p className="text-[11px] text-ink-faint mt-0.5">Best time · currency · costs · tipping · power · jet lag · holidays &amp; more</p>
        </div>
        <ChevronDown size={18} className="ml-auto shrink-0 text-ink-faint transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-5 pt-1">{children}</div>
    </details>
  );
}
