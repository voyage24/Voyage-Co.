"use client";

import { useMemo, useState } from "react";
import { Check, Luggage } from "lucide-react";

type Climate = "hot" | "mild" | "cold" | "tropical";
const CLIMATES: { key: Climate; label: string }[] = [
  { key: "hot", label: "Hot / Desert" },
  { key: "mild", label: "Mild / Temperate" },
  { key: "cold", label: "Cold / Winter" },
  { key: "tropical", label: "Tropical / Rainy" },
];
const ACTIVITIES = ["Beach & pool", "City & sightseeing", "Adventure & hiking", "Business", "Fine dining", "Wildlife / safari"];

// Builds a categorised packing list from trip length, climate and activities.
function buildList(nights: number, climate: Climate, acts: string[], intl: boolean) {
  const n = Math.max(1, nights || 1);
  const tops = Math.min(n + 1, 12);
  const bottoms = Math.min(Math.ceil(n / 2) + 1, 7);

  const cats: { title: string; items: string[] }[] = [
    { title: "Documents & money", items: [
      "Photo ID", intl ? "Passport (valid 6+ months)" : "", intl ? "Visa / entry permit" : "",
      "Travel insurance papers", "Booking confirmations & vouchers", "Debit / credit cards", "Some local currency",
    ].filter(Boolean) },
    { title: "Clothing", items: [
      `${tops} tops / t-shirts`, `${bottoms} trousers / shorts`, `${Math.min(n + 2, 14)} sets underwear & socks`,
      "1 light jacket / layer", climate === "cold" ? "Warm coat, thermals, gloves & hat" : "",
      climate === "hot" ? "Sun hat & sunglasses" : "", "Comfortable walking shoes", "Sleepwear",
    ].filter(Boolean) },
    { title: "Toiletries", items: [
      "Toothbrush & toothpaste", "Deodorant", "Shampoo & soap (travel size)", "Skincare & moisturiser",
      climate === "hot" || climate === "tropical" ? "High-SPF sunscreen" : "SPF moisturiser", "Razor / grooming kit",
    ] },
    { title: "Health", items: [
      "Personal medication", "Basic first-aid (plasters, painkillers)",
      climate === "tropical" ? "Insect repellent & anti-itch" : "", "Hand sanitiser", "Rehydration sachets",
    ].filter(Boolean) },
    { title: "Tech", items: [
      "Phone & charger", intl ? "Universal travel adapter" : "", "Power bank", "Earphones", "E-reader / camera (optional)",
    ].filter(Boolean) },
  ];

  const extra: string[] = [];
  if (acts.includes("Beach & pool")) extra.push("Swimwear", "Flip-flops", "Quick-dry towel");
  if (acts.includes("Adventure & hiking")) extra.push("Hiking boots", "Daypack", "Reusable water bottle", "Rain shell");
  if (acts.includes("Business")) extra.push("Formal outfit / suit", "Laptop & charger", "Business cards");
  if (acts.includes("Fine dining")) extra.push("Smart-casual evening outfit", "Dress shoes");
  if (acts.includes("Wildlife / safari")) extra.push("Neutral-colour clothing", "Binoculars", "Wide-brim hat");
  if (climate === "tropical" || acts.includes("City & sightseeing")) extra.push("Compact umbrella");
  if (extra.length) cats.push({ title: "For your activities", items: Array.from(new Set(extra)) });

  return cats;
}

export default function PackingListGenerator() {
  const [nights, setNights] = useState(5);
  const [climate, setClimate] = useState<Climate>("mild");
  const [acts, setActs] = useState<string[]>(["City & sightseeing"]);
  const [intl, setIntl] = useState(true);
  const [done, setDone] = useState<Set<string>>(new Set());

  const list = useMemo(() => buildList(nights, climate, acts, intl), [nights, climate, acts, intl]);
  const total = list.reduce((s, c) => s + c.items.length, 0);
  const checked = list.reduce((s, c) => s + c.items.filter(i => done.has(`${c.title}:${i}`)).length, 0);

  const toggleAct = (a: string) => setActs(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  const toggleItem = (k: string) => setDone(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Controls */}
      <div className="lg:col-span-2 space-y-5 print:hidden">
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-2">Nights away</label>
          <input type="number" min={1} value={nights} onChange={e => setNights(parseInt(e.target.value) || 1)}
            className="w-full bg-panel-raised border border-line px-4 py-3 text-ink focus:outline-none focus:border-gold" />
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-2">Climate</label>
          <div className="grid grid-cols-2 gap-2">
            {CLIMATES.map(c => (
              <button key={c.key} onClick={() => setClimate(c.key)}
                className={`px-3 py-2.5 text-xs border transition-colors ${climate === c.key ? "bg-ink text-page border-ink" : "border-line text-ink-muted hover:border-ink"}`}>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-[10px] tracking-[0.2em] uppercase text-ink-faint mb-2">Activities</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITIES.map(a => (
              <button key={a} onClick={() => toggleAct(a)}
                className={`px-3 py-2 text-xs border transition-colors ${acts.includes(a) ? "bg-gold/15 text-ink border-gold" : "border-line text-ink-muted hover:border-ink"}`}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2.5 text-sm text-ink-muted cursor-pointer">
          <input type="checkbox" checked={intl} onChange={e => setIntl(e.target.checked)} /> International trip
        </label>
      </div>

      {/* List */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-ink-muted flex items-center gap-2"><Luggage size={16} className="text-gold" /> {checked}/{total} packed</p>
          <button onClick={() => window.print()} className="text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink print:hidden">Print list</button>
        </div>
        <div className="space-y-6">
          {list.map(cat => (
            <div key={cat.title}>
              <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-2">{cat.title}</p>
              <ul className="space-y-1">
                {cat.items.map(item => {
                  const k = `${cat.title}:${item}`;
                  const on = done.has(k);
                  return (
                    <li key={k}>
                      <button onClick={() => toggleItem(k)} className="flex items-center gap-3 w-full text-left py-1 group">
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
    </div>
  );
}
