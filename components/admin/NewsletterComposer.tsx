"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TYPES: { key: string; label: string }[] = [
  { key: "packages", label: "Journeys (Packages)" },
  { key: "hotels", label: "Stays (Hotels)" },
  { key: "experiences", label: "Experiences" },
  { key: "cruises", label: "Cruises" },
  { key: "blogPosts", label: "Journal Articles" },
];

const DEFAULTS: Record<string, number> = { packages: 2, hotels: 2, experiences: 1, cruises: 1, blogPosts: 1 };

export default function NewsletterComposer() {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number>>({ ...DEFAULTS });
  const [subject, setSubject] = useState("");
  const [intro, setIntro] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setCount = (key: string, v: number) =>
    setCounts(c => ({ ...c, [key]: Math.max(0, Math.min(10, v)) }));

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const handleGenerate = async () => {
    if (total === 0) { setError("Add at least one item to the newsletter."); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/newsletter/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ counts, subject: subject.trim() || undefined, intro: intro.trim() || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok && data.id) router.push(`/admin/newsletter/${data.id}`);
    else setError(data.error ?? "Could not generate draft.");
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white">
      <h2 className="text-sm font-semibold text-gray-900 mb-1">Compose a draft</h2>
      <p className="text-xs text-gray-500 mb-4">
        Choose how many of each to feature — items are picked from your live, published content.
        Leave subject/intro blank to use the automatic ones.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        {TYPES.map(t => (
          <div key={t.key} className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2">
            <span className="text-sm text-gray-700">{t.label}</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button" aria-label={`Fewer ${t.label}`}
                onClick={() => setCount(t.key, (counts[t.key] ?? 0) - 1)}
                className="w-7 h-7 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
              >−</button>
              <span className="w-6 text-center text-sm font-medium text-gray-900">{counts[t.key] ?? 0}</span>
              <button
                type="button" aria-label={`More ${t.label}`}
                onClick={() => setCount(t.key, (counts[t.key] ?? 0) + 1)}
                className="w-7 h-7 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50"
              >+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Subject line (optional)</label>
          <input
            value={subject} onChange={e => setSubject(e.target.value)}
            placeholder="Auto-generated from the lead item"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Intro text (optional)</label>
          <textarea
            value={intro} onChange={e => setIntro(e.target.value)}
            placeholder="Auto-generated welcome line"
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md"
        >
          {loading ? "Generating…" : `Generate draft (${total} item${total === 1 ? "" : "s"})`}
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
