"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, X } from "lucide-react";
import { registerPasskey, passkeysSupported } from "@/lib/passkey-client";

const KEY = "vc-passkey-nudge-dismissed";

// Shown at the top of the account page when the member has no passkey yet — the
// only way to make passwordless sign-in discoverable, since a passkey has to be
// created once before "Sign in with a passkey" can work.
export default function PasskeyNudge() {
  const router = useRouter();
  const [hidden, setHidden] = useState(() => {
    if (!passkeysSupported()) return true;
    try { return !!sessionStorage.getItem(KEY); } catch { return false; }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (hidden) return null;

  const setup = async () => {
    setBusy(true); setError("");
    const r = await registerPasskey();
    setBusy(false);
    if (r.ok) router.refresh();
    else setError(r.error || "Could not add passkey.");
  };
  const dismiss = () => {
    setHidden(true);
    try { sessionStorage.setItem(KEY, "1"); } catch { /* ignore */ }
  };

  return (
    <div className="relative bg-vc-950 text-[#f4f0e9] rounded-2xl p-6 sm:p-7 mb-10 overflow-hidden">
      <button onClick={dismiss} aria-label="Dismiss" className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
        <X size={16} />
      </button>
      <div className="flex items-start gap-4">
        <Fingerprint size={24} className="text-gold shrink-0 mt-0.5" />
        <div className="min-w-0">
          <h2 className="font-serif text-xl font-light mb-1">Sign in faster with a passkey</h2>
          <p className="text-sm text-white/70 font-light mb-4 max-w-lg">
            Use Face ID, Touch ID or your device PIN to sign in next time — no password to remember or type.
          </p>
          <button
            onClick={setup} disabled={busy}
            className="inline-flex items-center gap-1.5 bg-[#f4f0e9] text-vc-950 px-5 py-2.5 text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-white disabled:opacity-50 transition-colors"
          >
            {busy ? "Setting up…" : "Set up a passkey"}
          </button>
          {error && <p className="text-sm text-red-300 font-light mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}
