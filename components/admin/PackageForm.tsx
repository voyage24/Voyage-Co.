"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface PackageData {
  id?: string;
  title: string;
  subtitle: string;
  destinations: string[];
  duration: string;
  pricePerPerson: number;
  image: string;
  highlights: string[];
  includes: string[];
  category: string;
  badge: string | null;
  published: boolean;
}

const BLANK: PackageData = {
  title: "", subtitle: "", destinations: [], duration: "", pricePerPerson: 0,
  image: "", highlights: [], includes: [], category: "", badge: null, published: true,
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function PackageForm({ initial }: { initial?: PackageData }) {
  const router = useRouter();
  const [form, setForm] = useState<PackageData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof PackageData>(key: K, value: PackageData[K]) => setForm(p => ({ ...p, [key]: value }));
  const setList = (key: "destinations" | "highlights" | "includes", text: string) =>
    set(key, text.split("\n").map(s => s.trim()).filter(Boolean));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/packages/${encodeURIComponent(initial!.id!)}` : "/api/admin/packages";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/packages");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Title *</label>
          <input required className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Subtitle *</label>
          <input required className={inputClass} placeholder="Delhi · Agra · Jaipur" value={form.subtitle} onChange={e => set("subtitle", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <input className={inputClass} placeholder="7 Days" value={form.duration} onChange={e => set("duration", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={e => set("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Price Per Person (INR)</label>
          <input type="number" className={inputClass} value={form.pricePerPerson} onChange={e => set("pricePerPerson", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input className={inputClass} value={form.badge ?? ""} onChange={e => set("badge", e.target.value || null)} />
        </div>
      </div>

      <ImageUploadField label="Image" value={form.image} onChange={v => set("image", v)} />

      <div>
        <label className={labelClass}>Destinations (one per line)</label>
        <textarea rows={3} className={inputClass} value={form.destinations.join("\n")} onChange={e => setList("destinations", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Highlights (one per line)</label>
        <textarea rows={4} className={inputClass} value={form.highlights.join("\n")} onChange={e => setList("highlights", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Includes (one per line)</label>
        <textarea rows={4} className={inputClass} value={form.includes.join("\n")} onChange={e => setList("includes", e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Package"}
      </button>
    </form>
  );
}
