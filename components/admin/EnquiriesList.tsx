"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
  createdAt: string | Date;
};

export default function EnquiriesList({ enquiries }: { enquiries: EnquiryRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "new" | "handled">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const shown = enquiries.filter(e => filter === "all" || e.status === filter);

  const setStatus = async (id: string, status: "new" | "handled") => {
    setBusyId(id);
    await fetch(`/api/admin/enquiries/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    router.refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this enquiry permanently?")) return;
    setBusyId(id);
    await fetch(`/api/admin/enquiries/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  };

  const tabs: { key: typeof filter; label: string }[] = [
    { key: "all", label: `All (${enquiries.length})` },
    { key: "new", label: `New (${enquiries.filter(e => e.status === "new").length})` },
    { key: "handled", label: "Handled" },
  ];

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setFilter(tb.key)}
            className={`text-xs px-3 py-1.5 rounded-md border ${filter === tb.key ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">
          No enquiries here.
        </p>
      ) : (
        <div className="space-y-2">
          {shown.map(e => {
            const open = openId === e.id;
            return (
              <div key={e.id} className={`border rounded-lg bg-white ${e.status === "new" ? "border-amber-300" : "border-gray-200"}`}>
                <button
                  onClick={() => setOpenId(open ? null : e.id)}
                  className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left"
                >
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${e.type === "booking" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {e.type}
                  </span>
                  {e.status === "new" && <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-amber-50 text-amber-700">New</span>}
                  <span className="text-sm font-medium text-gray-900">{e.name}</span>
                  <span className="text-sm text-gray-500 truncate">{e.itemTitle ?? e.subject ?? ""}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(e.createdAt).toLocaleString()}</span>
                </button>

                {open && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-sm text-gray-700 space-y-1">
                    <p><span className="text-gray-400">Email:</span> <a href={`mailto:${e.email}`} className="text-blue-600 underline">{e.email}</a></p>
                    {e.phone && <p><span className="text-gray-400">Phone:</span> {e.phone}</p>}
                    {e.subject && <p><span className="text-gray-400">Subject:</span> {e.subject}</p>}
                    {e.itemTitle && <p><span className="text-gray-400">Item:</span> {e.itemTitle}</p>}
                    {typeof e.total === "number" && <p><span className="text-gray-400">Est. total:</span> ₹{e.total.toLocaleString("en-IN")}</p>}
                    {e.message && <p className="whitespace-pre-wrap mt-2 bg-gray-50 border border-gray-100 rounded-md p-3">{e.message}</p>}
                    <div className="flex flex-wrap gap-3 pt-3">
                      {e.status === "new" ? (
                        <button disabled={busyId === e.id} onClick={() => setStatus(e.id, "handled")} className="text-xs px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50">Mark handled</button>
                      ) : (
                        <button disabled={busyId === e.id} onClick={() => setStatus(e.id, "new")} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Mark new</button>
                      )}
                      <a href={`mailto:${e.email}`} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">Reply</a>
                      <button disabled={busyId === e.id} onClick={() => remove(e.id)} className="text-xs px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto">Delete</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
