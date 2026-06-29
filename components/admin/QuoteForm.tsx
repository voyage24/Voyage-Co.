"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

type Line = { label: string; amount: number };
interface QuoteData {
  id?: string;
  customerName: string;
  customerEmail: string;
  title: string;
  lineItems: Line[];
  notes?: string | null;
  validUntil?: string | null;
  status?: string;
}

const BLANK: QuoteData = { customerName: "", customerEmail: "", title: "", lineItems: [{ label: "", amount: 0 }], notes: "", validUntil: "", status: "draft" };
const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const label = "block text-xs font-medium text-gray-600 mb-1";

export default function QuoteForm({ initial }: { initial?: QuoteData }) {
  const router = useRouter();
  const [form, setForm] = useState<QuoteData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;
  const set = <K extends keyof QuoteData>(k: K, v: QuoteData[K]) => setForm(p => ({ ...p, [k]: v }));

  const setLine = (i: number, k: keyof Line, v: string) => {
    const next = form.lineItems.map((l, idx) => idx === i ? { ...l, [k]: k === "amount" ? Number(v) || 0 : v } : l);
    set("lineItems", next);
  };
  const total = form.lineItems.reduce((s, l) => s + (Number(l.amount) || 0), 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/quotes/${initial!.id}` : "/api/admin/quotes";
    const res = await fetch(url, { method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) { router.push("/admin/quotes"); router.refresh(); }
    else alert("Failed to save. Check required fields.");
  };

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={label}>Customer name *</label><input required className={input} value={form.customerName} onChange={e => set("customerName", e.target.value)} /></div>
        <div><label className={label}>Customer email *</label><input required type="email" className={input} value={form.customerEmail} onChange={e => set("customerEmail", e.target.value)} /></div>
      </div>
      <div><label className={label}>Quote title *</label><input required className={input} placeholder="Honeymoon — Italy & Maldives" value={form.title} onChange={e => set("title", e.target.value)} /></div>

      <div>
        <label className={label}>Line items</label>
        <div className="space-y-2">
          {form.lineItems.map((l, i) => (
            <div key={i} className="flex items-center gap-2">
              <input className={`${input} flex-1`} placeholder="Description" value={l.label} onChange={e => setLine(i, "label", e.target.value)} />
              <input type="number" className={`${input} w-36`} placeholder="Amount" value={l.amount} onChange={e => setLine(i, "amount", e.target.value)} />
              <button type="button" onClick={() => set("lineItems", form.lineItems.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <button type="button" onClick={() => set("lineItems", [...form.lineItems, { label: "", amount: 0 }])} className="mt-2 inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900"><Plus size={15} /> Add line</button>
        <p className="mt-2 text-sm text-gray-900 font-medium">Total: ₹{total.toLocaleString("en-IN")}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><label className={label}>Valid until (optional)</label><input className={input} placeholder="30 Jul 2026" value={form.validUntil ?? ""} onChange={e => set("validUntil", e.target.value)} /></div>
        <div>
          <label className={label}>Status</label>
          <select className={input} value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="draft">Draft (hidden from customer)</option>
            <option value="sent">Sent (customer can view & accept)</option>
          </select>
        </div>
      </div>
      <div><label className={label}>Notes (optional)</label><textarea rows={3} className={input} value={form.notes ?? ""} onChange={e => set("notes", e.target.value)} placeholder="Inclusions, terms, payment schedule…" /></div>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save changes" : "Create quote"}
      </button>
    </form>
  );
}
