"use client";

import { useMemo, useState } from "react";
import { Check, Luggage, Download } from "lucide-react";

type Climate = "hot" | "mild" | "cold" | "tropical";
type Item = { label: string; qty?: number };
type Cat = { title: string; items: Item[] };

const CLIMATES: { key: Climate; label: string }[] = [
  { key: "hot", label: "Hot / Desert" },
  { key: "mild", label: "Mild / Temperate" },
  { key: "cold", label: "Cold / Winter" },
  { key: "tropical", label: "Tropical / Rainy" },
];
const ACTIVITIES = ["Beach & pool", "City & sightseeing", "Adventure & hiking", "Business", "Fine dining", "Wildlife / safari"];
const PRESETS: { n: number; label: string }[] = [
  { n: 2, label: "Weekend" },
  { n: 7, label: "1 week" },
  { n: 14, label: "2 weeks" },
  { n: 30, label: "1 month" },
];

// A categorised packing list whose quantities scale with the trip length.
// Clothing carries an explicit count (shown next to each item).
function buildList(nights: number, climate: Climate, acts: string[], intl: boolean): Cat[] {
  const n = Math.max(1, nights);
  const tops = Math.min(n + 1, 21);
  const bottoms = Math.min(Math.ceil(n / 2) + 1, 12);
  const underwear = Math.min(n + 2, 21);
  const longTrip = n > 10;
  const laundry = longTrip ? " — or pack ~1 week's worth & do laundry" : "";
  const size = n <= 4 ? "travel-size" : n <= 10 ? "medium bottles" : "full-size";
  const sunscreen = n > 7 ? "High-SPF sunscreen (large / 2 tubes)" : "High-SPF sunscreen";
  const sleepwear = Math.min(Math.ceil(n / 6) + 1, 4);
  const sachets = Math.min(Math.max(2, Math.ceil(n / 2)), 20);

  const cats: Cat[] = [
    { title: "Documents & money", items: [
      { label: "Photo ID", qty: 1 },
      ...(intl ? [{ label: "Passport (valid 6+ months)", qty: 1 }, { label: "Visa / entry permit", qty: 1 }] : []),
      { label: "Travel insurance papers", qty: 1 },
      { label: "Booking confirmations & vouchers", qty: 1 },
      { label: "Debit / credit cards", qty: 2 },
      { label: "Some local currency" },
    ] },
    { title: "Clothing", items: [
      { label: `Tops / t-shirts${laundry}`, qty: tops },
      { label: "Trousers / shorts", qty: bottoms },
      { label: "Underwear & socks (sets)", qty: underwear },
      { label: "Light layers / jacket", qty: 2 },
      ...(climate === "cold" ? [{ label: "Warm coat", qty: 1 }, { label: "Thermals, gloves & hat" }] : []),
      ...(climate === "hot" ? [{ label: "Sun hat", qty: 1 }, { label: "Sunglasses", qty: 1 }] : []),
      { label: "Comfortable walking shoes", qty: 2 },
      { label: "Sleepwear", qty: sleepwear },
      ...(longTrip ? [{ label: "Reusable laundry bags", qty: 2 }] : []),
    ] },
    { title: "Toiletries", items: [
      { label: `Toothbrush & toothpaste (${size})`, qty: 1 },
      { label: "Deodorant", qty: 1 },
      { label: `Shampoo, conditioner & soap (${size})`, qty: 1 },
      { label: "Skincare & moisturiser", qty: 1 },
      { label: climate === "hot" || climate === "tropical" ? sunscreen : "SPF moisturiser", qty: 1 },
      { label: "Razor / grooming kit", qty: 1 },
      { label: "Quick-dry towel", qty: 1 },
      ...(longTrip ? [{ label: "Nail clippers, cotton buds & spares", qty: 1 }] : []),
    ] },
    { title: "Health", items: [
      { label: `Personal medication (${n + 3} days' supply)` },
      { label: "Reusable water bottle", qty: 1 },
      { label: "Basic first-aid kit (plasters, painkillers)", qty: 1 },
      ...(climate === "tropical" ? [{ label: "Insect repellent & anti-itch", qty: 1 }] : []),
      { label: "Hand sanitiser", qty: 1 },
      ...(n > 3 ? [{ label: "Vitamins / daily supplements", qty: 1 }] : []),
      { label: "Rehydration sachets", qty: sachets },
      ...(intl && n > 7 ? [{ label: "Copy of prescriptions & doctor's note", qty: 1 }] : []),
    ] },
    { title: "Tech", items: [
      { label: "Phone & charger", qty: 1 },
      ...(intl ? [{ label: "Universal travel adapter", qty: 2 }] : []),
      { label: "Power bank", qty: 1 },
      { label: "Charging cables", qty: 2 },
      { label: "Earphones", qty: 1 },
      ...(longTrip ? [{ label: "Multi-port charger / travel plug", qty: 1 }] : []),
      { label: "E-reader / camera (optional)", qty: 1 },
    ] },
  ];

  const extra: Item[] = [];
  const beachSwim = Math.min(Math.max(2, Math.ceil(n / 3)), 6);
  if (acts.includes("Beach & pool")) extra.push({ label: "Swimwear", qty: beachSwim }, { label: "Flip-flops", qty: 1 }, { label: "Beach towel", qty: 1 });
  if (acts.includes("Adventure & hiking")) extra.push({ label: "Hiking boots", qty: 1 }, { label: "Daypack", qty: 1 }, { label: "Rain shell", qty: 1 });
  if (acts.includes("Business")) extra.push({ label: "Formal outfit / suit", qty: Math.min(Math.max(1, Math.ceil(n / 3)), 5) }, { label: "Laptop & charger", qty: 1 }, { label: "Business cards" });
  if (acts.includes("Fine dining")) extra.push({ label: "Smart-casual evening outfit", qty: Math.min(Math.max(1, Math.ceil(n / 4)), 4) }, { label: "Dress shoes", qty: 1 });
  if (acts.includes("Wildlife / safari")) extra.push({ label: "Neutral-colour outfits", qty: 3 }, { label: "Binoculars", qty: 1 }, { label: "Wide-brim hat", qty: 1 });
  if (climate === "tropical" || acts.includes("City & sightseeing")) extra.push({ label: "Compact umbrella", qty: 1 });
  const uniqueExtra = extra.filter((it, i) => extra.findIndex(x => x.label === it.label) === i);
  if (uniqueExtra.length) cats.push({ title: "For your activities", items: uniqueExtra });

  return cats;
}

