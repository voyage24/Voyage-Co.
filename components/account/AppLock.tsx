"use client";

import { useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Lock, Fingerprint } from "lucide-react";
import { haptic } from "@/lib/haptics";

export const APP_LOCK_KEY = "vc-app-lock";
const UNLOCKED_KEY = "vc-app-unlocked";

// Optional privacy lock over the account area: if the member turned it on, their
// account content is hidden behind a Face ID / passkey prompt until they verify.
// The session cookie is still the real auth boundary; this is a "don't show my
// trips to whoever picks up my phone" screen. Reuses the passkey login ceremony.
export default function AppLock({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let on = false;
    try {
      on = localStorage.getItem(APP_LOCK_KEY) === "1" && sessionStorage.getItem(UNLOCKED_KEY) !== "1";
    } catch { /* ignore */ }
    setLocked(on);
    setReady(true);
  }, []);

  const unlock = async () => {
    setBusy(true); setError("");
    try {
      const optRes = await fetch("/api/account/passkey/login/options", { method: "POST" });
      if (!optRes.ok) { setError("Couldn't start verification."); return; }
      const options = await optRes.json();
      const authResp = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch("/api/account/passkey/login/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: authResp }),
      });
      if (!verifyRes.ok) { setError("Verification failed."); return; }
      try { sessionStorage.setItem(UNLOCKED_KEY, "1"); } catch { /* ignore */ }
      haptic("success");
      setLocked(false);
    } catch {
      setError("Verification was cancelled.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative">
      <div className={locked ? "blur-md pointer-events-none select-none" : ""} aria-hidden={locked}>
        {children}
      </div>
      {ready && locked && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-page/95 backdrop-blur-sm px-6">
          <div className="text-center max-w-xs">
            <div className="mx-auto w-14 h-14 rounded-full bg-panel border border-line flex items-center justify-center mb-5">
              <Lock size={22} className="text-gold" />
            </div>
            <h2 className="font-serif text-2xl font-light text-ink mb-2">Account locked</h2>
            <p className="text-sm text-ink-muted font-light mb-6">Verify with Face ID, Touch ID or your device PIN to continue.</p>
            <button
              onClick={unlock} disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-60 transition-colors"
            >
              <Fingerprint size={15} /> {busy ? "Verifying…" : "Unlock"}
            </button>
            {error && <p className="text-sm text-red-600 font-light mt-3">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
