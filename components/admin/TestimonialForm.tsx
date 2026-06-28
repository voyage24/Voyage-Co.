"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface TestimonialData {
  id?: string;
  quote: string;
  author: string;
  detail: string;
  image: string;
  rating: number;
  sortOrder: number;
  published: boolean;
}

const BLANK: TestimonialData = { quote: "", author: "", detail: "", image: "", rating: 5, sortOrder: 0, published: true };

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function TestimonialForm({ initial }: { initial?: TestimonialData }) {
  const router = useRouter();
  const [form, setForm] = useState<TestimonialData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.id;

  const set = <K extends keyof TestimonialData>(key: K, value: TestimonialData[K]) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/testimonials/${encodeURIComponent(initial!.id!)}` : "/api/admin/testimonials";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/testimonials");
      router.refresh();
    } else {
      alert("Failed to save. Please check required fields.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div>
        <label className={labelClass}>Quote *</label>
        <textarea required rows={4} className={inputClass} value={form.quote} onChange={e => set("quote", e.target.value)} placeholder="Every detail was considered…" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Author *</label>
          <input required className={inputClass} value={form.author} onChange={e => set("author", e.target.value)} placeholder="Mr & Mrs Sharma" />
        </div>
        <div>
          <label className={labelClass}>Detail</label>
          <input className={inputClass} value={form.detail} onChange={e => set("detail", e.target.value)} placeholder="Bespoke journey to Japan" />
        </div>
        <div>
          <label className={labelClass}>Rating (1–5)</label>
          <input type="number" min={1} max={5} className={inputClass} value={form.rating} onChange={e => set("rating", Number(e.target.value))} />
        </div>
        <div>
          <label className={labelClass}>Sort Order</label>
          <input type="number" className={inputClass} value={form.sortOrder} onChange={e => set("sortOrder", Number(e.target.value))} />
        </div>
      </div>

      <ImageUploadField label="Photo (optional)" value={form.image} onChange={v => set("image", v)} />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Testimonial"}
      </button>
    </form>
  );
}
