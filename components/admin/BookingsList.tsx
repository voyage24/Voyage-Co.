"use client";

import { useState } from "react";
import SavedFilterViews from "@/components/admin/SavedFilterViews";
import { useRouter } from "next/navigation";

export type BookingRow = {
  id: string;
  reference: string;
  type: string;
  itemTitle: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  checkIn: string | null;
  checkOut: string | null;
  guests: number;
  total: number;
  status: string;
  documents?: { label: string; url: string }[];
  createdAt: string | Date;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function BookingsList({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [doc, setDoc] = useState({ label: "", url: "" });
  const [page, setPage] = useState(0);
  const PAGE = 50;

  const shown = bookings.filter(b => filter === "all" || b.status === filter);
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = shown.slice(safePage * PAGE, safePage * PAGE + PAGE);
  const setFilterReset = (f: typeof filter) => { setFilter(f); setPage(0); };

  const saveDocs = async (b: BookingRow, documents: { label: string; url: string }[]) => {
    setBusy(b.id);
    await fetch(`/api/admin/bookings/${b.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ documents }) });
    setBusy(null); router.refresh();
  };

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    await fetch(`/api/admin/bookings/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    setBusy(null);
    router.refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this booking permanently?")) return;
    setBusy(id);
    await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  };

  // Bulk selection
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const toggleSel = (id: string) => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulk = async (action: "confirmed" | "cancelled" | "delete") => {
    if (sel.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${sel.size} booking(s) permanently?`)) return;
    setBulkBusy(true);
    for (const id of Array.from(sel)) {
      if (action === "delete") await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" });
      else await fetch(`/api/admin/bookings/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: action }) });
    }
    setSel(new Set()); setBulkBusy(false); router.refresh();
  };

  const tabs = [
    { k: "all", label: `All (${bookings.length})` },
    { k: "pending", label: `Pending (${bookings.filter(b => b.status === "pending").length})` },
    { k: "confirmed", label: "Confirmed" },
    { k: "cancelled", label: "Cancelled" },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setFilterReset(t.k)}
            className={`text-xs px-3 py-1.5 rounded-md border ${filter === t.k ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <SavedFilterViews storageKey="vc-views-bookings" current={filter} onApply={v => setFilterReset(v as typeof filter)} />
      </div>

      {sel.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 bg-gray-900 text-white rounded-md px-3 py-2 text-sm">
          <span>{sel.size} selected</span>
          <button disabled={bulkBusy} onClick={() => bulk("confirmed")} className="ml-2 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-xs disabled:opacity-50">Confirm</button>
          <button disabled={bulkBusy} onClick={() => bulk("cancelled")} className="px-3 py-1 rounded bg-white/10 hover:bg-white/20 text-xs disabled:opacity-50">Cancel</button>
          <button disabled={bulkBusy} onClick={() => bulk("delete")} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs disabled:opacity-50">Delete</button>
          <button onClick={() => setSel(new Set())} className="ml-auto text-xs text-gray-300 hover:text-white">Clear</button>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">No bookings here.</p>
      ) : (
        <div className="space-y-2">
          {pageRows.map(b => {
            const open = openId === b.id;
            return (
              <div key={b.id} className={`border rounded-lg bg-white ${sel.has(b.id) ? "border-gray-900" : "border-gray-200"}`}>
                <div className="flex items-center">
                <input type="checkbox" checked={sel.has(b.id)} onChange={() => toggleSel(b.id)} className="ml-3 shrink-0" aria-label="Select booking" />
                <button onClick={() => setOpenId(open ? null : b.id)} className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left">
                  <span className="font-mono text-xs text-gray-400">{b.reference}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{b.itemTitle}</span>
                  <span className="text-sm text-gray-500">{b.guestName}</span>
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${STATUS_STYLES[b.status] ?? STATUS_STYLES.pending}`}>{b.status}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(b.createdAt).toLocaleDateString()}</span>
                </button>
                </div>
                {open && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-sm text-gray-700 space-y-1">
                    <p><span className="text-gray-400">Guest:</span> {b.guestName} · <a href={`mailto:${b.guestEmail}`} className="text-blue-600 underline">{b.guestEmail}</a>{b.guestPhone ? ` · ${b.guestPhone}` : ""}</p>
                    <p><span className="text-gray-400">Item:</span> {b.itemTitle} ({b.type})</p>
                    {(b.checkIn || b.checkOut) && <p><span className="text-gray-400">Dates:</span> {b.checkIn || "?"}{b.checkOut ? ` → ${b.checkOut}` : ""}</p>}
                    <p><span className="text-gray-400">Guests:</span> {b.guests} · <span className="text-gray-400">Total:</span> ₹{b.total.toLocaleString("en-IN")}</p>

                    {/* Documents — vouchers, tickets, itineraries the customer can download from their account */}
                    <div className="pt-2">
                      <p className="text-xs text-gray-400 mb-1">Documents</p>
                      {(b.documents ?? []).length > 0 && (
                        <ul className="mb-2 space-y-1">
                          {(b.documents ?? []).map((d, i) => (
                            <li key={i} className="flex items-center gap-2 text-xs">
                              <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{d.label}</a>
                              <button onClick={() => saveDocs(b, (b.documents ?? []).filter((_, idx) => idx !== i))} className="text-red-500">remove</button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <input value={doc.label} onChange={e => setDoc(d => ({ ...d, label: e.target.value }))} placeholder="Label (e.g. Voucher)" className="px-2 py-1 border border-gray-300 rounded text-xs" />
                        <input value={doc.url} onChange={e => setDoc(d => ({ ...d, url: e.target.value }))} placeholder="https://… (paste link)" className="px-2 py-1 border border-gray-300 rounded text-xs flex-1 min-w-[180px]" />
                        <button disabled={busy === b.id || !doc.url} onClick={() => { saveDocs(b, [...(b.documents ?? []), { label: doc.label || "Document", url: doc.url }]); setDoc({ label: "", url: "" }); }} className="text-xs px-3 py-1 rounded bg-gray-900 text-white disabled:opacity-50">Add</button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-3">
                      {b.status !== "confirmed" && <button disabled={busy === b.id} onClick={() => setStatus(b.id, "confirmed")} className="text-xs px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50">Confirm</button>}
                      {b.status !== "pending" && <button disabled={busy === b.id} onClick={() => setStatus(b.id, "pending")} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Mark pending</button>}
                      {b.status !== "cancelled" && <button disabled={busy === b.id} onClick={() => setStatus(b.id, "cancelled")} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Cancel</button>}
                      <button disabled={busy === b.id} onClick={() => remove(b.id)} className="text-xs px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {pageCount > 1 && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <span className="text-gray-500">Page {safePage + 1} of {pageCount}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={safePage === 0} className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => Math.min(pageCount - 1, p + 1))} disabled={safePage >= pageCount - 1} className="px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
