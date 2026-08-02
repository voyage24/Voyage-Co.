"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import FaqEditor from "@/components/admin/FaqEditor";

interface HourlyStayData {
  id?: string;
  title: string;
  city: string;
  location: string;
  hours: number;
  amenities: string[];
  category: string;
  price: number;
  image: string;
  description: string;
  badge: string | null;
  rating?: number | null;
  published: boolean;
  featured?: boolean;
  availableUnits?: number | null;
  priceOnRequest?: boolean;
  faqs?: { q: string; a: string }[] | null;
}

const BLANK: HourlyStayData = {
  title: "", city: "", location: "", hours: 6, amenities: [], category: "", price: 0,
  image: "", description: "", badge: null, rating: null,
  published: true, featured: false, availableUnits: null, priceOnRequest: false, faqs: [],
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function HourlyStayForm({ initial }: { initial?: HourlyStayData }) {
  const router = useRouter();
  const [form, setForm] = useState<HourlyStayData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof HourlyStayData>(key: K, value: HourlyStayData[K]) => setForm(p => ({ ...p, [key]: value }));
  const setList = (key: "amenities", text: string) => set(key, text.split("\n").map(s => s.trim()).filter(Boolean));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/hourly-stays/${encodeURIComponent(initial!.id!)}` : "/api/admin/hourly-stays";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/hourly-stays");
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
          <input required className={inputClass} placeholder="The Oberoi — 6 Hour Day Use" value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input required className={inputClass} value={form.city} onChange={e => set("city", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={form.location} onChange={e => set("location", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Duration (hours)</label>
          <select className={inputClass} value={form.hours} onChange={e => set("hours", Number(e.target.value))}>
            <option value={3}>3 hours</option>
            <option value={6}>6 hours</option>
            <option value={12}>12 hours</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} placeholder="Suite / Deluxe" value={form.category} onChange={e => set("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Price (INR)</label>
          <input type="number" className={inputClass} value={form.price} onChange={e => set("price", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Rating (optional)</label>
          <input
            type="number" step="0.1" min={0} max={5} className={inputClass}
            value={form.rating ?? ""}
            onChange={e => set("rating", e.target.value === "" ? null : Number(e.target.value))}
          />
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input className={inputClass} value={form.badge ?? ""} onChange={e => set("badge", e.target.value || null)} />
        </div>
      </div>

      <ImageUploadField label="Image" value={form.image} onChange={v => set("image", v)} />

      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={4} className={inputClass} value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Amenities (one per line)</label>
        <textarea rows={4} placeholder={"Private pool access\nSpa credit\nLate check-out"} className={inputClass} value={form.amenities.join("\n")} onChange={e => setList("amenities", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>FAQs (optional)</label>
        <FaqEditor value={form.faqs} onChange={v => set("faqs", v)} />
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

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={!!form.priceOnRequest} onChange={e => set("priceOnRequest", e.target.checked)} />
        Price on request (hide the price; show an enquire button)
      </label>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={!!form.featured} onChange={e => set("featured", e.target.checked)} />
        Feature on homepage
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Hourly Stay"}
      </button>
    </form>
  );
}
