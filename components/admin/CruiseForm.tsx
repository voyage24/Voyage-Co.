"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface CruiseData {
  id?: string;
  name: string;
  cruiseLine: string;
  ship: string;
  region: string;
  departurePort: string;
  ports: string[];
  duration: string;
  pricePerPerson: number;
  image: string;
  category: string;
  amenities: string[];
  highlights: string[];
  includes: string[];
  description: string;
  rating: number;
  reviewCount: number;
  badge: string | null;
  published: boolean;
}

const BLANK: CruiseData = {
  name: "", cruiseLine: "", ship: "", region: "", departurePort: "", ports: [],
  duration: "", pricePerPerson: 0, image: "", category: "", amenities: [], highlights: [],
  includes: [], description: "", rating: 0, reviewCount: 0, badge: null, published: true,
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function CruiseForm({ initial }: { initial?: CruiseData }) {
  const router = useRouter();
  const [form, setForm] = useState<CruiseData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof CruiseData>(key: K, value: CruiseData[K]) => setForm(p => ({ ...p, [key]: value }));
  const setList = (key: "ports" | "amenities" | "highlights" | "includes", text: string) =>
    set(key, text.split("\n").map(s => s.trim()).filter(Boolean));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/cruises/${encodeURIComponent(initial!.id!)}` : "/api/admin/cruises";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/cruises");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Name *</label>
          <input required className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Cruise Line *</label>
          <input required className={inputClass} value={form.cruiseLine} onChange={e => set("cruiseLine", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Ship *</label>
          <input required className={inputClass} value={form.ship} onChange={e => set("ship", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Region</label>
          <input className={inputClass} value={form.region} onChange={e => set("region", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Departure Port</label>
          <input className={inputClass} value={form.departurePort} onChange={e => set("departurePort", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <input className={inputClass} placeholder="7 Nights" value={form.duration} onChange={e => set("duration", e.target.value)} />
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
          <label className={labelClass}>Rating</label>
          <input type="number" step="0.1" min={0} max={5} className={inputClass} value={form.rating} onChange={e => set("rating", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Review Count</label>
          <input type="number" className={inputClass} value={form.reviewCount} onChange={e => set("reviewCount", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input className={inputClass} value={form.badge ?? ""} onChange={e => set("badge", e.target.value || null)} />
        </div>
      </div>

      <ImageUploadField label="Image" value={form.image} onChange={v => set("image", v)} />

      <div>
        <label className={labelClass}>Ports of Call (one per line)</label>
        <textarea rows={3} className={inputClass} value={form.ports.join("\n")} onChange={e => setList("ports", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Amenities (one per line)</label>
        <textarea rows={3} className={inputClass} value={form.amenities.join("\n")} onChange={e => setList("amenities", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Highlights (one per line)</label>
        <textarea rows={3} className={inputClass} value={form.highlights.join("\n")} onChange={e => setList("highlights", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Includes (one per line)</label>
        <textarea rows={3} className={inputClass} value={form.includes.join("\n")} onChange={e => setList("includes", e.target.value)} />
      </div>
      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={5} className={inputClass} value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Cruise"}
      </button>
    </form>
  );
}
