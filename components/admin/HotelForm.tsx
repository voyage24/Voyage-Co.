"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface HotelData {
  id?: string;
  name: string;
  location: string;
  city: string;
  country: string;
  region: string;
  stars: number;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  image: string;
  images: string[];
  category: string;
  amenities: string[];
  highlights: string[];
  description: string;
  badge: string | null;
  brand: string | null;
  lat: number | null;
  lng: number | null;
  officialSite: string | null;
  published: boolean;
}

const BLANK: HotelData = {
  name: "", location: "", city: "", country: "", region: "",
  stars: 5, rating: 0, reviewCount: 0, pricePerNight: 0,
  image: "", images: [], category: "", amenities: [], highlights: [],
  description: "", badge: null, brand: null, lat: null, lng: null, officialSite: null,
  published: true,
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function HotelForm({ initial }: { initial?: HotelData }) {
  const router = useRouter();
  const [form, setForm] = useState<HotelData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof HotelData>(key: K, value: HotelData[K]) => setForm(p => ({ ...p, [key]: value }));
  const setList = (key: "images" | "amenities" | "highlights", text: string) =>
    set(key, text.split("\n").map(s => s.trim()).filter(Boolean));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/hotels/${encodeURIComponent(initial!.id!)}` : "/api/admin/hotels";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/hotels");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name *</label>
          <input required className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Location</label>
          <input className={inputClass} value={form.location} onChange={e => set("location", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>City *</label>
          <input required className={inputClass} value={form.city} onChange={e => set("city", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Country *</label>
          <input required className={inputClass} value={form.country} onChange={e => set("country", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Region</label>
          <input className={inputClass} value={form.region} onChange={e => set("region", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={e => set("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Stars</label>
          <input type="number" min={1} max={5} className={inputClass} value={form.stars} onChange={e => set("stars", Number(e.target.value))} />
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
          <label className={labelClass}>Price Per Night (INR)</label>
          <input type="number" className={inputClass} value={form.pricePerNight} onChange={e => set("pricePerNight", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <input className={inputClass} value={form.badge ?? ""} onChange={e => set("badge", e.target.value || null)} />
        </div>
        <div>
          <label className={labelClass}>Brand</label>
          <input className={inputClass} value={form.brand ?? ""} onChange={e => set("brand", e.target.value || null)} />
        </div>
        <div>
          <label className={labelClass}>Latitude</label>
          <input type="number" step="any" className={inputClass} value={form.lat ?? ""} onChange={e => set("lat", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div>
          <label className={labelClass}>Longitude</label>
          <input type="number" step="any" className={inputClass} value={form.lng ?? ""} onChange={e => set("lng", e.target.value ? Number(e.target.value) : null)} />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Official Site</label>
          <input className={inputClass} value={form.officialSite ?? ""} onChange={e => set("officialSite", e.target.value || null)} />
        </div>
      </div>

      <ImageUploadField label="Main Image" value={form.image} onChange={v => set("image", v)} />

      <div>
        <label className={labelClass}>Additional Images (one URL per line)</label>
        <textarea rows={3} className={inputClass} value={form.images.join("\n")} onChange={e => setList("images", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Amenities (one per line)</label>
        <textarea rows={4} className={inputClass} value={form.amenities.join("\n")} onChange={e => setList("amenities", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Highlights (one per line)</label>
        <textarea rows={4} className={inputClass} value={form.highlights.join("\n")} onChange={e => setList("highlights", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea rows={5} className={inputClass} value={form.description} onChange={e => set("description", e.target.value)} />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Hotel"}
        </button>
      </div>
    </form>
  );
}
