"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";
import FaqEditor from "@/components/admin/FaqEditor";

interface AirportCabData {
  id?: string;
  title: string;
  city: string;
  vehicleType: string;
  capacity: string;
  includes: string[];
  category: string;
  price: number;
  image: string;
  description: string;
  badge: string | null;
  published: boolean;
  featured?: boolean;
  availableUnits?: number | null;
  priceOnRequest?: boolean;
  faqs?: { q: string; a: string }[] | null;
}

const BLANK: AirportCabData = {
  title: "", city: "", vehicleType: "", capacity: "", includes: [], category: "", price: 0,
  image: "", description: "", badge: null, published: true, featured: false, availableUnits: null, priceOnRequest: false, faqs: [],
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function AirportCabForm({ initial }: { initial?: AirportCabData }) {
  const router = useRouter();
  const [form, setForm] = useState<AirportCabData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof AirportCabData>(key: K, value: AirportCabData[K]) => setForm(p => ({ ...p, [key]: value }));
  const setList = (key: "includes", text: string) => set(key, text.split("\n").map(s => s.trim()).filter(Boolean));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/airport-cabs/${encodeURIComponent(initial!.id!)}` : "/api/admin/airport-cabs";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/airport-cabs");
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
          <input required className={inputClass} placeholder="Sedan Airport Transfer — Delhi" value={form.title} onChange={e => set("title", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input required className={inputClass} value={form.city} onChange={e => set("city", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Vehicle Type</label>
          <input className={inputClass} placeholder="Sedan / SUV / Luxury Sedan" value={form.vehicleType} onChange={e => set("vehicleType", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Capacity</label>
          <input className={inputClass} placeholder="3 pax · 2 bags" value={form.capacity} onChange={e => set("capacity", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={e => set("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Price (INR, per transfer)</label>
          <input type="number" className={inputClass} value={form.price} onChange={e => set("price", Number(e.target.value))} />
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
        <label className={labelClass}>Includes (one per line)</label>
        <textarea rows={4} className={inputClass} placeholder={"Meet & greet at arrivals\nFlight tracking\nBottled water"} value={form.includes.join("\n")} onChange={e => setList("includes", e.target.value)} />
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
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Airport Cab"}
      </button>
    </form>
  );
}
