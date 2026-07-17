"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";
import Logo from "@/components/ui/Logo";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

function ResetContent() {
  const params = useSearchParams();
  const router = useRouter();
  const resetToken = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirm) { setError("Passwords don't match"); return; }
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/account/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resetToken, password, turnstileToken: token }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Could not reset your password."); setBusy(false); return; }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setBusy(false);
    }
  };

  const field = "w-full pl-10 pr-10 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={34} /></div>
        <div className="bg-panel rounded-2xl shadow-luxury border border-line p-8">
          <h1 className="font-serif text-2xl font-light text-ink mb-1 text-center">Set a new password</h1>
          <p className="text-sm text-ink-muted mb-7 font-light text-center">Choose a new password for your account.</p>

          {!resetToken ? (
            <p className="text-sm text-red-600 font-light text-center">
              This reset link is missing its token. <Link href="/forgot" className="text-gold link-underline">Request a new one</Link>.
            </p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-2">New password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input name="new-password" autoComplete="new-password" type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" className={field} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-2">Confirm password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input name="confirm-password" autoComplete="new-password" type={show ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Re-enter your password" className={field} />
                </div>
              </div>
              <div className="flex justify-center"><TurnstileWidget onToken={setToken} /></div>
              {error && <p className="text-sm text-red-600 font-light">{error}</p>}
              <button type="submit" disabled={busy || !token} className="w-full py-3.5 bg-ink hover:bg-ink/90 disabled:opacity-60 text-page text-xs tracking-[0.16em] uppercase rounded-sm transition-colors">
                {busy ? "Saving…" : "Set new password"}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-ink-muted mt-6 font-light">
            <Link href="/login" className="text-gold link-underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={null}>
      <ResetContent />
    </Suspense>
  );
}
