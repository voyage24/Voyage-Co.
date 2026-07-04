"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import type { ContentPage } from "@/lib/page-content";

export default function PageContentForm({ page, values }: { page: ContentPage; values: Record<string, string> }) {
  const [form, setForm] = useState<Record<string, string>>(values);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => { setForm(p => ({ ...p, [k]: v })); setSaved(false); };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/page-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400";

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/admin/pages" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={15} /> All pages</Link>
        <a href={page.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"><ExternalLink size={13} /> View page</a>
      </div>

      <div className="space-y-4">
        {page.fields.map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
            {f.type === "textarea"
              ? <textarea rows={3} value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className={input} />
              : <input value={form[f.key] ?? ""} onChange={e => set(f.key, e.target.value)} className={input} />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-md disabled:opacity-50 dark:bg-white/[0.12] transition-colors">
          <Save size={14} /> {busy ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-xs text-emerald-600">Saved · live now ✓</span>}
      </div>
    </div>
  );
}
