"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploadField from "@/components/admin/ImageUploadField";

type Press = { id: string; name: string; image: string; url: string | null; sortOrder: number; published: boolean };

export default function PressManager({ items }: { items: Press[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", image: "", url: "", sortOrder: 0 });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { alert("Please add a logo image."); return; }
    setBusy(true);
    const res = await fetch("/api/admin/press", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) { setForm({ name: "", image: "", url: "", sortOrder: 0 }); router.refresh(); } else alert("Could not add.");
  };
  const update = async (id: string, body: object) => { await fetch(`/api/admin/press/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); router.refresh(); };
  const remove = async (id: string) => { if (!confirm("Delete this logo?")) return; await fetch(`/api/admin/press/${id}`, { method: "DELETE" }); router.refresh(); };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="bg-white border border-gray-200 rounded-lg p-5 max-w-xl space-y-3">
        <p className="text-sm font-medium text-gray-900">Add a press logo / award</p>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Name *</label><input className={input} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Condé Nast Traveller" /></div>
          <div><label className="text-xs text-gray-500">Link (optional)</label><input className={input} value={form.url} onChange={e => set("url", e.target.value)} placeholder="https://…" /></div>
        </div>
        <ImageUploadField label="Logo (transparent PNG works best)" value={form.image} onChange={v => set("image", v)} />
        <div className="w-32"><label className="text-xs text-gray-500">Sort order</label><input type="number" className={input} value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} /></div>
        <button disabled={busy} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Adding…" : "Add"}</button>
      </form>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.length === 0 ? <p className="text-sm text-gray-400">No press logos yet.</p> : items.map(p => (
          <div key={p.id} className="border border-gray-200 rounded-lg bg-white p-3 text-center">
            <div className="relative h-12 mb-2"><Image src={p.image} alt={p.name} fill sizes="160px" className="object-contain" /></div>
            <p className="text-xs text-gray-600 truncate">{p.name}</p>
            <div className="flex items-center justify-center gap-2 mt-2 text-xs">
              <button onClick={() => update(p.id, { published: !p.published })} className={p.published ? "text-emerald-700" : "text-gray-400"}>{p.published ? "Shown" : "Hidden"}</button>
              <button onClick={() => remove(p.id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
