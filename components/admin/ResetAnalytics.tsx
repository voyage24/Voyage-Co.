"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Analytics maintenance. Two very different things, kept visually apart:
//  · Visit counters — correctable, never deletable. They only count up and are
//    never stored per-visitor, so a lost total can't be rebuilt; nothing in the
//    admin removes them.
//  · Booking records — deletable, and everything derived (revenue, pipeline,
//    charts) resets with them.

function VisitCounters({ visits, mobile, desktop }: { visits: number; mobile: number; desktop: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [total, setTotal] = useState(String(visits));
  const [mob, setMob] = useState(String(mobile));
  const [desk, setDesk] = useState(String(desktop));
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const save = async () => {
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/analytics/visits", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ total, mobile: mob, desktop: desk }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Could not save."); return; }
    setMsg("Saved.");
    router.refresh();
  };

  const num = (v: string) => (Number(v) >= 0 && v !== "");

  return (
    <div className="mt-8 border border-gray-200 bg-white rounded-lg p-4">
      <p className="text-sm font-medium text-gray-900">Visit counters</p>
      <p className="text-xs text-gray-500 mt-1">
        <strong>{visits.toLocaleString("en-IN")}</strong> total · <strong>{mobile.toLocaleString("en-IN")}</strong> mobile ·{" "}
        <strong>{desktop.toLocaleString("en-IN")}</strong> desktop. These are never deleted when you remove bookings,
        customers or any other records — and there&rsquo;s no way to wipe them from here. They only count up and
        aren&rsquo;t stored per-visitor, so if a figure is ever wrong you can correct it to a known number below.
      </p>

      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-3 text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          Correct visit counters…
        </button>
      ) : (
        <div className="mt-3">
          <div className="flex flex-wrap gap-2">
            <label className="text-xs text-gray-500">
              Total
              <input value={total} onChange={e => setTotal(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric"
                className="block w-28 mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900" />
            </label>
            <label className="text-xs text-gray-500">
              Mobile
              <input value={mob} onChange={e => setMob(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric"
                className="block w-28 mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900" />
            </label>
            <label className="text-xs text-gray-500">
              Desktop
              <input value={desk} onChange={e => setDesk(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric"
                className="block w-28 mt-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900" />
            </label>
            <div className="flex items-end gap-2">
              <button onClick={save} disabled={busy || !num(total) || !num(mob) || !num(desk)}
                className="text-xs px-3 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-40">
                {busy ? "Saving…" : "Save"}
              </button>
              <button onClick={() => { setOpen(false); setMsg(""); }} className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">The total also shows publicly on the homepage.</p>
          {msg && <p className="text-xs text-gray-600 mt-2">{msg}</p>}
        </div>
      )}
    </div>
  );
}

function PurgeBookings({ bookings, revenue }: { bookings: number; revenue: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  const run = async () => {
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/analytics/purge-bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Could not delete."); return; }
    setOpen(false); setConfirm("");
    router.refresh();
  };

  if (bookings === 0) return null;

  return (
    <div className="mt-4 border border-red-200 bg-red-50/50 rounded-lg p-4">
      <p className="text-sm font-medium text-red-800">Danger zone</p>
      <p className="text-xs text-red-700/80 mt-1">
        Delete every booking record — <strong>{bookings}</strong> booking{bookings === 1 ? "" : "s"} carrying{" "}
        <strong>{inr(revenue)}</strong> of confirmed revenue. Revenue, pipeline, top journeys and the bookings-per-day
        graph are all worked out from these records, so every figure and chart above resets with them. Loyalty points
        earned on those journeys are taken back too. Visit counters are not affected. Use this to clear trial data — it
        cannot be undone.
      </p>
      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-3 text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">
          Delete all {bookings} booking record{bookings === 1 ? "" : "s"}…
        </button>
      ) : (
        <div className="mt-3">
          <p className="text-xs text-red-800 mb-2">Type <strong>DELETE</strong> to confirm:</p>
          <div className="flex flex-wrap gap-2">
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="DELETE"
              className="flex-1 min-w-[160px] px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:border-red-600" />
            <button onClick={run} disabled={busy || confirm.trim().toUpperCase() !== "DELETE"}
              className="text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-40">
              {busy ? "Deleting…" : "Delete permanently"}
            </button>
            <button onClick={() => { setOpen(false); setConfirm(""); setMsg(""); }} className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}
      {msg && <p className="text-xs text-red-700 mt-2">{msg}</p>}
    </div>
  );
}

export default function ResetAnalytics({ visits, mobile, desktop, bookings, revenue }: {
  visits: number; mobile: number; desktop: number; bookings: number; revenue: number;
}) {
  return (
    <>
      <VisitCounters visits={visits} mobile={mobile} desktop={desktop} />
      <PurgeBookings bookings={bookings} revenue={revenue} />
    </>
  );
}
