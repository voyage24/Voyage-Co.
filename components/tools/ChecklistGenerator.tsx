"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";

function buildChecklist(intl: boolean, flying: boolean, driving: boolean) {
  return [
    { when: "6–8 weeks before", items: [
      intl ? "Check passport is valid 6+ months beyond travel" : "",
      intl ? "Apply for visa / entry permit if required" : "",
      intl ? "Check recommended vaccinations & health advice" : "",
      "Buy travel insurance", "Confirm all bookings (stay, transfers, tours)",
      "Note any special requests (diet, access, celebrations)",
    ].filter(Boolean) },
    { when: "2–3 weeks before", items: [
      "Arrange airport transfers / parking", "Order foreign currency", flying ? "Choose seats / add baggage" : "",
      driving ? "Check driving licence & International Driving Permit" : "",
      "Set up any medications / repeat prescriptions", "Tell your bank you're travelling",
    ].filter(Boolean) },
    { when: "1 week before", items: [
      "Print / download all confirmations & vouchers", "Save offline maps & itinerary",
      "Share itinerary with family / friend", "Check weather & finalise packing",
      "Charge devices & pack adapters / power bank",
    ] },
    { when: "Day before", items: [
      flying ? "Online check-in & download boarding passes" : "", "Pack essentials in carry-on (meds, docs, valuables)",
      "Confirm pickup / transfer time", "Set out-of-office & auto-replies", "Charge phone, watch & power bank",
    ].filter(Boolean) },
    { when: "Departure day", items: [
      "Passport, ID, cards & currency on you", "Home secured (lights, taps, heating, bins)",
      "Bins out / plants & pets arranged", "Leave with time to spare", "Bon voyage — safe travels!",
    ] },
  ];
}

export default function ChecklistGenerator() {
  const [intl, setIntl] = useState(true);
  const [flying, setFlying] = useState(true);
  const [driving, setDriving] = useState(false);
  const [done, setDone] = useState<Set<string>>(new Set());

  const groups = useMemo(() => buildChecklist(intl, flying, driving), [intl, flying, driving]);
  const total = groups.reduce((s, g) => s + g.items.length, 0);
  const checked = groups.reduce((s, g) => s + g.items.filter(i => done.has(`${g.when}:${i}`)).length, 0);
  const toggle = (k: string) => setDone(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  const Opt = ({ on, set, label }: { on: boolean; set: (v: boolean) => void; label: string }) => (
    <label className="flex items-center gap-2.5 text-sm text-ink-muted cursor-pointer">
      <input type="checkbox" checked={on} onChange={e => set(e.target.checked)} /> {label}
    </label>
  );

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mb-6 print:hidden">
        <Opt on={intl} set={setIntl} label="International trip" />
        <Opt on={flying} set={setFlying} label="Flying" />
        <Opt on={driving} set={setDriving} label="Driving abroad" />
        <button onClick={() => window.print()} className="ml-auto text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink">Print</button>
      </div>

      <p className="text-sm text-ink-muted mb-5">{checked}/{total} done</p>

      <div className="relative space-y-8">
        {groups.map(g => (
          <div key={g.when} className="relative pl-6 border-l-2 border-line">
            <span className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-gold" />
            <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-2">{g.when}</p>
            <ul className="space-y-1">
              {g.items.map(item => {
                const k = `${g.when}:${item}`;
                const on = done.has(k);
                return (
                  <li key={k}>
                    <button onClick={() => toggle(k)} className="flex items-center gap-3 w-full text-left py-1 group">
                      <span className={`w-4 h-4 border flex items-center justify-center shrink-0 ${on ? "bg-gold border-gold" : "border-line-strong group-hover:border-ink"}`}>
                        {on && <Check size={12} className="text-page" />}
                      </span>
                      <span className={`text-sm ${on ? "text-ink-faint line-through" : "text-ink"}`}>{item}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
