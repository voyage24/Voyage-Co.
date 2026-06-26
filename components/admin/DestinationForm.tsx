"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface DestinationData {
  id?: string;
  name: string;
  tagline: string;
  country: string;
  image: string;
  hotelCount: number;
  sortOrder: number;
  published: boolean;
}

const BLANK: DestinationData = { name: "", tagline: "", country: "", image: "", hotelCount: 0, sortOrder: 0, published: true };

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function DestinationForm({ initial }: { initial?: DestinationData }) {
  const router = useRouter();
  const [form, setForm] = useState<DestinationData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof DestinationData>(key: K, value: DestinationData[K]) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/destinations/${encodeURIComponent(initial!.id!)}` : "/api/admin/destinations";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/destinations");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input required className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input required className={inputClass} value={form.country} onChange={e => set("country", e.target.value)} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Tagline</label>
          <input className={inputClass} placeholder="Land of Kings" value={form.tagline} onChange={e => set("tagline", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Hotel Count</label>
          <input type="number" className={inputClass} value={form.hotelCount} onChange={e => set("hotelCount", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input type="number" className={inputClass} value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
        </div>
      </div>

      <ImageUploadField label="Image" value={form.image} onChange={v => set("image", v)} />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Destination"}
      </button>
    </form>
  );
}
