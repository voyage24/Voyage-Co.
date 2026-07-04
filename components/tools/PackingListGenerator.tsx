"use client";

import { useMemo, useState } from "react";
import { Check, Luggage, Download } from "lucide-react";

type Climate = "hot" | "mild" | "cold" | "tropical";
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

// Builds a categorised packing list whose quantities scale with the trip
// length — clothing, toiletry sizing, sunscreen and medication all grow with
// the number of nights (with a gentle cap + laundry note on very long trips).
function buildList(nights: number, climate: Climate, acts: string[], intl: boolean) {
  const n = Math.max(1, nights);
  const tops = Math.min(n + 1, 21);
  const bottoms = Math.min(Math.ceil(n / 2) + 1, 12);
  const underwear = Math.min(n + 2, 21);
  const longTrip = n > 10;
  const laundry = longTrip ? " — or pack ~1 week's worth & do laundry" : "";
  const size = n <= 4 ? "travel-size" : n <= 10 ? "medium bottles" : "full-size";
  const sunscreen = n > 7 ? "High-SPF sunscreen (large / 2 tubes)" : "High-SPF sunscreen";

  const cats: { title: string; items: string[] }[] = [
    { title: "Documents & money", items: [
      "Photo ID", intl ? "Passport (valid 6+ months)" : "", intl ? "Visa / entry permit" : "",
      "Travel insurance papers", "Booking confirmations & vouchers", "Debit / credit cards", "Some local currency",
    ].filter(Boolean) },
    { title: "Clothing", items: [
      `${tops} tops / t-shirts${laundry}`,
      `${bottoms} trousers / shorts`,
      `${underwear} sets underwear & socks`,
      "1–2 light layers / jacket",
      climate === "cold" ? "Warm coat, thermals, gloves & hat" : "",
      climate === "hot" ? "Sun hat & sunglasses" : "",
      "Comfortable walking shoes", "Sleepwear",
      longTrip ? "A couple of reusable laundry bags" : "",
    ].filter(Boolean) },
    { title: "Toiletries", items: [
      `Toothbrush & toothpaste (${size})`,
      "Deodorant",
      `Shampoo, conditioner & soap (${size})`,
      "Skincare & moisturiser",
      climate === "hot" || climate === "tropical" ? sunscreen : "SPF moisturiser",
      "Razor / grooming kit",
      longTrip ? "Nail clippers, cotton buds & spares" : "",
    ].filter(Boolean) },
    { title: "Health", items: [
      `Personal medication (${n + 3} days' supply)`,
      "Basic first-aid (plasters, painkillers)",
      climate === "tropical" ? "Insect repellent & anti-itch" : "",
      "Hand sanitiser",
      n > 3 ? "Vitamins / daily supplements" : "",
      "Rehydration sachets",
      intl && n > 7 ? "Copy of prescriptions & doctor's note" : "",
    ].filter(Boolean) },
    { title: "Tech", items: [
      "Phone & charger", intl ? "Universal travel adapter" : "", "Power bank", "Earphones",
      longTrip ? "Multi-port charger / spare cables" : "", "E-reader / camera (optional)",
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
  // Empty by default (no assumed length) and no upper limit.
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
  const checked = list.reduce((s, c) => s + c.items.filter(i => done.has(`${c.title}:${i}`)).length, 0);

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
        doc.setFont("helvetica", "normal"); doc.setFontSize(10.5); doc.setTextColor(33, 29, 24);
        for (const item of cat.items) {
          if (y > 285) { doc.addPage(); y = 20; }
          doc.setDrawColor(150, 150, 150);
          doc.rect(M, y - 3.1, 3.4, 3.4);
          const lines = doc.splitTextToSize(item, W - M * 2 - 8);
          doc.text(lines, M + 6, y);
          y += Math.max(1, lines.length) * 5 + 1.4;
        }
        y += 4.5;
      }

      doc.setTextColor(150, 150, 150); doc.setFontSize(8);
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
          </>
        )}
      </div>
    </div>
  );
}
