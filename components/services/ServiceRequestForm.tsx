"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { useContactDefaults } from "@/components/providers/useContactDefaults";

export default function ServiceRequestForm({ services }: { services: string[] }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", service: services[0], date: "", details: "" });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const { defaults, remember } = useContactDefaults();
  useEffect(() => { if (defaults) setForm(p => ({ ...p, name: p.name || defaults.name, email: p.email || defaults.email, phone: p.phone || defaults.phone })); }, [defaults]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    const res = await fetch("/api/services-request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, turnstileToken: token }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { remember({ name: form.name, email: form.email, phone: form.phone }); setDone(true); } else setError(data.error ?? "Something went wrong.");
  };

  if (done) {
    return (
      <div id="request" className="bg-panel border border-line rounded-2xl p-8 text-center scroll-mt-28">
        <Check size={22} className="text-gold mx-auto mb-3" />
        <p className="font-serif text-xl text-ink mb-1">Request received.</p>
        <p className="text-ink-muted font-light">Our concierge will be in touch to arrange every detail.</p>
      </div>
    );
  }

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <form id="request" onSubmit={submit} className="bg-panel border border-line rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-28">
      <h2 className="font-serif text-2xl font-light text-ink">Request a service</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Name <span className="text-gold">*</span></label><input required className={field} autoComplete="name" value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Email <span className="text-gold">*</span></label><input required type="email" className={field} autoComplete="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
        <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Phone</label><input className={field} autoComplete="tel" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Service <span className="text-gold">*</span></label>
          <select className={field} value={form.service} onChange={e => set("service", e.target.value)}>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2"><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">When (optional)</label><input className={field} placeholder="Dates or occasion" value={form.date} onChange={e => set("date", e.target.value)} /></div>
      </div>
      <div><label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Details</label><textarea rows={3} className={field} value={form.details} onChange={e => set("details", e.target.value)} placeholder="Party size, preferences, anything we should know…" /></div>
      <TurnstileWidget onToken={setToken} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy || !token} className="w-full sm:w-auto px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">{busy ? "Sending…" : "Send request"}</button>
    </form>
  );
}
