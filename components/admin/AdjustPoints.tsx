"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Manually credit or deduct a member's points from their profile. Points are
// normally earned by completing journeys, so this is for goodwill gestures and
// corrections — every adjustment is recorded in the audit log.
export default function AdjustPoints({ customerId, points, tier }: { customerId: string; points: number; tier: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const n = Math.round(Number(amount));
  const valid = Number.isFinite(n) && n > 0;

  const submit = async (sign: 1 | -1) => {
    if (!valid || busy) return;
    setBusy(true); setMsg("");
    const res = await fetch(`/api/admin/customers/${customerId}/points`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ delta: n * sign, reason }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Could not adjust points."); return; }
    setAmount(""); setReason("");
    setMsg(`Now ${d.points.toLocaleString("en-IN")} points · ${d.tier}`);
    router.refresh();
  };

  return (
    <div className="mt-3">
      {!open ? (
        <button onClick={() => setOpen(true)} className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50">
          Adjust points…
        </button>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-3">
          <p className="text-xs text-gray-500 mb-2">
            {points.toLocaleString("en-IN")} points · <span className="capitalize">{tier}</span>. Points are earned when a
            journey is completed — adjust only to correct a mistake or as a gesture. Recorded in the audit log.
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              value={amount}
              onChange={e => setAmount(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              placeholder="Points"
              className="w-28 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900"
            />
            <input
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason (optional)"
              className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-gray-900"
            />
            <button onClick={() => submit(1)} disabled={!valid || busy} className="text-xs px-3 py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40">
              {busy ? "…" : "Add"}
            </button>
            <button onClick={() => submit(-1)} disabled={!valid || busy} className="text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-40">
              {busy ? "…" : "Deduct"}
            </button>
            <button onClick={() => { setOpen(false); setMsg(""); }} className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50">
              Close
            </button>
          </div>
          {msg && <p className="text-xs text-gray-600 mt-2">{msg}</p>}
        </div>
      )}
    </div>
  );
}
