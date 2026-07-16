"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Counts = { bookings: number; enquiries: number; quotes: number; notes: number; followups: number };

// Danger zone on a client's profile: wipe their commercial records in one go.
// Retyping the email is required — this can't be undone.
export default function PurgeCustomer({ customerId, email, counts }: { customerId: string; email: string; counts: Counts }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const total = counts.bookings + counts.enquiries + counts.quotes + counts.notes + counts.followups;
  const lines = [
    `${counts.bookings} booking${counts.bookings === 1 ? "" : "s"}`,
    `${counts.enquiries} enquir${counts.enquiries === 1 ? "y" : "ies"}`,
    `${counts.quotes} quote${counts.quotes === 1 ? "" : "s"}`,
    `${counts.notes} note${counts.notes === 1 ? "" : "s"}`,
    `${counts.followups} follow-up${counts.followups === 1 ? "" : "s"}`,
  ].join(" · ");

  const purge = async () => {
    setBusy(true); setMsg("");
    const res = await fetch(`/api/admin/customers/${customerId}/purge`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmEmail }),
    });
    const d = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setMsg(d.error || "Could not delete."); return; }
    setOpen(false); setConfirmEmail("");
    router.refresh();
  };

  if (total === 0) return null;

  return (
    <div className="mt-10 border border-red-200 bg-red-50/50 rounded-lg p-4">
      <p className="text-sm font-medium text-red-800">Danger zone</p>
      <p className="text-xs text-red-700/80 mt-1">
        Permanently delete every record for this client — {lines}. Their account and mail history stay; this cannot be undone.
      </p>

      {!open ? (
        <button onClick={() => setOpen(true)} className="mt-3 text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white">
          Delete all {total} record{total === 1 ? "" : "s"}…
        </button>
      ) : (
        <div className="mt-3">
          <p className="text-xs text-red-800 mb-2">Type <strong>{email}</strong> to confirm:</p>
          <div className="flex flex-wrap gap-2">
            <input
              value={confirmEmail}
              onChange={e => setConfirmEmail(e.target.value)}
              placeholder={email}
              className="flex-1 min-w-[220px] px-3 py-2 border border-red-300 rounded-md text-sm focus:outline-none focus:border-red-600"
            />
            <button
              onClick={purge}
              disabled={busy || confirmEmail.trim().toLowerCase() !== email.toLowerCase()}
              className="text-xs px-3 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-40"
            >
              {busy ? "Deleting…" : "Delete permanently"}
            </button>
            <button onClick={() => { setOpen(false); setConfirmEmail(""); setMsg(""); }} className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-600 hover:bg-white">
              Cancel
            </button>
          </div>
        </div>
      )}
      {msg && <p className="text-xs text-red-700 mt-2">{msg}</p>}
    </div>
  );
}
