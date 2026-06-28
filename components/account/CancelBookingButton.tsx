"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelBookingButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    if (!confirm("Cancel this reservation?")) return;
    setBusy(true);
    await fetch(`/api/account/bookings/${id}/cancel`, { method: "POST" });
    setBusy(false);
    router.refresh();
  };

  return (
    <button onClick={cancel} disabled={busy} className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 whitespace-nowrap">
      {busy ? "Cancelling…" : "Cancel"}
    </button>
  );
}
