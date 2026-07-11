"use client";

import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { useContactDefaults } from "@/components/providers/useContactDefaults";

const SLOTS = ["Morning (9–12)", "Afternoon (12–4)", "Evening (4–8)"];

export default function CallbackForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", day: "", slot: SLOTS[0], note: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const { defaults, remember } = useContactDefaults();
  useEffect(() => { if (defaults) setForm(p => ({ ...p, name: p.name || defaults.name, email: p.email || defaults.email, phone: p.phone || defaults.phone })); }, [defaults]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(""); setLoading(true);
    const res = await fetch("/api/callback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, turnstileToken: token }) });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) { remember({ name: form.name, email: form.email, phone: form.phone }); setDone(true); }
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
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Name <span className="text-gold">*</span></label>
          <input required className={field} autoComplete="name" value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Phone <span className="text-gold">*</span></label>
          <input required className={field} autoComplete="tel" value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Email <span className="text-gold">*</span></label>
          <input required type="email" className={field} autoComplete="email" value={form.email} onChange={e => set("email", e.target.value)} />
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
      <TurnstileWidget onToken={setToken} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading || !token} className="w-full sm:w-auto px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50 transition-colors">
        {loading ? "Sending…" : "Request callback"}
      </button>
    </form>
  );
}
