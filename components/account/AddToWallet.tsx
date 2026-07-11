"use client";

import { useState } from "react";
import { CalendarPlus, Share2, Wallet } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Booking pass actions. "Add to Calendar" (.ics) is the universal, always-working
// action — it opens Apple Calendar / Google Calendar / Outlook on any device with
// no signing certificate. Native Apple/Google Wallet needs a paid Pass Type ID
// certificate; that button only appears while it might be configured (the
// endpoint returns 501 until then), so guests never hit a dead end.
export default function AddToWallet({ reference }: { reference: string }) {
  const [msg, setMsg] = useState("");
  const [nativeOn, setNativeOn] = useState(true); // hidden after a 501 response

  const addCalendar = () => {
    haptic("tap");
    window.location.href = `/api/account/pass/${reference}/calendar`;
  };

  const addNative = async () => {
    setMsg("");
    try {
      const res = await fetch(`/api/account/pass/${reference}/apple`);
      if (res.status === 501) { setNativeOn(false); return; }
      if (!res.ok) { setMsg("Couldn't create the pass."); return; }
      const blob = await res.blob();
      window.location.href = URL.createObjectURL(blob);
      haptic("success");
    } catch { setMsg("Couldn't create the pass."); }
  };

  const sharePass = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: "My Voyages & Co. pass", url }); haptic("success"); return; }
      await navigator.clipboard.writeText(url);
      setMsg("Link copied.");
    } catch { /* dismissed */ }
  };

  return (
    <div className="space-y-2">
      <button onClick={addCalendar} className="w-full inline-flex items-center justify-center gap-2 py-3 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
        <CalendarPlus size={15} /> Add to Calendar
      </button>
      {nativeOn && (
        <button onClick={addNative} className="w-full inline-flex items-center justify-center gap-2 py-2.5 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-panel-soft transition-colors">
          <Wallet size={14} /> Add to Wallet
        </button>
      )}
      <button onClick={sharePass} className="w-full inline-flex items-center justify-center gap-2 py-2.5 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-panel-soft transition-colors">
        <Share2 size={14} /> Share / save pass
      </button>
      {msg && <p className="text-[11px] text-ink-faint text-center">{msg}</p>}
    </div>
  );
}
