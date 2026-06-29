"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ImageUploadField from "@/components/admin/ImageUploadField";

type Offer = { id: string; title: string; description: string; image: string; badge: string | null; href: string | null; memberOnly: boolean; published: boolean };

export default function OffersManager({ items }: { items: Offer[] }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", image: "", badge: "", href: "", memberOnly: false, sortOrder: 0 });
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof form, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));
  const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image || !form.title) { alert("Title and image required."); return; }
    setBusy(true);
    const res = await fetch("/api/admin/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    if (res.ok) { setForm({ title: "", description: "", image: "", badge: "", href: "", memberOnly: false, sortOrder: 0 }); router.refresh(); } else alert("Could not add.");
  };
  const update = async (id: string, body: object) => { await fetch(`/api/admin/offers/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); router.refresh(); };
  const remove = async (id: string) => { if (!confirm("Delete this offer?")) return; await fetch(`/api/admin/offers/${id}`, { method: "DELETE" }); router.refresh(); };

  return (
    <div className="space-y-8">
      <form onSubmit={add} className="bg-white border border-gray-200 rounded-lg p-5 max-w-xl space-y-3">
        <p className="text-sm font-medium text-gray-900">Add an offer</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><label className="text-xs text-gray-500">Title *</label><input className={input} value={form.title} onChange={e => set("title", e.target.value)} /></div>
          <div className="col-span-2"><label className="text-xs text-gray-500">Description</label><textarea rows={2} className={input} value={form.description} onChange={e => set("description", e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Badge</label><input className={input} value={form.badge} onChange={e => set("badge", e.target.value)} placeholder="Save 20%" /></div>
          <div><label className="text-xs text-gray-500">Link</label><input className={input} value={form.href} onChange={e => set("href", e.target.value)} placeholder="/packages" /></div>
        </div>
        <ImageUploadField label="Image" value={form.image} onChange={v => set("image", v)} />
        <label className="flex items-center gap-2 text-sm text-gray-700"><input type="checkbox" checked={form.memberOnly} onChange={e => set("memberOnly", e.target.checked)} /> Member-only (logged-in customers see it)</label>
        <button disabled={busy} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Adding…" : "Add offer"}</button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.length === 0 ? <p className="text-sm text-gray-400">No offers yet.</p> : items.map(o => (
          <div key={o.id} className="border border-gray-200 rounded-lg bg-white overflow-hidden">
            <div className="relative aspect-[16/9]"><Image src={o.image} alt={o.title} fill sizes="320px" className="object-cover" /></div>
            <div className="p-3">
              <p className="text-sm font-medium text-gray-900">{o.title} {o.memberOnly && <span className="text-[10px] text-amber-700">members</span>}</p>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <button onClick={() => update(o.id, { published: !o.published })} className={o.published ? "text-emerald-700" : "text-gray-400"}>{o.published ? "Shown" : "Hidden"}</button>
                <button onClick={() => remove(o.id)} className="text-red-600">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
