"use client";

import { useEffect, useState } from "react";
import { Wrench, Check, Loader2 } from "lucide-react";

// One-click repair of mis-encoded characters (mojibake) in stored content —
// runs the fix server-side where the DB is connected.
export default function MojibakeFixer() {
  const [count, setCount] = useState<number | null>(null);
  const [samples, setSamples] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string>("");

  useEffect(() => {
    fetch("/api/admin/fix-mojibake").then(r => r.json()).then(d => { setCount(d.rows ?? 0); setSamples(d.samples || []); }).catch(() => setCount(0));
  }, []);

  const apply = async () => {
    setBusy(true); setDone("");
    const res = await fetch("/api/admin/fix-mojibake", { method: "POST" });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { setDone(`Fixed ${d.fields} field(s) across ${d.rows} record(s).`); setCount(0); setSamples([]); }
    else setDone("Could not run — please try again.");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 max-w-2xl">
      <div className="flex items-center gap-2 mb-1">
        <Wrench size={16} className="text-gray-700" />
        <h3 className="text-sm font-semibold text-gray-900">Fix text encoding</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">Repairs garbled characters (mojibake) in your content — broken dashes, quotes and accents restored to their proper form.</p>

      {count === null ? (
        <p className="text-sm text-gray-400 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Scanning…</p>
      ) : count === 0 && !done ? (
        <p className="text-sm text-emerald-700 flex items-center gap-1.5"><Check size={15} /> No encoding issues found.</p>
      ) : done ? (
        <p className="text-sm text-emerald-700 flex items-center gap-1.5"><Check size={15} /> {done}</p>
      ) : (
        <div>
          <p className="text-sm text-gray-700 mb-2">{count} record(s) have garbled characters.</p>
          {samples.length > 0 && (
            <ul className="text-xs text-gray-500 bg-gray-50 rounded p-3 mb-3 space-y-1 max-h-40 overflow-y-auto">
              {samples.map((s, i) => <li key={i} className="truncate">{s}</li>)}
            </ul>
          )}
          <button onClick={apply} disabled={busy} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white text-sm disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Wrench size={14} />} {busy ? "Fixing…" : "Fix all"}
          </button>
        </div>
      )}
    </div>
  );
}
