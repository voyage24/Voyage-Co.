"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, ChevronUp, ChevronDown, Plus, Save } from "lucide-react";
import ImageUploadField from "@/components/admin/ImageUploadField";
import type { CollectionDef } from "@/lib/collections";

type Item = { id: string; data: Record<string, string>; published: boolean; sortOrder: number };

const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

function blank(def: CollectionDef): Record<string, string> {
  const d: Record<string, string> = {};
  for (const f of def.fields) d[f.key] = "";
  return d;
}

function Fields({ def, data, onChange }: { def: CollectionDef; data: Record<string, string>; onChange: (k: string, v: string) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {def.fields.map(f => (
        <div key={f.key} className={f.type === "textarea" || f.type === "image" ? "sm:col-span-2" : ""}>
          <label className="text-xs text-gray-500 block mb-1">{f.label}</label>
          {f.type === "image" ? (
            <ImageUploadField label="" value={data[f.key] ?? ""} onChange={v => onChange(f.key, v)} />
          ) : f.type === "textarea" ? (
            <textarea rows={3} className={input} value={data[f.key] ?? ""} onChange={e => onChange(f.key, e.target.value)} />
          ) : (
            <input className={input} value={data[f.key] ?? ""} onChange={e => onChange(f.key, e.target.value)} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CollectionManager({ def, items }: { def: CollectionDef; items: Item[] }) {
  const router = useRouter();
  const base = `/api/admin/collections/${def.type}`;
  const [adding, setAdding] = useState<Record<string, string>>(blank(def));
  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>(
    Object.fromEntries(items.map(i => [i.id, { ...i.data }])),
  );
  const [busy, setBusy] = useState(false);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adding[def.titleField]?.trim()) { alert(`Please enter a ${def.itemLabel}.`); return; }
    setBusy(true);
    const res = await fetch(base, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: adding, sortOrder: items.length }) });
    setBusy(false);
    if (res.ok) { setAdding(blank(def)); router.refresh(); } else alert("Could not add.");
  };

  const save = async (id: string) => {
    setBusy(true);
    await fetch(`${base}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ data: drafts[id] }) });
    setBusy(false);
    router.refresh();
  };
  const togglePublished = async (id: string, published: boolean) => {
    await fetch(`${base}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ published: !published }) });
    router.refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await fetch(`${base}/${id}`, { method: "DELETE" });
    router.refresh();
  };
  const move = async (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[j]] = [reordered[j], reordered[index]];
    setBusy(true);
    await Promise.all(reordered.map((it, i) => fetch(`${base}/${it.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sortOrder: i }) })));
    setBusy(false);
    router.refresh();
  };

  const setDraft = (id: string, k: string, v: string) => setDrafts(d => ({ ...d, [id]: { ...d[id], [k]: v } }));

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="bg-white border border-gray-200 rounded-lg p-5 max-w-2xl space-y-3">
        <p className="text-sm font-medium text-gray-900">Add {def.itemLabel}</p>
        <Fields def={def} data={adding} onChange={(k, v) => setAdding(a => ({ ...a, [k]: v }))} />
        <button disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
          <Plus size={15} /> {busy ? "Saving…" : `Add ${def.itemLabel}`}
        </button>
      </form>

      <div className="space-y-4 max-w-2xl">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400">No {def.itemLabel}s yet.</p>
        ) : items.map((it, i) => (
          <div key={it.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-900 truncate">{it.data[def.titleField] || `${def.itemLabel} ${i + 1}`}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => move(i, -1)} disabled={i === 0 || busy} className="p-1.5 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30" aria-label="Move up"><ChevronUp size={15} /></button>
                <button onClick={() => move(i, 1)} disabled={i === items.length - 1 || busy} className="p-1.5 rounded text-gray-400 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30" aria-label="Move down"><ChevronDown size={15} /></button>
                <button onClick={() => togglePublished(it.id, it.published)} className={`text-xs px-2 py-1 rounded-full border ${it.published ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-200"}`}>{it.published ? "Shown" : "Hidden"}</button>
                <button onClick={() => remove(it.id)} className="p-1.5 rounded text-gray-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete"><Trash2 size={15} /></button>
              </div>
            </div>
            <Fields def={def} data={drafts[it.id] ?? it.data} onChange={(k, v) => setDraft(it.id, k, v)} />
            <button onClick={() => save(it.id)} disabled={busy} className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-700 text-xs rounded-md hover:bg-gray-50 disabled:opacity-50">
              <Save size={13} /> Save
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
