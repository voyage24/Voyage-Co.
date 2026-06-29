"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";

type Card = { id: string; code: string; amount: number; balance: number; status: string; recipientName: string | null; createdAt: string | Date };

const STYLE: Record<string, string> = { active: "bg-emerald-50 text-emerald-700", redeemed: "bg-gray-100 text-gray-600", void: "bg-red-50 text-red-600" };

export default function GiftCardsManager({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ amount: 50000, recipientName: "", recipientEmail: "", senderName: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  const issue = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    const res = await fetch("/api/admin/giftcards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) { setForm({ amount: 50000, recipientName: "", recipientEmail: "", senderName: "", message: "" }); router.refresh(); }
    else alert("Could not issue card.");
  };
  const update = async (id: string, body: object) => { await fetch(`/api/admin/giftcards/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); router.refresh(); };
  const remove = async (id: string) => { if (!confirm("Delete this gift card?")) return; await fetch(`/api/admin/giftcards/${id}`, { method: "DELETE" }); router.refresh(); };
  const copy = (code: string) => navigator.clipboard.writeText(code).then(() => { setCopied(code); setTimeout(() => setCopied(null), 1500); });

  return (
    <div className="space-y-8">
      <form onSubmit={issue} className="bg-white border border-gray-200 rounded-lg p-5 max-w-xl space-y-3">
        <p className="text-sm font-medium text-gray-900">Issue a gift card</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Amount (₹)</label><input type="number" className={input} value={form.amount} onChange={e => set("amount", Number(e.target.value))} /></div>
          <div><label className="text-xs text-gray-500">Sender name</label><input className={input} value={form.senderName} onChange={e => set("senderName", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Recipient name</label><input className={input} value={form.recipientName} onChange={e => set("recipientName", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Recipient email</label><input className={input} value={form.recipientEmail} onChange={e => set("recipientEmail", e.target.value)} /></div>
        </div>
        <div><label className="text-xs text-gray-500">Message</label><input className={input} value={form.message} onChange={e => set("message", e.target.value)} /></div>
        <button disabled={busy} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Issuing…" : "Issue card"}</button>
      </form>

      <div className="space-y-2">
        {cards.length === 0 ? <p className="text-sm text-gray-400">No gift cards issued yet.</p> : cards.map(c => (
          <div key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-gray-200 rounded-lg bg-white px-4 py-3">
            <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded capitalize ${STYLE[c.status] ?? STYLE.active}`}>{c.status}</span>
            <button onClick={() => copy(c.code)} className="inline-flex items-center gap-1 text-sm font-mono text-gray-900 hover:text-gray-600">{c.code} {copied === c.code ? <Check size={12} /> : <Copy size={12} />}</button>
            <span className="text-xs text-gray-400">₹{c.balance.toLocaleString("en-IN")} / ₹{c.amount.toLocaleString("en-IN")}{c.recipientName ? ` · ${c.recipientName}` : ""}</span>
            <div className="ml-auto flex items-center gap-3 text-xs">
              {c.status !== "redeemed" && <button onClick={() => update(c.id, { status: "redeemed", balance: 0 })} className="text-gray-600 hover:text-gray-900">Mark redeemed</button>}
              {c.status !== "void" && <button onClick={() => update(c.id, { status: "void" })} className="text-gray-600 hover:text-gray-900">Void</button>}
              <button onClick={() => remove(c.id)} className="text-red-600 hover:text-red-700">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
