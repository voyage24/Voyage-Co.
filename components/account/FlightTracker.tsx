import { Plane, DoorOpen, Building2, Clock, Luggage } from "lucide-react";

type Props = {
  status: string | null;
  gate: string | null;
  terminal: string | null;
  baggage: string | null;
  delayMin: number | null;
  updatedAt?: string | null;
};

const PHASE = {
  airborne: { label: "In the air", cls: "bg-sky-100 text-sky-700" },
  landed: { label: "Landed", cls: "bg-emerald-100 text-emerald-700" },
  delayed: { label: "Delayed", cls: "bg-amber-100 text-amber-700" },
  scheduled: { label: "Scheduled", cls: "bg-gray-100 text-gray-600" },
} as const;

// Live flight status strip: phase + gate/terminal/delay/baggage. Values populate
// from the flight-data provider (gate/terminal/baggage/delay) and the ADS-B
// position feed (airborne/landed). Renders nothing until there's something live.
export default function FlightTracker({ status, gate, terminal, baggage, delayMin, updatedAt }: Props) {
  const phase = (status && status in PHASE ? status : delayMin && delayMin >= 15 ? "delayed" : status) as keyof typeof PHASE | null;
  const chips = [
    gate && { icon: <DoorOpen size={14} className="text-gold" />, label: "Gate", value: gate },
    terminal && { icon: <Building2 size={14} className="text-gold" />, label: "Terminal", value: terminal },
    delayMin && delayMin >= 15 && { icon: <Clock size={14} className="text-amber-600" />, label: "Delay", value: `~${delayMin} min` },
    baggage && { icon: <Luggage size={14} className="text-gold" />, label: "Baggage", value: baggage },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  if (!phase && chips.length === 0) return null;
  const p = phase ? PHASE[phase] : null;

  return (
    <div className="rounded-2xl border border-line bg-panel-soft p-5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint inline-flex items-center gap-1.5"><Plane size={13} className="text-gold" /> Live flight status</p>
        {p && <span className={`text-[10px] tracking-[0.12em] uppercase px-2 py-0.5 rounded-full ${p.cls}`}>{p.label}</span>}
      </div>
      {chips.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {chips.map((c, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-0.5">{c.icon}</span>
              <div>
                <p className="text-sm font-medium text-ink leading-none">{c.value}</p>
                <p className="text-[11px] text-ink-faint mt-1">{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-ink-muted font-light">We&apos;ll alert you here about gate, delay, terminal and baggage as it updates.</p>
      )}
      {updatedAt && <p className="text-[10px] text-ink-faint mt-3">Updated {new Date(updatedAt).toLocaleString("en-GB")}</p>}
    </div>
  );
}
