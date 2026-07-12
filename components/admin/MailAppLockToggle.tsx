"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Shield } from "lucide-react";
import { MAIL_LOCK_KEY, MAIL_LOCK_CRED } from "@/components/admin/MailAppLock";

const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...Array.from(new Uint8Array(buf)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

// Enable / disable the Voyages Mail biometric lock. Registers a device-local
// platform passkey (Face ID / Touch ID) the first time it's turned on.
export default function MailAppLockToggle() {
  const [on, setOn] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => { try { setOn(localStorage.getItem(MAIL_LOCK_KEY) === "1"); } catch { /* ignore */ } }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      const userId = crypto.getRandomValues(new Uint8Array(16));
      const cred = (await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "Voyages Mail" },
          user: { id: userId, name: "voyages-mail", displayName: "Voyages Mail" },
          pubKeyCredParams: [{ type: "public-key", alg: -7 }, { type: "public-key", alg: -257 }],
          authenticatorSelection: { authenticatorAttachment: "platform", userVerification: "required", residentKey: "discouraged" },
          timeout: 60000,
        },
      })) as PublicKeyCredential | null;
      if (!cred) throw new Error("no credential");
      localStorage.setItem(MAIL_LOCK_CRED, b64(cred.rawId));
      localStorage.setItem(MAIL_LOCK_KEY, "1");
      setOn(true);
    } catch {
      alert("Couldn't set up biometric lock on this device.");
    } finally { setBusy(false); }
  };

  const disable = () => {
    try { localStorage.removeItem(MAIL_LOCK_KEY); localStorage.removeItem(MAIL_LOCK_CRED); sessionStorage.removeItem("mail-unlocked"); } catch { /* ignore */ }
    setOn(false);
  };

  return (
    <button
      onClick={on ? disable : enable}
      disabled={busy}
      title={on ? "Biometric lock on — tap to disable" : "Lock the mail app with Face ID / Touch ID"}
      aria-label="Toggle biometric lock"
      className={`transition-colors disabled:opacity-50 ${on ? "text-gold hover:text-gold/80" : "text-gray-400 hover:text-white"}`}
    >
      {on ? <ShieldCheck size={16} /> : <Shield size={16} />}
    </button>
  );
}
