"use client";

import { useState } from "react";
import SavedFilterViews from "@/components/admin/SavedFilterViews";
import { useRouter } from "next/navigation";
import { draftReply } from "@/lib/enquiry-replies";
import { reSubject } from "@/lib/email/compose-drafts";

export type EnquiryRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string | null;
  itemTitle: string | null;
  total: number | null;
  status: string;
  stage: string;
  notes: string | null;
  createdAt: string | Date;
};

const STAGES = ["new", "contacted", "quoted", "won", "lost"] as const;
const STAGE_STYLE: Record<string, string> = {
  new: "bg-gray-100 text-gray-600",
  contacted: "bg-blue-50 text-blue-700",
  quoted: "bg-amber-50 text-amber-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-red-50 text-red-600",
};

export default function EnquiriesList({ enquiries }: { enquiries: EnquiryRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "new" | "handled">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replyMsg, setReplyMsg] = useState("");

  const [page, setPage] = useState(0);
  const PAGE = 50;
  const shown = enquiries.filter(e => filter === "all" || e.status === filter);
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = shown.slice(safePage * PAGE, safePage * PAGE + PAGE);

  const openReply = (e: EnquiryRow) => {
    setReplyId(e.id);
    setReplySubject(reSubject(e.subject || e.itemTitle));
    setReplyText(draftReply(e));
    setReplyMsg("");
  };
  const sendReply = async (id: string) => {
    if (!replyText.trim()) return;
    setBusyId(id); setReplyMsg("");
    const res = await fetch(`/api/admin/enquiries/${id}/reply`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: replySubject, message: replyText }),
    });
    setBusyId(null);
    if (res.ok) { setReplyId(null); router.refresh(); }
    else { const d = await res.json().catch(() => ({})); setReplyMsg(d.error || "Could not send."); }
  };

  const patch = async (id: string, body: object) => {
    setBusyId(id);
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setBusyId(null);
    router.refresh();
  };
  const setStatus = (id: string, status: "new" | "handled") => patch(id, { status });

  const remove = async (id: string) => {
    if (!confirm("Delete this enquiry permanently?")) return;
    setBusyId(id);
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  };

  // Bulk selection
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const toggleSel = (id: string) => setSel(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulk = async (action: "handled" | "delete") => {
    if (sel.size === 0) return;
    if (action === "delete" && !confirm(`Delete ${sel.size} enquiry(ies) permanently?`)) return;
    setBulkBusy(true);
    for (const id of Array.from(sel)) {
      if (action === "delete") await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
      else await fetch(`/api/admin/enquiries/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "handled" }) });
    }
    setSel(new Set()); setBulkBusy(false); router.refresh();
  };

  const tabs: { key: typeof filter; label: string }[] = [
    { key: "all", label: `All (${enquiries.length})` },
    { key: "new", label: `New (${enquiries.filter(e => e.status === "new").length})` },
    { key: "handled", label: "Handled" },
  ];

  return (
    <div>
      {/* Pipeline summary */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STAGES.map(s => (
          <span key={s} className={`text-[11px] px-2.5 py-1 rounded-md capitalize ${STAGE_STYLE[s]}`}>
            {s}: {enquiries.filter(e => e.stage === s).length}
          </span>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => { setFilter(tb.key); setPage(0); }}
            className={`text-xs px-3 py-1.5 rounded-md border ${filter === tb.key ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            {tb.label}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <SavedFilterViews storageKey="vc-views-enquiries" current={filter} onApply={v => { setFilter(v as typeof filter); setPage(0); }} />
      </div>

      {sel.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 bg-gray-900 text-white rounded-md px-3 py-2 text-sm">
          <span>{sel.size} selected</span>
          <button disabled={bulkBusy} onClick={() => bulk("handled")} className="ml-2 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-xs disabled:opacity-50">Mark handled</button>
          <button disabled={bulkBusy} onClick={() => bulk("delete")} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700 text-xs disabled:opacity-50">Delete</button>
          <button onClick={() => setSel(new Set())} className="ml-auto text-xs text-gray-300 hover:text-white">Clear</button>
        </div>
      )}

      {shown.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">
          No enquiries here.
        </p>
      ) : (
        <div className="space-y-2">
          {pageRows.map(e => {
            const open = openId === e.id;
            return (
              <div key={e.id} className={`border rounded-lg bg-white ${sel.has(e.id) ? "border-gray-900" : e.status === "new" ? "border-amber-300" : "border-gray-200"}`}>
                <div className="flex items-center">
                <input type="checkbox" checked={sel.has(e.id)} onChange={() => toggleSel(e.id)} className="ml-3 shrink-0" aria-label="Select enquiry" />
                <button
                  onClick={() => setOpenId(open ? null : e.id)}
                  className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left"
                >
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${e.type === "booking" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {e.type}
                  </span>
                  {e.status === "new" && <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-amber-50 text-amber-700">New</span>}
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded capitalize ${STAGE_STYLE[e.stage] ?? STAGE_STYLE.new}`}>{e.stage}</span>
                  <span className="text-sm font-medium text-gray-900">{e.name}</span>
                  <span className="text-sm text-gray-500 truncate">{e.itemTitle ?? e.subject ?? ""}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(e.createdAt).toLocaleString()}</span>
                </button>
                </div>

                {open && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-sm text-gray-700 space-y-1">
                    <p><span className="text-gray-400">Email:</span> <a href={`mailto:${e.email}`} className="text-blue-600 underline">{e.email}</a></p>
                    {e.phone && <p><span className="text-gray-400">Phone:</span> {e.phone}</p>}
                    {e.subject && <p><span className="text-gray-400">Subject:</span> {e.subject}</p>}
                    {e.itemTitle && <p><span className="text-gray-400">Item:</span> {e.itemTitle}</p>}
                    {typeof e.total === "number" && <p><span className="text-gray-400">Est. total:</span> ₹{e.total.toLocaleString("en-IN")}</p>}
                    {e.message && <p className="whitespace-pre-wrap mt-2 bg-gray-50 border border-gray-100 rounded-md p-3">{e.message}</p>}

                    <div className="pt-3">
                      <p className="text-xs text-gray-400 mb-1.5">Pipeline stage</p>
                      <div className="flex flex-wrap gap-1.5">
                        {STAGES.map(s => (
                          <button key={s} disabled={busyId === e.id} onClick={() => patch(e.id, { stage: s })}
                            className={`text-xs px-3 py-1.5 rounded-md border capitalize disabled:opacity-50 ${e.stage === s ? `${STAGE_STYLE[s]} border-current` : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3">
                      <p className="text-xs text-gray-400 mb-1.5">Internal notes</p>
                      <textarea
                        rows={2}
                        defaultValue={e.notes ?? ""}
                        onChange={ev => setNoteDrafts(d => ({ ...d, [e.id]: ev.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        placeholder="Follow-up notes, quote details…"
                      />
                      <button disabled={busyId === e.id || noteDrafts[e.id] === undefined} onClick={() => patch(e.id, { notes: noteDrafts[e.id] ?? e.notes ?? "" })}
                        className="mt-1.5 text-xs px-3 py-1.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50">Save notes</button>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-3">
                      {e.status === "new" ? (
                        <button disabled={busyId === e.id} onClick={() => setStatus(e.id, "handled")} className="text-xs px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50">Mark handled</button>
                      ) : (
                        <button disabled={busyId === e.id} onClick={() => setStatus(e.id, "new")} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Mark new</button>
                      )}
                      <button onClick={() => replyId === e.id ? setReplyId(null) : openReply(e)} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">{replyId === e.id ? "Close reply" : "Reply"}</button>
                      <a
                        href={`mailto:${e.email}?subject=${encodeURIComponent(reSubject(e.subject || e.itemTitle))}`}
                        className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50"
                      >Open in mail app</a>
                      <button disabled={busyId === e.id} onClick={() => remove(e.id)} className="text-xs px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto">Delete</button>
                    </div>

                    {replyId === e.id && (
                      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                        <p className="text-xs text-gray-500">Pre-filled draft — edit as needed. Sends a branded email to <span className="text-gray-700">{e.email}</span>; the &ldquo;Dear {e.name?.split(" ")[0] || "Guest"}&rdquo; greeting and concierge sign-off are added automatically.</p>
                        <input
                          value={replySubject} onChange={ev => setReplySubject(ev.target.value)}
                          placeholder="Subject"
                          className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500"
                        />
                        <textarea
                          value={replyText} onChange={ev => setReplyText(ev.target.value)} rows={5}
                          placeholder={`Dear ${e.name?.split(" ")[0] || "Guest"},\n\nType your reply here…`}
                          className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500 resize-none"
                        />
                        <div className="flex items-center gap-3">
                          <button disabled={busyId === e.id || !replyText.trim()} onClick={() => sendReply(e.id)} className="text-xs px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50">{busyId === e.id ? "Sending…" : "Send reply"}</button>
                          {replyMsg && <span className="text-xs text-red-600">{replyMsg}</span>}
                        </div>
                      </div>
                    )}
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
