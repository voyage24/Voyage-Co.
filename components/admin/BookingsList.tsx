"use client";

import { useState } from "react";
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
  createdAt: string | Date;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-gray-100 text-gray-500",
};

export default function BookingsList({ bookings }: { bookings: BookingRow[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed" | "cancelled">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const shown = bookings.filter(b => filter === "all" || b.status === filter);

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

  const tabs = [
    { k: "all", label: `All (${bookings.length})` },
    { k: "pending", label: `Pending (${bookings.filter(b => b.status === "pending").length})` },
    { k: "confirmed", label: "Confirmed" },
    { k: "cancelled", label: "Cancelled" },
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
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">No bookings here.</p>
      ) : (
        <div className="space-y-2">
          {shown.map(b => {
            const open = openId === b.id;
            return (
              <div key={b.id} className="border border-gray-200 rounded-lg bg-white">
                <button onClick={() => setOpenId(open ? null : b.id)} className="w-full flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left">
                  <span className="font-mono text-xs text-gray-400">{b.reference}</span>
                  <span className="text-sm font-medium text-gray-900 truncate">{b.itemTitle}</span>
                  <span className="text-sm text-gray-500">{b.guestName}</span>
                  <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded ${STATUS_STYLES[b.status] ?? STATUS_STYLES.pending}`}>{b.status}</span>
                  <span className="text-xs text-gray-400 ml-auto">{new Date(b.createdAt).toLocaleDateString()}</span>
                </button>
                {open && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-100 text-sm text-gray-700 space-y-1">
                    <p><span className="text-gray-400">Guest:</span> {b.guestName} · <a href={`mailto:${b.guestEmail}`} className="text-blue-600 underline">{b.guestEmail}</a>{b.guestPhone ? ` · ${b.guestPhone}` : ""}</p>
                    <p><span className="text-gray-400">Item:</span> {b.itemTitle} ({b.type})</p>
                    {(b.checkIn || b.checkOut) && <p><span className="text-gray-400">Dates:</span> {b.checkIn || "?"}{b.checkOut ? ` → ${b.checkOut}` : ""}</p>}
                    <p><span className="text-gray-400">Guests:</span> {b.guests} · <span className="text-gray-400">Total:</span> ₹{b.total.toLocaleString("en-IN")}</p>
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
    </div>
  );
}
