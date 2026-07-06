"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { APP_LOCK_KEY } from "./AppLock";

// Turns the account privacy lock on/off. Only useful with a passkey registered,
// so it's shown alongside the passkey manager and explains that requirement.
export default function AppLockToggle({ hasPasskey }: { hasPasskey: boolean }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    try { setOn(localStorage.getItem(APP_LOCK_KEY) === "1"); } catch { /* ignore */ }
  }, []);

  const toggle = () => {
    const next = !on;
    setOn(next);
    try {
      if (next) localStorage.setItem(APP_LOCK_KEY, "1");
      else localStorage.removeItem(APP_LOCK_KEY);
      sessionStorage.removeItem("vc-app-unlocked");
    } catch { /* ignore */ }
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-6 mt-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Lock size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-light text-ink">Lock my account</h2>
          </div>
          <p className="text-sm text-ink-muted font-light">
            Require Face ID / Touch ID each time this device opens your account.
            {!hasPasskey && <span className="text-ink-faint"> Add a passkey first to use this.</span>}
          </p>
        </div>
        <button
          onClick={toggle} disabled={!hasPasskey}
          role="switch" aria-checked={on} aria-label="Lock my account"
          className={`relative shrink-0 w-12 h-7 rounded-full transition-colors disabled:opacity-40 ${on ? "bg-ink" : "bg-line-strong"}`}
        >
          <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-page transition-transform ${on ? "translate-x-5" : ""}`} />
        </button>
      </div>
    </div>
  );
}
