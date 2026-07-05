"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Save, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { ContentList, ListItem } from "@/lib/page-lists";

export default function ListEditor({ list, initialItems }: { list: ContentList; initialItems: ListItem[] }) {
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  const touched = () => setSaved(false);
  const setField = (i: number, key: string, value: string) => {
    setItems(prev => prev.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
    touched();
  };
  const addItem = () => {
    const blank: ListItem = {};
    for (const f of list.fields) blank[f.key] = "";
    // Carry the section/group of the last row so consecutive adds stay grouped.
    const last = items[items.length - 1];
    if (last && list.fields[0] && last[list.fields[0].key]) blank[list.fields[0].key] = last[list.fields[0].key];
    setItems(prev => [...prev, blank]);
    touched();
  };
  const removeItem = (i: number) => { setItems(prev => prev.filter((_, idx) => idx !== i)); touched(); };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    setItems(prev => { const next = [...prev]; [next[i], next[j]] = [next[j], next[i]]; return next; });
    touched();
  };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/page-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: list.key, items }),
      });
      if (res.ok) setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  const input = "w-full bg-white border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-indigo-400";
  const primaryField = list.fields[0]?.key;

  return (
    <div className="max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/admin/pages" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"><ArrowLeft size={15} /> All pages</Link>
        <a href={list.path} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900"><ExternalLink size={13} /> View page</a>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-gray-400">
                {item[primaryField] || `${list.itemLabel} ${i + 1}`}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0} className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30" aria-label="Move up"><ChevronUp size={15} /></button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1} className="p-1.5 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30" aria-label="Move down"><ChevronDown size={15} /></button>
                <button onClick={() => removeItem(i)} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Remove"><Trash2 size={15} /></button>
              </div>
            </div>
            <div className="space-y-3">
              {list.fields.map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
                  {f.type === "textarea"
                    ? <textarea rows={3} value={item[f.key] ?? ""} onChange={e => setField(i, f.key, e.target.value)} className={input} />
                    : <input value={item[f.key] ?? ""} onChange={e => setField(i, f.key, e.target.value)} className={input} />}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} className="inline-flex items-center gap-1.5 text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg px-4 py-2.5 hover:border-gray-400 hover:text-gray-900 w-full justify-center">
        <Plus size={15} /> Add {list.itemLabel}
      </button>

      <div className="flex items-center gap-3 pt-1">
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-md disabled:opacity-50 dark:bg-white/[0.12] transition-colors">
          <Save size={14} /> {busy ? "Saving…" : "Save changes"}
        </button>
        {saved && <span className="text-xs text-emerald-600">Saved · live now ✓</span>}
      </div>
    </div>
  );
}
