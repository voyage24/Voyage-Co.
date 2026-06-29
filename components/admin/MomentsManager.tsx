"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploadField from "@/components/admin/ImageUploadField";

type Moment = { id: string; image: string; caption: string | null; handle: string | null; link: string | null; published: boolean };

export default function MomentsManager({ items }: { items: Moment[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ image: "", caption: "", handle: "", link: "", sortOrder: 0 });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image) { alert("Please add an image."); return; }
    setBusy(true);
    const res = await fetch("/api/admin/moments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) { setForm({ image: "", caption: "", handle: "", link: "", sortOrder: 0 }); router.refresh(); } else alert("Could not add.");
  };
  const update = async (id: string, body: object) => { await fetch(`/api/admin/moments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); router.refresh(); };
  const remove = async (id: string) => { if (!confirm("Delete this moment?")) return; await fetch(`/api/admin/moments/${id}`, { method: "DELETE" }); router.refresh(); };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="bg-white border border-gray-200 rounded-lg p-5 max-w-xl space-y-3">
        <p className="text-sm font-medium text-gray-900">Add a moment</p>
        <ImageUploadField label="Photo" value={form.image} onChange={v => set("image", v)} />
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Caption</label><input className={input} value={form.caption} onChange={e => set("caption", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Handle (e.g. @guest)</label><input className={input} value={form.handle} onChange={e => set("handle", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Link (optional)</label><input className={input} value={form.link} onChange={e => set("link", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Sort order</label><input type="number" className={input} value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} /></div>
        </div>
        <button disabled={busy} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Adding…" : "Add"}</button>
      </form>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.length === 0 ? <p className="text-sm text-gray-400">No moments yet.</p> : items.map(m => (
          <div key={m.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="relative aspect-square"><Image src={m.image} alt={m.caption ?? ""} fill sizes="160px" className="object-cover" /></div>
            <div className="p-2 flex items-center justify-between text-xs">
              <button onClick={() => update(m.id, { published: !m.published })} className={m.published ? "text-emerald-700" : "text-gray-400"}>{m.published ? "Shown" : "Hidden"}</button>
              <button onClick={() => remove(m.id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
