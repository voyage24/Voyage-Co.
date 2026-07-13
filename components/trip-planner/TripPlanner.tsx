"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles, Plane, Utensils, Landmark, MapPinned, CloudSun, Coins, TramFront,
  Loader2, Calendar, Check, ArrowRight, Star, Plus, Send, Sun,
} from "lucide-react";
import Price from "@/components/ui/Price";
import { toggleItinerary } from "@/lib/itinerary-draft";
import type { TripPlan } from "@/lib/trip-planner";

const EXAMPLES = [
  "Paris for 5 days in September",
  "Dubai for a long weekend",
  "Bali honeymoon, 7 days in June",
  "Tokyo for 6 days in April",
];

type OkPlan = Extract<TripPlan, { ok: true }>;

export default function TripPlanner() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [saveMsg, setSaveMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const run = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setPrompt(q); setLoading(true); setPlan(null); setSaveMsg("");
    try {
      const res = await fetch("/api/trip-planner", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      });
      setPlan(await res.json());
    } catch {
      setPlan({ ok: false, error: "Something went wrong. Please try again.", suggestions: [] });
    } finally {
      setLoading(false);
    }
  };

  const add = (type: string, id: string, title: string, image: string, href: string, price: number) => {
    toggleItinerary({ type, id, title, image, href, price });
    setAdded(a => ({ ...a, [`${type}:${id}`]: !a[`${type}:${id}`] }));
  };

  const savePlan = async (p: OkPlan) => {
    if (saving) return;
    setSaving(true); setSaveMsg("");
    const items = [
      ...p.hotels.map(h => ({ type: "hotel", id: h.id, title: h.name, image: h.image, href: h.href, price: h.pricePerNight })),
      ...p.experiences.map(e => ({ type: "experience", id: e.id, title: e.title, image: e.image, href: e.href, price: e.price })),
    ];
    const title = `${p.city || p.country} · ${p.days} days${p.month ? ` · ${p.month}` : ""}`;
    const notes = `Smart itinerary for "${p.query}".\n\n` + p.itinerary.map(d => `Day ${d.day} — ${d.title}\n· ${d.morning}\n· ${d.afternoon}\n· ${d.evening}`).join("\n\n");
    const res = await fetch("/api/account/itineraries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, notes, items }),
    });
    setSaving(false);
    if (res.status === 401) { router.push("/login"); return; }
    setSaveMsg(res.ok ? "Saved to your account — find it under Trip planner in your itineraries." : "Couldn't save just now.");
  };

  return (
    <div>
      {/* Prompt */}
      <form onSubmit={e => { e.preventDefault(); run(prompt); }} className="relative">
        <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gold pointer-events-none" />
        <input
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="e.g. Paris for 5 days in September"
          className="w-full pl-12 pr-32 py-4 rounded-full bg-panel border border-line-strong text-ink text-base focus:outline-none focus:border-gold transition-colors shadow-card"
        />
        <button
          type="submit" disabled={loading || prompt.trim().length < 2}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-ink text-page text-xs tracking-[0.14em] uppercase hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          <span className="hidden sm:inline">{loading ? "Planning" : "Plan it"}</span>
        </button>
      </form>

      {!plan && !loading && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {EXAMPLES.map(x => (
            <button key={x} onClick={() => run(x)} className="text-xs text-ink-muted border border-line rounded-full px-3.5 py-1.5 hover:border-gold hover:text-ink transition-colors">
              {x}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="mt-10 flex flex-col items-center text-center gap-3 py-16">
          <Loader2 size={26} className="animate-spin text-gold" />
          <p className="text-ink-muted font-light">Designing your itinerary…</p>
        </div>
      )}

      {plan && !plan.ok && (
        <div className="mt-10 rounded-2xl border border-line bg-panel-soft p-8 text-center">
          <p className="text-ink font-light mb-4">{plan.error}</p>
          {plan.suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {plan.suggestions.map(s => (
                <button key={s} onClick={() => run(`${s} for 5 days`)} className="text-xs text-ink-muted border border-line rounded-full px-3.5 py-1.5 hover:border-gold hover:text-ink transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {plan && plan.ok && <Result p={plan} add={add} added={added} savePlan={savePlan} saving={saving} saveMsg={saveMsg} />}
    </div>
  );
}

function Chip({ Icon, children }: { Icon: typeof Sun; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted bg-panel-soft border border-line rounded-full px-3 py-1.5">
      <Icon size={13} className="text-gold shrink-0" /> {children}
    </span>
  );
}

function Section({ title, Icon, children }: { title: string; Icon: typeof Sun; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="flex items-center gap-2 font-serif text-2xl font-light text-ink mb-4"><Icon size={20} className="text-gold" /> {title}</h2>
      {children}
    </section>
  );
}

function PickList({ items }: { items: { name: string; note?: string }[] }) {
  return (
    <ul className="grid sm:grid-cols-2 gap-2.5">
      {items.map((x, i) => (
        <li key={i} className="rounded-xl border border-line bg-panel px-4 py-3">
          <p className="text-sm font-medium text-ink">{x.name}</p>
          {x.note && <p className="text-xs text-ink-muted font-light mt-0.5">{x.note}</p>}
        </li>
      ))}
    </ul>
  );
}

function Result({ p, add, added, savePlan, saving, saveMsg }: {
  p: OkPlan;
  add: (type: string, id: string, title: string, image: string, href: string, price: number) => void;
  added: Record<string, boolean>;
  savePlan: (p: OkPlan) => void;
  saving: boolean;
  saveMsg: string;
}) {
  return (
    <div className="mt-10 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">Your itinerary</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">
          {p.city || p.country} · {p.days} days{p.month ? ` · ${p.month}` : ""}
        </h1>
        <p className="text-ink-muted font-light mt-3 max-w-2xl mx-auto">{p.overview}</p>
      </div>

      {/* Meta chips */}
      <div className="flex flex-wrap gap-2 justify-center">
        {p.season && <Chip Icon={CloudSun}>{p.isPeak ? "Peak season · " : ""}{p.season}</Chip>}
        {p.currency && <Chip Icon={Coins}>{p.currency.code} ({p.currency.symbol}) · {p.currency.name}</Chip>}
        {p.gettingAround && <Chip Icon={TramFront}>{p.gettingAround.transit}</Chip>}
        {p.airport && <Chip Icon={Plane}>{p.airport.name} ({p.airport.transfer})</Chip>}
      </div>

      {/* Cost estimate */}
      <div className="mt-8 rounded-2xl border border-line bg-gradient-to-br from-vc-950 to-[#2a1216] text-[#f4f0e9] p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] tracking-[0.28em] uppercase text-gold">Estimated cost · {p.travellers} {p.travellers === 1 ? "traveller" : "travellers"}</p>
          <p className="font-serif text-3xl font-light"><Price amount={p.cost.total} /></p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          {[
            { label: "Flights", v: p.cost.flights },
            { label: `Hotel · ${p.cost.nights} nights`, v: p.cost.hotel },
            { label: "On-ground daily", v: p.cost.daily },
            { label: "Experiences", v: p.cost.experiences },
          ].map(x => (
            <div key={x.label} className="rounded-xl bg-white/5 px-3 py-2.5">
              <p className="text-[11px] text-white/50">{x.label}</p>
              <p className="font-light text-white/90 mt-0.5">{x.v > 0 ? <Price amount={x.v} /> : "—"}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/45 mt-3">Indicative only — flights vary with live fares; on-ground is ~<Price amount={p.cost.perDaySpend} />/person/day.</p>
      </div>

      {/* Flights */}
      <Section title="Getting there" Icon={Plane}>
        <Link href={p.flightsHref} className="flex items-center justify-between rounded-2xl border border-line bg-panel p-5 hover:border-gold/40 transition-colors">
          <div>
            <p className="text-sm font-medium text-ink">Search live fares{p.airport ? ` to ${p.airport.code}` : ""}</p>
            <p className="text-xs text-ink-muted font-light mt-0.5">{p.airport ? `${p.airport.name} — your arrival gateway` : "Compare flights for your dates"}</p>
          </div>
          <ArrowRight size={18} className="text-gold shrink-0" />
        </Link>
      </Section>

      {/* Hotels */}
      {p.hotels.length > 0 && (
        <Section title="Where to stay" Icon={Star}>
          <div className="grid sm:grid-cols-2 gap-4">
            {p.hotels.map(h => {
              const key = `hotel:${h.id}`;
              return (
                <div key={h.id} className="rounded-2xl overflow-hidden border border-line bg-panel">
                  <Link href={h.href} className="block relative h-36 bg-vc-950">
                    {h.image && <Image src={h.image} alt={h.name} fill className="object-cover" sizes="(max-width:640px) 100vw, 50vw" />}
                  </Link>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={h.href} className="min-w-0"><p className="font-serif text-lg font-light text-ink truncate hover:text-gold transition-colors">{h.name}</p></Link>
                      <span className="shrink-0 inline-flex items-center gap-1 text-xs text-gold"><Star size={12} className="fill-gold" /> {h.rating.toFixed(1)}</span>
                    </div>
                    <p className="text-xs text-ink-faint mt-0.5">{h.city}</p>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-sm text-ink"><Price amount={h.pricePerNight} className="font-medium" /> <span className="text-ink-faint text-xs">/ night</span></p>
                      <button onClick={() => add("hotel", h.id, h.name, h.image, h.href, h.pricePerNight)} className={`inline-flex items-center gap-1 text-xs tracking-[0.1em] uppercase rounded-full px-3 py-1.5 border transition-colors ${added[key] ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-muted hover:border-gold hover:text-ink"}`}>
                        {added[key] ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add</>}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Day by day */}
      <Section title="Day by day" Icon={Calendar}>
        <div className="space-y-3">
          {p.itinerary.map(d => (
            <div key={d.day} className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="shrink-0 w-9 h-9 rounded-full bg-gold/15 text-gold font-serif text-lg flex items-center justify-center">{d.day}</span>
                <p className="font-serif text-lg font-light text-ink">{d.title}</p>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {[["Morning", d.morning], ["Afternoon", d.afternoon], ["Evening", d.evening]].map(([label, text]) => text ? (
                  <div key={label} className="rounded-xl bg-panel-soft border border-line/60 px-3.5 py-3">
                    <p className="text-[10px] tracking-[0.18em] uppercase text-gold mb-1">{label}</p>
                    <p className="text-sm text-ink-muted font-light leading-snug">{text}</p>
                  </div>
                ) : null)}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Experiences */}
      {p.experiences.length > 0 && (
        <Section title="Signature experiences" Icon={Sparkles}>
          <div className="grid sm:grid-cols-2 gap-4">
            {p.experiences.map(e => {
              const key = `experience:${e.id}`;
              return (
                <div key={e.id} className="flex gap-4 rounded-2xl border border-line bg-panel p-3">
                  <Link href={e.href} className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-vc-950">
                    {e.image && <Image src={e.image} alt={e.title} fill className="object-cover" sizes="96px" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={e.href}><p className="text-sm font-medium text-ink hover:text-gold transition-colors line-clamp-2">{e.title}</p></Link>
                    <p className="text-sm text-ink mt-1"><Price amount={e.price} className="font-medium" /></p>
                    <button onClick={() => add("experience", e.id, e.title, e.image, e.href, e.price)} className={`mt-2 inline-flex items-center gap-1 text-xs tracking-[0.1em] uppercase rounded-full px-3 py-1.5 border transition-colors ${added[key] ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-muted hover:border-gold hover:text-ink"}`}>
                      {added[key] ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add</>}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {p.restaurants.length > 0 && <Section title="Where to eat" Icon={Utensils}><PickList items={p.restaurants} /></Section>}
      {p.museums.length > 0 && <Section title="Museums & sights" Icon={Landmark}><PickList items={p.museums} /></Section>}
      {p.dayTrips.length > 0 && <Section title="Day trips" Icon={MapPinned}><PickList items={p.dayTrips} /></Section>}

      {p.tips.length > 0 && (
        <Section title="Good to know" Icon={CloudSun}>
          <ul className="space-y-2">
            {p.tips.map((t, i) => <li key={i} className="flex items-start gap-2 text-sm text-ink-muted font-light"><Check size={15} className="text-gold shrink-0 mt-0.5" /> {t}</li>)}
          </ul>
        </Section>
      )}

      {/* Actions */}
      <div className="mt-12 rounded-2xl border border-gold/30 bg-panel-soft p-6 text-center">
        <p className="font-serif text-xl font-light text-ink mb-1">Love this plan?</p>
        <p className="text-sm text-ink-muted font-light mb-5">Save it to your account, or have a concierge turn it into a booked, tailored journey.</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <button onClick={() => savePlan(p)} disabled={saving} className="inline-flex items-center gap-2 px-6 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors disabled:opacity-60">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Save to my trips
          </button>
          <Link href="/itinerary" className="inline-flex items-center gap-2 px-6 py-3 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">
            Review & request a quote <ArrowRight size={14} />
          </Link>
        </div>
        {saveMsg && <p className="text-sm text-gold mt-4">{saveMsg}</p>}
      </div>
    </div>
  );
}
