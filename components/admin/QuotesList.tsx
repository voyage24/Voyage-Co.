"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Check } from "lucide-react";

type Quote = { id: string; token: string; title: string; customerName: string; total: number; status: string; createdAt: string | Date };

const STYLE: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600", sent: "bg-blue-50 text-blue-700",
  accepted: "bg-emerald-50 text-emerald-700", declined: "bg-red-50 text-red-600",
};

export default function QuotesList({ quotes }: { quotes: Quote[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (token: string) => {
    navigator.clipboard.writeText(`https://voyagesco.com/quote/${token}`).then(() => {
      setCopied(token); setTimeout(() => setCopied(null), 1500);
    });
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this quote?")) return;
    await fetch(`/api/admin/quotes/${id}`, { method: "DELETE" });
    router.refresh();
  };

  if (quotes.length === 0) return <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">No quotes yet.</p>;

  return (
    <div className="space-y-2">
      {quotes.map(q => (
        <div key={q.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 border border-gray-200 rounded-lg bg-white px-4 py-3">
          <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded capitalize ${STYLE[q.status] ?? STYLE.draft}`}>{q.status}</span>
          <span className="text-sm font-medium text-gray-900">{q.title}</span>
          <span className="text-xs text-gray-400">{q.customerName} · ₹{q.total.toLocaleString("en-IN")}</span>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => copy(q.token)} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900">
              {copied === q.token ? <Check size={13} /> : <Copy size={13} />} {copied === q.token ? "Copied" : "Copy link"}
            </button>
            <Link href={`/admin/quotes/${q.id}`} className="text-xs text-gray-600 hover:text-gray-900">Edit</Link>
            <button onClick={() => remove(q.id)} className="text-xs text-red-600 hover:text-red-700">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}
