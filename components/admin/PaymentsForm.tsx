"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle } from "lucide-react";
import { PAYMENT_PROVIDERS, providerFor } from "@/lib/payment-providers";

const input = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm";

export default function PaymentsForm({
  initialProvider, initialPublicKey,
}: { initialProvider: string; initialPublicKey: string }) {
  const router = useRouter();
  const [provider, setProvider] = useState(initialProvider);
  const [publicKey, setPublicKey] = useState(initialPublicKey);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [secretConfigured, setSecretConfigured] = useState<boolean | null>(null);

  const active = providerFor(provider);

  // Re-check whenever the selected provider changes (a saved value is the
  // source of truth for what's actually live, so re-fetch after save too).
  useEffect(() => {
    fetch("/api/admin/payments")
      .then(r => r.json())
      .then(d => setSecretConfigured(d.secretConfigured))
      .catch(() => setSecretConfigured(null));
  }, [provider]);

  const save = async () => {
    setSaving(true); setMsg("");
    const res = await fetch("/api/admin/payments", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ provider, publicKey }),
    });
    setSaving(false);
    if (res.ok) { setMsg("Saved."); router.refresh(); }
    else setMsg("Could not save.");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <section className="border border-gray-200 rounded-lg p-5 bg-white">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Gateway</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Provider</label>
            <select value={provider} onChange={e => setProvider(e.target.value)} className={input}>
              {PAYMENT_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
          </div>

          {active.id !== "" && (
            <>
              <div>
                <label className="block text-xs text-gray-500 mb-1">{active.publicKeyLabel}</label>
                <input value={publicKey} onChange={e => setPublicKey(e.target.value)} className={input} placeholder="Safe to store here — this is not a secret" />
              </div>

              <div className="flex items-start gap-2 text-xs rounded-md border border-gray-200 p-3 bg-gray-50">
                {secretConfigured === true && (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-emerald-800">
                      <strong>{active.secretEnvVar}</strong> is set in Vercel — {active.label} is ready to use.
                    </span>
                  </>
                )}
                {secretConfigured === false && (
                  <>
                    <AlertTriangle size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <span className="text-amber-800">
                      Not ready yet — add <strong>{active.secretEnvVar}</strong> in Vercel → Project Settings → Environment
                      Variables (never in this form or the codebase), then redeploy.
                    </span>
                  </>
                )}
                {secretConfigured === null && <span className="text-gray-400">Checking…</span>}
              </div>
            </>
          )}
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">
          {saving ? "Saving…" : "Save payment settings"}
        </button>
        {msg && <span className="text-sm text-emerald-700">{msg}</span>}
      </div>

      <p className="text-xs text-gray-400 max-w-lg">
        This only wires up which gateway is configured — it does not yet add a checkout flow to bookings.
        That&apos;s a separate, larger piece of work once a real merchant account is ready to test against.
      </p>
    </div>
  );
}
