"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Danger zone for the visit counters. Everything else on Analytics is derived
// from bookings/enquiries, so it clears itself when those records go.
export default function ResetAnalytics({ visits, days }: { visits: number; days: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const reset = async () => {
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/analytics/reset", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Could not reset."); return; }
    setOpen(false); setConfirm("");
    router.refresh();
  };

  return (
    <div className="mt-8 border border-red-200 bg-red-50/50 rounded-lg p-4">
      <p className="text-sm font-medium text-red-800">Danger zone</p>
      <p className="text-xs text-red-700/80 mt-1">
        Reset the visit counters — <strong>{visits.toLocaleString("en-IN")}</strong> total visits and{" "}
        <strong>{days}</strong> day{days === 1 ? "" : "s"} of history, plus the mobile/desktop split. Visits are only
        counted up, never stored per-visitor, so this cannot be undone. The total also appears publicly on the
        homepage, where it will drop to zero.
      </p>
      <p className="text-xs text-red-700/80 mt-2">
        Everything else here (revenue, pipeline, top journeys, conversion) is worked out live from your bookings and
        enquiries — delete those records and these figures update on their own.
      </p>

      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-3 text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">
          Reset visit statistics…
        </button>
      ) : (
        <div className="mt-3">
          <p className="text-xs text-red-800 mb-2">Type <strong>RESET</strong> to confirm:</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="RESET"
              className="flex-1 min-w-[160px] px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:border-red-600"
            />
            <button
              onClick={reset}
              disabled={busy || confirm.trim().toUpperCase() !== "RESET"}
              className="text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
            >
              {busy ? "Resetting…" : "Reset permanently"}
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
