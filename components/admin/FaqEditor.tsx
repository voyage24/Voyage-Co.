"use client";

import { Plus, Trash2 } from "lucide-react";

type Faq = { q: string; a: string };

// Repeatable question/answer editor shared by every product admin form.
export default function FaqEditor({ value, onChange }: { value?: Faq[] | null; onChange: (v: Faq[]) => void }) {
  const rows: Faq[] = Array.isArray(value) ? value : [];
  const set = (i: number, key: keyof Faq, val: string) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [key]: val } : r));
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div key={i} className="border border-gray-200 rounded-md p-3 space-y-2">
          <div className="flex items-center gap-2">
            <input
              value={row.q}
              onChange={e => set(i, "q", e.target.value)}
              placeholder="Question"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
            <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-600 p-1" aria-label="Remove">
              <Trash2 size={16} />
            </button>
          </div>
          <textarea
            value={row.a}
            onChange={e => set(i, "a", e.target.value)}
            placeholder="Answer"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
        </div>
      ))}
      <button type="button" onClick={() => onChange([...rows, { q: "", a: "" }])} className="inline-flex items-center gap-1.5 text-sm text-gray-700 hover:text-gray-900">
        <Plus size={15} /> Add question
      </button>
    </div>
  );
}
