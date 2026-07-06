"use client";

import { useState } from "react";
import { Wallet, Share2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

// Native Apple/Google Wallet passes need signing credentials (an Apple Pass Type
// ID certificate / a Google Wallet issuer account). Until those env vars are set
// the endpoint returns 501, so we surface the always-available action — share /
// save this pass — and only attempt the native pass when it's configured.
export default function AddToWallet({ reference }: { reference: string }) {
  const [msg, setMsg] = useState("");

  const addNative = async () => {
    setMsg("");
    try {
      const res = await fetch(`/api/account/pass/${reference}/apple`);
      if (res.status === 501) { setMsg("Native Wallet passes aren't enabled yet."); return; }
      if (!res.ok) { setMsg("Couldn't create the pass."); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      window.location.href = url;
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
      <button onClick={addNative} className="w-full inline-flex items-center justify-center gap-2 py-3 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
        <Wallet size={15} /> Add to Wallet
      </button>
      <button onClick={sharePass} className="w-full inline-flex items-center justify-center gap-2 py-2.5 border border-line-strong text-ink text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-panel-soft transition-colors">
        <Share2 size={14} /> Share / save pass
      </button>
      {msg && <p className="text-[11px] text-ink-faint text-center">{msg}</p>}
    </div>
  );
}
