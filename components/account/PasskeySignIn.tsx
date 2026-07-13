"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";
import { Fingerprint } from "lucide-react";

export default function PasskeySignIn() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const signIn = async () => {
    setBusy(true); setError("");
    try {
      const optRes = await fetch("/api/account/passkey/login/options", { method: "POST" });
      if (!optRes.ok) { setError("Passkey sign-in is unavailable right now."); return; }
      const options = await optRes.json();
      const authResp = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch("/api/account/passkey/login/verify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: authResp }),
      });
      const d = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) { setError(d.error || "Sign-in failed."); return; }
      router.push("/my-voyages");
      router.refresh();
    } catch {
      setError("Passkey sign-in was cancelled.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button onClick={signIn} disabled={busy} className="w-full py-3 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all flex items-center justify-center gap-2 disabled:opacity-60">
        <Fingerprint size={15} /> {busy ? "Waiting…" : "Sign in with a passkey"}
      </button>
      {error && <p className="text-sm text-red-600 font-light mt-2 text-center">{error}</p>}
    </div>
  );
}
