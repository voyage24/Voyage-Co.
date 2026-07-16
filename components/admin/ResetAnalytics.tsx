"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Danger zone for the visit counters. Everything else on Analytics is derived
// from bookings/enquiries, so it clears itself when those records go.
// One destructive action: explain it, require the exact word, then run it.
function DangerAction({ id, blurb, cta, word, endpoint, open, setOpen }: {
  id: string; blurb: React.ReactNode; cta: string; word: string; endpoint: string;
  open: string | null; setOpen: (v: string | null) => void;
}) {
  const router = useRouter();
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const isOpen = open === id;

  const run = async () => {
    setBusy(true); setMsg("");
    const res = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Could not complete."); return; }
    setOpen(null); setConfirm("");
    router.refresh();
  };

  return (
    <div className="mt-4 first:mt-0">
      <p className="text-xs text-red-700/80">{blurb}</p>
      {!isOpen ? (
        <button onClick={() => { setOpen(id); setConfirm(""); setMsg(""); }} className="mt-2 text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">
          {cta}
        </button>
      ) : (
        <div className="mt-2">
          <p className="text-xs text-red-800 mb-2">Type <strong>{word}</strong> to confirm:</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder={word}
              className="flex-1 min-w-[160px] px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:border-red-600"
            />
            <button
              onClick={run}
              disabled={busy || confirm.trim().toUpperCase() !== word}
              className="text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
            >
              {busy ? "Working…" : "Confirm permanently"}
            </button>
            <button onClick={() => { setOpen(null); setConfirm(""); setMsg(""); }} className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}
      {msg && <p className="text-xs text-red-700 mt-2">{msg}</p>}
    </div>
  );
}

export default function ResetAnalytics({ visits, days, bookings, revenue }: { visits: number; days: number; bookings: number; revenue: number }) {
  const [open, setOpen] = useState<string | null>(null);
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

  return (
    <div className="mt-8 border border-red-200 bg-red-50/50 rounded-lg p-4">
      <p className="text-sm font-medium text-red-800 mb-3">Danger zone</p>

      {bookings > 0 && (
        <DangerAction
          id="bookings"
          open={open} setOpen={setOpen}
          endpoint="/api/admin/analytics/purge-bookings"
          word="DELETE"
          cta={`Delete all ${bookings} booking record${bookings === 1 ? "" : "s"}…`}
          blurb={<>
            Delete every booking record — <strong>{bookings}</strong> booking{bookings === 1 ? "" : "s"} carrying{" "}
            <strong>{inr(revenue)}</strong> of confirmed revenue. Revenue, pipeline, top journeys and the
            bookings-per-day graph are all worked out from these records, so every figure and chart above resets with
            them. Loyalty points earned on those journeys are taken back too. Use this to clear trial data — it cannot
            be undone.
          </>}
        />
      )}

      <DangerAction
        id="visits"
        open={open} setOpen={setOpen}
        endpoint="/api/admin/analytics/reset"
        word="RESET"
        cta="Reset visit statistics…"
        blurb={<>
          Reset the visit counters — <strong>{visits.toLocaleString("en-IN")}</strong> total visits and{" "}
          <strong>{days}</strong> day{days === 1 ? "" : "s"} of history, plus the mobile/desktop split. Visits are only
          counted up, never stored per-visitor, so this cannot be undone. The total also appears publicly on the
          homepage, where it will drop to zero.
        </>}
      />
    </div>
  );
}
