"use client";

import { useEffect, useState } from "react";
import { Users, Trash2, Plus, X } from "lucide-react";
import { haptic } from "@/lib/haptics";

type Traveller = { id: string; fullName: string; dob: string | null; nationality: string | null; sex: string | null };
const EMPTY = { fullName: "", nationality: "", dob: "" };

// Traveller profiles — who's travelling (name, nationality, DOB) — used to
// autofill bookings. Passport COPIES live in the Document Vault; there's no
// longer a passport field here, so a passport is only ever saved in one place.
export default function TravellersManager() {
  const [list, setList] = useState<Traveller[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = () => fetch("/api/account/travellers").then(r => r.json()).then(d => setList(d.travellers || [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  const save = async () => {
    if (!form.fullName.trim()) { setError("Name is required."); return; }
    setBusy(true); setError("");
    const res = await fetch("/api/account/travellers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(d.error || "Could not save."); return; }
    haptic("success");
    setForm({ ...EMPTY }); setAdding(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this traveller?")) return;
    await fetch(`/api/account/travellers/${id}`, { method: "DELETE" });
    load();
  };

  const inputCls = "w-full px-3 py-2.5 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-ink transition-colors";

  return (
    <div className="bg-panel border border-line rounded-2xl p-6 mt-6">
      <div className="flex items-center gap-2 mb-1">
        <Users size={16} className="text-gold" />
        <h2 className="font-serif text-xl font-light text-ink">Traveller details</h2>
      </div>
      <p className="text-sm text-ink-muted font-light mb-5">
        Save who&apos;s travelling to autofill bookings faster. To store a copy of a passport, use the Document Vault below.
      </p>

      {list.length > 0 && (
        <ul className="mb-5 divide-y divide-line border-y border-line">
          {list.map(t => (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{t.fullName}</p>
                <p className="text-xs text-ink-faint flex items-center gap-1.5 flex-wrap">
                  {t.nationality && <span>{t.nationality}</span>}
                  {t.nationality && t.dob && <span>·</span>}
                  {t.dob && <span>{t.dob}</span>}
                </p>
              </div>
              <button onClick={() => remove(t.id)} aria-label="Remove traveller" className="text-ink-faint hover:text-red-600 transition-colors shrink-0"><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}

      {!adding ? (
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
          <Plus size={14} /> Add a traveller
        </button>
      ) : (
        <div className="border border-line rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-ink-faint">Enter the name exactly as shown on the passport.</p>
            <button onClick={() => { setAdding(false); setForm({ ...EMPTY }); setError(""); }} aria-label="Cancel" className="text-ink-faint hover:text-ink"><X size={16} /></button>
          </div>
          <input value={form.fullName} onChange={set("fullName")} placeholder="Full name (as on passport)" className={inputCls} />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.nationality} onChange={set("nationality")} placeholder="Nationality" className={inputCls} />
            <input value={form.dob} onChange={set("dob")} placeholder="Date of birth" className={inputCls} />
          </div>
          {error && <p className="text-sm text-red-600 font-light">{error}</p>}
          <button onClick={save} disabled={busy} className="w-full py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50 transition-colors">
            {busy ? "Saving…" : "Save traveller"}
          </button>
        </div>
      )}
    </div>
  );
}
