"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArchiveRestore, Trash2, MailOpen } from "lucide-react";
import { haptic } from "@/lib/haptics";

type Row = { id: string; fromName: string | null; fromEmail: string; subject: string | null; bodyText: string | null; receivedAt: string };

// Archived messages: read, restore to the inbox, or delete — singly or in bulk.
export default function ArchiveList({ emails }: { emails: Row[] }) {
  const router = useRouter();
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);

  const toggleSel = (id: string) => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allSelected = emails.length > 0 && sel.size === emails.length;
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(emails.map(e => e.id)));

  const run = async (ids: string[], action: "restore" | "delete") => {
    if (action === "delete" && !confirm(`Delete ${ids.length} message${ids.length === 1 ? "" : "s"} permanently?`)) return;
    setBusy(true);
    await Promise.all(ids.map(id =>
      action === "delete"
        ? fetch(`/api/admin/inbox/${id}`, { method: "DELETE" })
        : fetch(`/api/admin/inbox/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ archived: false }) }),
    ));
    setBusy(false);
    setSel(new Set());
    haptic("success");
    router.refresh();
  };

  if (emails.length === 0) {
    return <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">Nothing archived.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
        <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
          <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-gray-900" />
          Select all
        </label>
        {sel.size > 0 && (
          <>
            <span className="text-xs text-gray-700 font-medium">{sel.size} selected</span>
            <button onClick={() => run(Array.from(sel), "restore")} disabled={busy} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"><ArchiveRestore size={12} /> Restore</button>
            <button onClick={() => run(Array.from(sel), "delete")} disabled={busy} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"><Trash2 size={12} /> Delete</button>
            <button onClick={() => setSel(new Set())} className="text-xs text-gray-500 hover:text-gray-800 ml-auto">Clear</button>
          </>
        )}
      </div>

      <div className="space-y-2">
        {emails.map(e => (
          <details key={e.id} className="border border-gray-200 rounded-lg bg-white">
            <summary className="flex items-center gap-3 px-3 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <input
                type="checkbox" checked={sel.has(e.id)} onChange={() => toggleSel(e.id)}
                onClick={ev => ev.stopPropagation()}
                aria-label="Select email" className="shrink-0 accent-gray-900"
              />
              <MailOpen size={16} className="text-gray-400 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm text-gray-700 truncate">{e.fromName || e.fromEmail}</span>
                <span className="block text-xs text-gray-500 truncate">{e.subject || "(no subject)"}</span>
              </span>
              <span className="text-xs text-gray-400 shrink-0">{new Date(e.receivedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
            </summary>
            <div className="border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-400 mb-2">{e.fromEmail} · {new Date(e.receivedAt).toLocaleString("en-GB")}</p>
              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-72 overflow-y-auto">{e.bodyText || "(no text)"}</div>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => run([e.id], "restore")} disabled={busy} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"><ArchiveRestore size={12} /> Restore to inbox</button>
                <button onClick={() => run([e.id], "delete")} disabled={busy} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 disabled:opacity-50 ml-auto"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
