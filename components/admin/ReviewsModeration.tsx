"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export type AdminReview = {
  id: string;
  authorName: string;
  type: string;
  itemId: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string | Date;
};

export default function ReviewsModeration({ reviews }: { reviews: AdminReview[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("pending");
  const [busy, setBusy] = useState<string | null>(null);

  const shown = reviews.filter(r => filter === "all" || r.status === filter);

  const setStatus = async (id: string, status: string) => {
    setBusy(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    setBusy(null);
    router.refresh();
  };
  const remove = async (id: string) => {
    if (!confirm("Delete this review permanently?")) return;
    setBusy(id);
    await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
    setBusy(null);
    router.refresh();
  };

  const tabs = [
    { k: "pending", label: `Pending (${reviews.filter(r => r.status === "pending").length})` },
    { k: "approved", label: "Approved" },
    { k: "all", label: `All (${reviews.length})` },
  ] as const;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.k} onClick={() => setFilter(t.k)}
            className={`text-xs px-3 py-1.5 rounded-md border ${filter === t.k ? "bg-gray-900 text-white border-gray-900" : "border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">No reviews here.</p>
      ) : (
        <div className="space-y-2">
          {shown.map(r => (
            <div key={r.id} className={`border rounded-lg bg-white p-4 ${r.status === "pending" ? "border-amber-300" : "border-gray-200"}`}>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                <span className="inline-flex">{[1,2,3,4,5].map(i => <Star key={i} size={13} className={i <= r.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} />)}</span>
                <span className="text-sm font-medium text-gray-900">{r.authorName}</span>
                <span className="text-xs text-gray-400">{r.type} · {r.itemId}</span>
                {r.status === "pending" && <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded bg-amber-50 text-amber-700">Pending</span>}
                <span className="text-xs text-gray-400 ml-auto">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-3">{r.comment}</p>
              <div className="flex flex-wrap gap-2">
                {r.status !== "approved" && <button disabled={busy === r.id} onClick={() => setStatus(r.id, "approved")} className="text-xs px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white disabled:opacity-50">Approve</button>}
                {r.status === "approved" && <button disabled={busy === r.id} onClick={() => setStatus(r.id, "pending")} className="text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">Unpublish</button>}
                <button disabled={busy === r.id} onClick={() => remove(r.id)} className="text-xs px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 ml-auto">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