export default function PackingListGenerator() {
  const [nightsStr, setNightsStr] = useState("");
  const [climate, setClimate] = useState<Climate>("mild");
  const [acts, setActs] = useState<string[]>(["City & sightseeing"]);
  const [intl, setIntl] = useState(true);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const nights = Math.max(0, parseInt(nightsStr, 10) || 0);
  const hasNights = nights > 0;

  const list = useMemo(() => (hasNights ? buildList(nights, climate, acts, intl) : []), [nights, hasNights, climate, acts, intl]);
  const total = list.reduce((s, c) => s + c.items.length, 0);
  const checked = list.reduce((s, c) => s + c.items.filter(i => done.has(`${c.title}:${i.label}`)).length, 0);

  const toggleAct = (a: string) => setActs(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a]);
  const toggleItem = (k: string) => setDone(p => { const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n; });

  // Real PDF — window.print() silently no-ops in many mobile / in-app browsers.
  const downloadPdf = async () => {
    if (busy || !hasNights) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const W = 210, M = 16;

      doc.setFillColor(33, 29, 24);
      doc.rect(0, 0, W, 26, "F");
      doc.setTextColor(244, 240, 233);
      doc.setFont("times", "normal"); doc.setFontSize(20);
      doc.text("Voyages & Co.", M, 14);
      doc.setTextColor(201, 174, 119);
      doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("SMART PACKING LIST", M, 21, { charSpace: 1.2 });

      let y = 38;
      doc.setTextColor(60, 54, 46); doc.setFont("helvetica", "normal"); doc.setFontSize(11);
      doc.text(`${nights} night${nights > 1 ? "s" : ""}  ·  ${CLIMATES.find(c => c.key === climate)?.label}  ·  ${intl ? "International" : "Domestic"}`, M, y);
      y += 5.5;
      if (acts.length) {
        doc.setTextColor(140, 140, 140); doc.setFontSize(9);
        doc.text(doc.splitTextToSize(acts.join("  ·  "), W - M * 2), M, y);
        y += 8;
      } else y += 3;

      for (const cat of list) {
        if (y > 272) { doc.addPage(); y = 20; }
        doc.setTextColor(201, 174, 119); doc.setFont("helvetica", "bold"); doc.setFontSize(9);
        doc.text(cat.title.toUpperCase(), M, y, { charSpace: 1 });
        y += 6;
        doc.setFontSize(10.5);
        for (const item of cat.items) {
          if (y > 285) { doc.addPage(); y = 20; }
          doc.setDrawColor(150, 150, 150);
          doc.rect(M, y - 3.1, 3.4, 3.4);
          doc.setFont("helvetica", "normal"); doc.setTextColor(33, 29, 24);
          const lines = doc.splitTextToSize(item.label, W - M * 2 - 8 - (item.qty ? 12 : 0));
          doc.text(lines, M + 6, y);
          if (item.qty) {
            doc.setFont("helvetica", "bold"); doc.setTextColor(150, 120, 40);
            doc.text(`× ${item.qty}`, W - M, y, { align: "right" });
          }
          y += Math.max(1, lines.length) * 5 + 1.4;
        }
        y += 4.5;
      }

      doc.setTextColor(150, 150, 150); doc.setFont("helvetica", "normal"); doc.setFontSize(8);
      doc.text("Generated by Voyages & Co. · voyagesco.com", M, 290);
      doc.save(`packing-list-${nights}n.pdf`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Controls */}
      <div className="lg:col-span-2 space-y-5 print:hidden">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] tracking-[0.2em] uppercase text-ink-faint">Nights away</label>
            {hasNights && <span className="font-serif text-lg text-ink leading-none">{nights}<span className="text-xs text-ink-faint ml-1">{nights === 1 ? "night" : "nights"}</span></span>}
          </div>
          <div className="flex items-center gap-3">
            <input type="range" min={1} max={30} value={Math.min(nights || 1, 30)} onChange={e => setNightsStr(e.target.value)}
              className="flex-1 accent-gold" aria-label="Nights away slider" />
            <input type="number" min={1} inputMode="numeric" placeholder="—" value={nightsStr}
              onChange={e => setNightsStr(e.target.value.replace(/[^0-9]/g, ""))}
              className="w-16 bg-panel-raised border border-line px-2 py-2 text-base text-ink text-center placeholder:text-ink-faint focus:outline-none focus:border-gold" />
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {PRESETS.map(p => (
              <button key={p.n} onClick={() => setNightsStr(String(p.n))}
                className={`px-3 py-1.5 text-[11px] tracking-wide border transition-colors ${nights === p.n ? "bg-gold/15 text-ink border-gold" : "border-line text-ink-muted hover:border-ink"}`}>
                {p.label}
              </button>
            ))}
          </div>
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
        {!hasNights ? (
          <div className="border border-dashed border-line rounded-lg py-16 px-6 text-center">
            <Luggage size={26} className="text-gold mx-auto mb-3" />
            <p className="text-ink-muted font-light">Enter your nights away to generate a tailored list.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-ink-muted flex items-center gap-2"><Luggage size={16} className="text-gold" /> {checked}/{total} packed</p>
              <button onClick={downloadPdf} disabled={busy}
                className="inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase text-ink-muted hover:text-ink disabled:opacity-50 transition-colors print:hidden">
                <Download size={14} /> {busy ? "Preparing…" : "Download list"}
              </button>
            </div>
            <div className="space-y-6">
              {list.map(cat => (
                <div key={cat.title}>
                  <p className="text-[11px] tracking-[0.18em] uppercase text-gold mb-2">{cat.title}</p>
                  <ul className="space-y-1">
                    {cat.items.map(item => {
                      const k = `${cat.title}:${item.label}`;
                      const on = done.has(k);
                      return (
                        <li key={k}>
                          <button onClick={() => toggleItem(k)} className="flex items-center gap-3 w-full text-left py-1 group">
                            <span className={`w-4 h-4 border flex items-center justify-center shrink-0 ${on ? "bg-gold border-gold" : "border-line-strong group-hover:border-ink"}`}>
                              {on && <Check size={12} className="text-page" />}
                            </span>
                            <span className={`text-sm flex-1 min-w-0 ${on ? "text-ink-faint line-through" : "text-ink"}`}>{item.label}</span>
                            {item.qty !== undefined && (
                              <span className={`text-sm font-semibold shrink-0 tabular-nums ${on ? "text-ink-faint" : "text-gold"}`}>× {item.qty}</span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
