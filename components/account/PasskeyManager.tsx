"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Trash2, Plus, Fingerprint } from "lucide-react";
import { registerPasskey } from "@/lib/passkey-client";

type Passkey = { id: string; deviceName: string | null; createdAt: string };

export default function PasskeyManager({ passkeys }: { passkeys: Passkey[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async () => {
    setBusy(true); setError("");
    const r = await registerPasskey();
    setBusy(false);
    if (r.ok) router.refresh();
    else setError(r.error || "Could not add passkey.");
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this passkey? You'll no longer be able to sign in with it.")) return;
    await fetch(`/api/account/passkey/${id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <div className="bg-panel border border-line rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-1">
        <Fingerprint size={16} className="text-gold" />
        <h2 className="font-serif text-xl font-light text-ink">Passkeys</h2>
      </div>
      <p className="text-sm text-ink-muted font-light mb-5">Sign in with Face ID, Touch ID or your device PIN — no password needed.</p>

      {passkeys.length > 0 && (
        <ul className="mb-5 divide-y divide-line border-y border-line">
          {passkeys.map(p => (
            <li key={p.id} className="flex items-center justify-between gap-3 py-3">
              <span className="flex items-center gap-2.5 min-w-0">
                <KeyRound size={15} className="text-ink-faint shrink-0" />
                <span className="min-w-0">
                  <span className="block text-sm text-ink truncate">{p.deviceName || "Passkey"}</span>
                  <span className="block text-xs text-ink-faint">Added {new Date(p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                </span>
              </span>
              <button onClick={() => remove(p.id)} aria-label="Remove passkey" className="text-ink-faint hover:text-red-600 transition-colors shrink-0"><Trash2 size={15} /></button>
            </li>
          ))}
        </ul>
      )}

      <button onClick={add} disabled={busy} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50 transition-colors">
        <Plus size={14} /> {busy ? "Setting up…" : "Add a passkey"}
      </button>
      {error && <p className="text-sm text-red-600 mt-3 font-light">{error}</p>}
    </div>
  );
}
