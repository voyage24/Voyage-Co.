"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploadField from "@/components/admin/ImageUploadField";

interface BlogPostData {
  slug?: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image: string;
  author: string;
  content: string[];
  published: boolean;
}

const BLANK: BlogPostData = {
  title: "", category: "", readTime: "", date: "", excerpt: "", image: "", author: "", content: [], published: true,
};

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelClass = "block text-xs font-medium text-gray-600 mb-1";

export default function BlogPostForm({ initial }: { initial?: BlogPostData }) {
  const router = useRouter();
  const [form, setForm] = useState<BlogPostData>(initial ?? BLANK);
  const [saving, setSaving] = useState(false);
  const isEdit = !!initial?.slug;

  const set = <K extends keyof BlogPostData>(key: K, value: BlogPostData[K]) => setForm(p => ({ ...p, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const url = isEdit ? `/api/admin/blog/${encodeURIComponent(initial!.slug!)}` : "/api/admin/blog";
    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      router.push("/admin/blog");
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
        <div>
          <label className={labelClass}>Category</label>
          <input className={inputClass} value={form.category} onChange={e => set("category", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Author</label>
          <input className={inputClass} value={form.author} onChange={e => set("author", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Read Time</label>
          <input className={inputClass} placeholder="8 min" value={form.readTime} onChange={e => set("readTime", e.target.value)} />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input className={inputClass} placeholder="Jun 10, 2026" value={form.date} onChange={e => set("date", e.target.value)} />
        </div>
      </div>

      <ImageUploadField label="Featured Image" value={form.image} onChange={v => set("image", v)} />

      <div>
        <label className={labelClass}>Excerpt *</label>
        <textarea required rows={2} className={inputClass} value={form.excerpt} onChange={e => set("excerpt", e.target.value)} />
      </div>

      <div>
        <label className={labelClass}>Body (separate paragraphs with a blank line)</label>
        <textarea
          rows={12}
          className={inputClass}
          value={form.content.join("\n\n")}
          onChange={e => set("content", e.target.value.split(/\n\s*\n/).map(s => s.trim()).filter(Boolean))}
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={form.published} onChange={e => set("published", e.target.checked)} />
        Published (visible on the live site)
      </label>

      <button type="submit" disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
        {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Post"}
      </button>
    </form>
  );
}
