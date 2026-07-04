"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Route, Trash2 } from "lucide-react";
import { useItineraryDraft, removeItinerary, clearItineraryDraft } from "@/lib/itinerary-draft";
import { useContent } from "@/components/providers/ContentProvider";

type SavedItinerary = { id: string; title: string; estimate: number; status: string; items: { title: string }[] };

export default function ItineraryPage() {
  const c = useContent();
  const draft = useItineraryDraft();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [saved, setSaved] = useState<SavedItinerary[]>([]);

  const loadSaved = () => fetch("/api/account/itineraries").then(r => r.json()).then(d => setSaved(d.itineraries ?? [])).catch(() => {});
  useEffect(() => { loadSaved(); }, []);

  const estimate = draft.reduce((s, i) => s + (i.price || 0), 0);

  const save = async (requestQuote: boolean) => {
    if (busy || draft.length === 0) return;
    setBusy(true); setMsg("");
    const res = await fetch("/api/account/itineraries", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, notes, items: draft, requestQuote }),
    });
    setBusy(false);
    if (res.status === 401) { router.push("/login"); return; }
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      clearItineraryDraft(); setTitle(""); setNotes("");
      setMsg(requestQuote ? "Your itinerary has been sent — an advisor will send a tailored quote." : "Itinerary saved to your account.");
      loadSaved();
    } else setMsg(data.error ?? "Something went wrong.");
  };

  const removeSaved = async (id: string) => {
    setSaved(s => s.filter(x => x.id !== id));
    await fetch(`/api/account/itineraries/${id}`, { method: "DELETE" });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="mb-8">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">{c("itinerary.eyebrow") || "Trip builder"}</p>
        <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{c("itinerary.title") || "Your itinerary"}</h1>
        <p className="text-ink-muted font-light mt-2">{c("itinerary.intro") || "Bundle stays, journeys, cruises and experiences, then request a single tailored quote."}</p>
      </div>

      {msg && <p className="mb-6 text-sm text-gold bg-panel border border-line rounded-xl px-4 py-3">{msg}</p>}

      {draft.length === 0 ? (
        <div className="border border-dashed border-line rounded-2xl p-12 text-center">
          <Route size={22} className="text-gold mx-auto mb-3" />
          <p className="text-ink-muted font-light mb-4">Your itinerary is empty. Add items with the “Add to itinerary” button on any stay, journey, cruise or experience.</p>
          <Link href="/hotels" className="text-gold link-underline text-sm">Browse stays →</Link>
        </div>
      ) : (
        <div className="bg-panel border border-line rounded-2xl p-5 sm:p-6 space-y-4">
          {draft.map(item => (
            <div key={`${item.type}-${item.id}`} className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
                <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] tracking-[0.18em] uppercase text-ink-faint">{item.type}</p>
                <Link href={item.href} className="text-sm font-medium text-ink hover:text-gold line-clamp-1">{item.title}</Link>
              </div>
              {item.price ? <span className="text-sm text-ink-muted shrink-0">₹{item.price.toLocaleString("en-IN")}</span> : null}
              <button onClick={() => removeItinerary(item.type, item.id)} className="text-ink-faint hover:text-ink shrink-0" aria-label="Remove"><X size={16} /></button>
            </div>
          ))}

          <div className="border-t border-line pt-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted font-light">Estimated from</span>
              <span className="font-serif text-xl text-ink">₹{estimate.toLocaleString("en-IN")}</span>
            </div>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name this itinerary (e.g. Honeymoon — Italy & Maldives)"
              className="w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold" />
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Dates, party size, preferences…"
              className="w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold" />
            <div className="flex flex-wrap gap-3">
              <button onClick={() => save(true)} disabled={busy} className="px-6 py-3 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">
                {busy ? "Sending…" : "Request a quote"}
              </button>
              <button onClick={() => save(false)} disabled={busy} className="px-6 py-3 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all disabled:opacity-50">
                Save for later
              </button>
            </div>
          </div>
        </div>
      )}

      {saved.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-2xl font-light text-ink mb-4">Saved itineraries</h2>
          <div className="space-y-2">
            {saved.map(it => (
              <div key={it.id} className="flex items-center gap-3 bg-panel border border-line rounded-xl px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{it.title}</p>
                  <p className="text-xs text-ink-faint">{it.items?.length ?? 0} items · ~₹{it.estimate.toLocaleString("en-IN")}{it.status === "requested" ? " · quote requested" : ""}</p>
                </div>
                <button onClick={() => removeSaved(it.id)} className="text-ink-faint hover:text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
