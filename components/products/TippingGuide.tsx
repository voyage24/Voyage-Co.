import { Coins, UtensilsCrossed, BedDouble, Car } from "lucide-react";
import { getTippingGuide } from "@/lib/tipping";

// Tipping norms + a few cultural etiquette notes for the destination. Collapsible
// (native <details>, no JS) so it stays tidy. Hides for countries we lack data for.
export default function TippingGuide({ country }: { country?: string | null }) {
  const g = getTippingGuide(country);
  if (!g) return null;

  return (
    <details className="group rounded-2xl border border-line bg-panel-soft p-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex items-center gap-2 cursor-pointer list-none">
        <Coins size={16} className="text-gold" />
        <span className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Tipping &amp; etiquette</span>
        <span className="disclose-open ml-auto text-[11px] text-gold uppercase tracking-[0.14em]">Open</span>
        <span className="disclose-hide ml-auto text-[11px] text-gold uppercase tracking-[0.14em]">Hide</span>
      </summary>

      <p className="mt-3 text-sm text-ink font-medium">{g.level}</p>
      <div className="mt-3 space-y-2.5 text-xs text-ink-muted">
        <Row icon={<UtensilsCrossed size={13} className="text-gold" />} label="Restaurants" value={g.restaurants} />
        <Row icon={<BedDouble size={13} className="text-gold" />} label="Hotels" value={g.hotels} />
        <Row icon={<Car size={13} className="text-gold" />} label="Taxis" value={g.taxis} />
      </div>

      <div className="mt-4 pt-4 border-t border-line">
        <p className="text-[11px] tracking-[0.16em] uppercase text-ink-faint mb-2">Good to know</p>
        <ul className="space-y-1.5">
          {g.etiquette.map((e, i) => (
            <li key={i} className="text-xs text-ink-muted flex gap-2">
              <span className="text-gold mt-0.5">·</span>
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <p><span className="text-ink font-medium">{label}:</span> {value}</p>
    </div>
  );
}
