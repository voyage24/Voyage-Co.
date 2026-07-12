"use client";

import { useEffect, useState } from "react";
import { Lock, Fingerprint, Loader2 } from "lucide-react";
import { haptic } from "@/lib/haptics";

export const MAIL_LOCK_KEY = "mail-lock";
export const MAIL_LOCK_CRED = "mail-lock-cred";
const UNLOCKED_KEY = "mail-unlocked";

const fromB64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));

// Device-local biometric gate over the Voyages Mail app: once enabled, opening
// the app requires Face ID / Touch ID (the platform authenticator) before the
// inbox is shown. Verified on-device only — the admin session cookie is still
// the real auth boundary; this is a "don't show my mail to whoever holds the
// phone" screen.
export default function MailAppLock({ children }: { children: React.ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let on = false;
    try { on = localStorage.getItem(MAIL_LOCK_KEY) === "1" && !!localStorage.getItem(MAIL_LOCK_CRED) && sessionStorage.getItem(UNLOCKED_KEY) !== "1"; } catch { /* ignore */ }
    setLocked(on); setReady(true);
  }, []);

  const unlock = async () => {
    setBusy(true); setError("");
    try {
      const credId = localStorage.getItem(MAIL_LOCK_CRED);
      if (!credId) { setLocked(false); return; }
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ id: fromB64(credId), type: "public-key" }],
          userVerification: "required",
          timeout: 60000,
        },
      });
      try { sessionStorage.setItem(UNLOCKED_KEY, "1"); } catch { /* ignore */ }
      haptic("success");
      setLocked(false);
    } catch {
      setError("Couldn't verify. Try again.");
    } finally { setBusy(false); }
  };

  // Prompt biometrics automatically the moment the locked app opens.
  useEffect(() => { if (ready && locked) unlock(); /* eslint-disable-next-line */ }, [ready, locked]);

  if (!ready) return <div className="min-h-[60vh]" />;
  if (!locked) return <>{children}</>;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6">
      <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center mb-5">
        <Lock size={22} className="text-gold" />
      </div>
      <p className="text-lg font-medium text-gray-900 mb-1">Voyages Mail is locked</p>
      <p className="text-sm text-gray-500 mb-6">Verify with Face ID / Touch ID to continue.</p>
      <button onClick={unlock} disabled={busy} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-50">
        {busy ? <Loader2 size={16} className="animate-spin" /> : <Fingerprint size={16} />} {busy ? "Verifying…" : "Unlock"}
      </button>
      {error && <p className="text-xs text-red-600 mt-3">{error}</p>}
    </div>
  );
}
