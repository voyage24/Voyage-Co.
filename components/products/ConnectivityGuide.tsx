import { Plug, Zap, Signal } from "lucide-react";
import { getConnectivity } from "@/lib/connectivity";

// Power (plug types + voltage) and mobile-connectivity note for the destination.
// Hides for countries we lack data for.
export default function ConnectivityGuide({ country }: { country?: string | null }) {
  const c = getConnectivity(country);
  if (!c) return null;

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center gap-2 mb-3">
        <Plug size={16} className="text-gold" />
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint">Power &amp; connectivity</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {c.plugs.map(p => (
          <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-panel px-2.5 py-1 text-xs text-ink">
            <span className="font-mono font-medium text-gold">{p}</span>
            <span className="text-ink-faint">plug</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-ink-muted">
        <Zap size={13} className="text-gold shrink-0" />
        <span><span className="text-ink font-medium">{c.voltage}</span> · {c.frequency}
          {c.converter && <span className="text-amber-600"> · bring a voltage converter for high-wattage devices</span>}
        </span>
      </div>

      <div className="flex gap-2 text-xs text-ink-muted mt-2">
        <Signal size={13} className="text-gold shrink-0 mt-0.5" />
        <span>{c.sim}</span>
      </div>
    </div>
  );
}
