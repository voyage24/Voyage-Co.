"use client";

import { useEffect, useState } from "react";
import { Cake } from "lucide-react";

export default function OccasionsForm() {
  const [form, setForm] = useState({ birthday: "", anniversary: "" });
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/account/me").then(r => r.json()).then(d => {
      if (d.customer) setForm({ birthday: d.customer.birthday || "", anniversary: d.customer.anniversary || "" });
    }).catch(() => {});
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setSaved(false);
    const res = await fetch("/api/account/occasions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 2500); }
  };

  const field = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl font-light text-ink mb-1 flex items-center gap-2"><Cake size={18} className="text-gold" /> Special occasions</h2>
      <p className="text-sm text-ink-muted font-light mb-4">Tell us your dates and we&apos;ll mark them with a little something.</p>
      <form onSubmit={save} className="bg-panel border border-line rounded-xl p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Birthday</label>
          <input type="date" className={field} value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">Anniversary</label>
          <input type="date" className={field} value={form.anniversary} onChange={e => setForm(f => ({ ...f, anniversary: e.target.value }))} />
        </div>
        <button type="submit" disabled={busy} className="px-5 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">{busy ? "Saving…" : saved ? "Saved ✓" : "Save"}</button>
      </form>
    </section>
  );
}
