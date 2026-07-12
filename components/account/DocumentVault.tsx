"use client";

import { useEffect, useRef, useState } from "react";
import { FolderLock, FileText, Upload, Trash2, Loader2, ExternalLink } from "lucide-react";

type Doc = { id: string; label: string; category: string; url: string; createdAt: string };
const CATEGORIES = ["Passport", "Visa", "Insurance", "Tickets", "Other"];

// A private locker for travel documents (passport, visa, insurance, tickets).
// Files live in Blob storage and are only listed inside the signed-in account.
export default function DocumentVault() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [category, setCategory] = useState("Passport");
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch("/api/account/documents").then(r => r.json()).then(d => { if (Array.isArray(d?.documents)) setDocs(d.documents); }).finally(() => setLoaded(true));
  useEffect(() => { load(); }, []);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setErr("");
    const fd = new FormData();
    fd.append("file", file);
    fd.append("label", label.trim() || file.name);
    fd.append("category", category);
    const res = await fetch("/api/account/documents", { method: "POST", body: fd });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok && d.document) { setDocs(x => [d.document, ...x]); setLabel(""); }
    else setErr(d.error || "Couldn't upload.");
  };

  const del = async (id: string) => {
    if (!confirm("Delete this document?")) return;
    setDocs(x => x.filter(d => d.id !== id));
    await fetch(`/api/account/documents?id=${id}`, { method: "DELETE" });
  };

  return (
    <div className="border border-line rounded-2xl p-5 bg-panel-soft">
      <div className="flex items-start gap-3 mb-4">
        <FolderLock size={18} className="text-gold mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-ink">Document vault</p>
          <p className="text-xs text-ink-muted font-light mt-0.5">Keep your passport, visa, insurance and tickets in one place — private to your account, available on any device.</p>
        </div>
      </div>

      {/* Upload row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <select value={category} onChange={e => setCategory(e.target.value)} className="text-sm bg-panel border border-line rounded-sm px-2.5 py-2 focus:outline-none focus:border-gold">
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (optional)" className="flex-1 min-w-[8rem] text-sm bg-panel border border-line rounded-sm px-3 py-2 focus:outline-none focus:border-gold" />
        <button onClick={() => fileRef.current?.click()} disabled={busy} className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase bg-ink text-page px-4 py-2.5 rounded-sm hover:bg-ink/90 disabled:opacity-50">
          {busy ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />} {busy ? "Uploading…" : "Add"}
        </button>
        <input ref={fileRef} type="file" accept="application/pdf,image/*" onChange={onFile} className="hidden" />
      </div>
      {err && <p className="text-xs text-red-600 mb-3">{err}</p>}

      {/* List */}
      {!loaded ? (
        <p className="text-xs text-ink-faint">Loading…</p>
      ) : docs.length === 0 ? (
        <p className="text-xs text-ink-faint font-light">No documents yet. Add your passport or travel insurance to keep them handy.</p>
      ) : (
        <ul className="space-y-2">
          {docs.map(d => (
            <li key={d.id} className="flex items-center gap-3 bg-panel border border-line rounded-lg px-3 py-2.5">
              <FileText size={15} className="text-gold shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-ink truncate">{d.label}</p>
                <p className="text-[11px] text-ink-faint">{d.category}</p>
              </div>
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-ink-muted hover:text-ink shrink-0" aria-label="Open"><ExternalLink size={15} /></a>
              <button onClick={() => del(d.id)} className="text-ink-faint hover:text-red-500 shrink-0" aria-label="Delete"><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[10px] text-ink-faint mt-3 font-light">Stored privately for your account. For extra security, avoid uploading documents on shared devices.</p>
    </div>
  );
}
