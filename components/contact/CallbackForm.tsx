"use client";

import { useState } from "react";
import { Phone } from "lucide-react";

const SLOTS = ["Morning (9–12)", "Afternoon (12–4)", "Evening (4–8)"];

export default function CallbackForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", day: "", slot: SLOTS[0], note: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(""); setLoading(true);
    const res = await fetch("/api/callback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) setDone(true);
    else setError(data.error ?? "Something went wrong.");
  };

  if (done) {
    return (
      <div className="bg-panel border border-line rounded-2xl p-8 text-center">
        <Phone size={22} className="text-gold mx-auto mb-3" />
        <p className="font-serif text-xl text-ink mb-1">We&apos;ll be in touch.</p>
        <p className="text-ink-muted font-light">A travel advisor will call you at your preferred time.</p>
      </div>
    );
  }

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={submit} className="bg-panel border border-line rounded-2xl p-6 sm:p-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Name *</label>
          <input required className={field} value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Phone *</label>
          <input required className={field} value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Email *</label>
          <input required type="email" className={field} value={form.email} onChange={e => set("email", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Preferred day</label>
          <input type="date" min={today} className={field} value={form.day} onChange={e => set("day", e.target.value)} />
        </div>
      </div>
      <div>
        <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Preferred time</label>
        <div className="flex flex-wrap gap-2">
          {SLOTS.map(s => (
            <button key={s} type="button" onClick={() => set("slot", s)}
              className={`text-xs px-4 py-2 rounded-sm border transition-colors ${form.slot === s ? "bg-ink text-page border-ink" : "border-line text-ink-muted hover:border-ink-strong"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Anything we should know? (optional)</label>
        <textarea rows={3} className={field} value={form.note} onChange={e => set("note", e.target.value)} placeholder="Destinations, dates, party size…" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="w-full sm:w-auto px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50 transition-colors">
        {loading ? "Sending…" : "Request callback"}
      </button>
    </form>
  );
}
