"use client";

import { useState } from "react";
import { Save } from "lucide-react";

type TemplateMeta = { key: string; label: string; description: string; placeholders: string[] };

const input = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

export default function EmailTemplatesForm({ templates, values }: { templates: TemplateMeta[]; values: Record<string, string> }) {
  const [form, setForm] = useState<Record<string, string>>(values);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const set = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const save = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/emails", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) setSaved(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {templates.map(t => (
        <div key={t.key} className="border border-gray-200 rounded-lg bg-white p-5 space-y-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">{t.label}</p>
            <p className="text-xs text-gray-500">{t.description}</p>
            {t.placeholders.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">Placeholders: {t.placeholders.map(p => <code key={p} className="bg-gray-100 px-1 rounded mr-1">{p}</code>)}</p>
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Subject</label>
            <input className={input} value={form[`email.${t.key}.subject`] ?? ""} onChange={e => set(`email.${t.key}.subject`, e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Heading</label>
            <input className={input} value={form[`email.${t.key}.heading`] ?? ""} onChange={e => set(`email.${t.key}.heading`, e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Body (blank line = new paragraph)</label>
            <textarea rows={5} className={input} value={form[`email.${t.key}.body`] ?? ""} onChange={e => set(`email.${t.key}.body`, e.target.value)} />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
          <Save size={15} /> {busy ? "Saving…" : "Save emails"}
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved · live now ✓</span>}
      </div>
    </div>
  );
}
