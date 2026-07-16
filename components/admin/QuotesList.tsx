"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check, Send } from "lucide-react";

type Quote = { id: string; token: string; title: string; customerName: string; customerEmail?: string; total: number; status: string; createdAt: string | Date };

const STYLE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", sent: "bg-blue-50 text-blue-700",
  accepted: "bg-emerald-50 text-emerald-700", declined: "bg-red-50 text-red-600",
};

export default function QuotesList({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  // Search by customer, email or title — isolates one client's quotes.
  const needle = query.trim().toLowerCase();
  const shown = quotes.filter(x =>
    !needle || [x.customerName, x.customerEmail, x.title].some(v => (v || "").toLowerCase().includes(needle)),
  );

  const copy = (token: string) => {
    navigator.clipboard.writeText(`https://voyagesco.com/quote/${token}`).then(() => {
      setCopied(token); setTimeout(() => setCopied(null), 1500);
    });
  };
  const send = async (id: string) => {
    if (!confirm("Email this quote to the customer?")) return;
    setSendingId(id);
    const res = await fetch(`/api/admin/quotes/${id}/send`, { method: "POST" });
    setSendingId(null);
    if (res.ok) { setSentId(id); setTimeout(() => setSentId(null), 2000); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); alert(d.error || "Could not send."); }
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this quote?")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    router.refresh();
  };

  if (quotes.length === 0) return <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">No quotes yet.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search customer, email or title…"
          className="flex-1 min-w-[240px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900"
        />
        {needle && (
          <>
            <span className="text-xs text-gray-500">{shown.length} match{shown.length === 1 ? "" : "es"}</span>
            <button onClick={() => setQuery("")} className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">Clear</button>
          </>
        )}
      </div>
      {shown.length === 0 && <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-6 text-center">No quotes match that search.</p>}
      <div className="space-y-2">
      {shown.map(q => (
        <div key={q.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-gray-200 rounded-lg bg-white px-4 py-3">
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded capitalize ${STYLE[q.status] ?? STYLE.draft}`}>{q.status}</span>
          <span className="text-sm font-medium text-gray-900">{q.title}</span>
          <span className="text-xs text-gray-400">{q.customerName} · ₹{q.total.toLocaleString("en-IN")}</span>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => send(q.id)} disabled={sendingId === q.id} className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50">
              {sentId === q.id ? <Check size={13} /> : <Send size={13} />} {sendingId === q.id ? "Sending…" : sentId === q.id ? "Sent" : "Send"}
            </button>
            <button onClick={() => copy(q.token)} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
              {copied === q.token ? <Check size={13} /> : <Copy size={13} />} {copied === q.token ? "Copied" : "Copy link"}
            </button>
            <Link href={`/admin/quotes/${q.id}`} className="text-xs text-gray-600 hover:text-gray-900">Edit</Link>
            <button onClick={() => remove(q.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
          </div>
        </div>
      ))}
      </div>
    </div>
  );
}
