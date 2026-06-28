"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import FaqEditor from "@/components/admin/FaqEditor";

interface ExperienceData {
  id?: string;
  title: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  category: string;
  image: string;
  description: string;
  includes: string[];
  badge: string | null;
  lat: number | null;
  lng: number | null;
  published: boolean;
  availableUnits?: number | null;
  priceOnRequest?: boolean;
  faqs?: { q: string; a: string }[] | null;
  entryRequirements?: string | null;
}

const BLANK: ExperienceData = {
  title: "", location: "", country: "", duration: "", price: 0, category: "",
  image: "", description: "", includes: [], badge: null, lat: null, lng: null, published: true, availableUnits: null, priceOnRequest: false,
  faqs: [], entryRequirements: "",
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function ExperienceForm({ initial }: { initial?: ExperienceData }) {
  const router = useRouter();
  const [form, setForm] = useState<ExperienceData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof ExperienceData>(key: K, value: ExperienceData[K]) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/experiences/${encodeURIComponent(initial!.id!)}` : "/api/admin/experiences";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/experiences");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Title *</label>
          <input required className={inputClass} value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Location *</label>
          <input required className={inputClass} value={form.location} onChange={e => set("location", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input required className={inputClass} value={form.country} onChange={e => set("country", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Duration</label>
          <input className={inputClass} placeholder="4 hours" value={form.duration} onChange={e => set("duration", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={e => set("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Price (INR)</label>
          <input type="number" className={inputClass} value={form.price} onChange={e => set("price", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input className={inputClass} value={form.badge ?? ""} onChange={e => set("badge", e.target.value || null)} />
        </div>
        <div>
          <label className={labelClass}>Latitude</label>
          <input type="number" step="any" className={inputClass} value={form.lat ?? ""} onChange={e => set("lat", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input type="number" step="any" className={inputClass} value={form.lng ?? ""} onChange={e => set("lng", e.target.value ? Number(e.target.value) : null)} />
        </div>
      </div>

      <ImageUploadField label="Image" value={form.image} onChange={v => set("image", v)} />

      <div>
        <label className={labelClass}>Includes (one per line)</label>
        <textarea
          rows={4}
          className={inputClass}
          value={form.includes.join("\n")}
          onChange={e => set("includes", e.target.value.split("\n").map(s => s.trim()).filter(Boolean))}
        />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={5} className={inputClass} value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Available units (leave blank for on-request / unlimited)</label>
        <input
          type="number" min={0} className={inputClass}
          value={form.availableUnits ?? ""}
          onChange={e => set("availableUnits", e.target.value === "" ? null : Number(e.target.value))}
          placeholder="On request"
        />
      </div>

      <div>
        <label className={labelClass}>Entry &amp; travel requirements (optional)</label>
        <textarea rows={3} className={inputClass} value={form.entryRequirements ?? ""} onChange={e => set("entryRequirements", e.target.value)} placeholder="Visa, fitness level, what to bring…" />
      </div>

      <div>
        <label className={labelClass}>FAQs (optional)</label>
        <FaqEditor value={form.faqs} onChange={v => set("faqs", v)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={!!form.priceOnRequest} onChange={e => set("priceOnRequest", e.target.checked)} />
        Price on request (hide the price; show an enquire button)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Experience"}
      </button>
    </form>
  );
}
