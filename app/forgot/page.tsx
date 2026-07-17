"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, KeyRound } from "lucide-react";
import Logo from "@/components/ui/Logo";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/account/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken: token }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); setError(d.error ?? "Could not send. Please try again."); setSending(false); return; }
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const field = "w-full pl-10 pr-4 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={34} /></div>
        <div className="bg-panel rounded-2xl shadow-luxury border border-line p-8 text-center">
          <KeyRound size={30} className="text-gold mx-auto mb-4" />
          <h1 className="font-serif text-2xl font-light text-ink mb-2">Forgot your password?</h1>

          {sent ? (
            <p className="text-sm text-ink-muted font-light">
              If an account exists for that address, a password-reset link is on its way. Please check your inbox (and spam). The link is valid for one hour.
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-muted font-light mb-6">Enter your email and we&apos;ll send you a link to set a new password.</p>
              <form onSubmit={submit} className="space-y-3 text-left">
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input name="email" autoComplete="email" inputMode="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
                </div>
                <div className="flex justify-center"><TurnstileWidget onToken={setToken} /></div>
                {error && <p className="text-sm text-red-600 font-light">{error}</p>}
                <button type="submit" disabled={sending || !token} className="w-full py-3 bg-ink hover:bg-ink/90 disabled:opacity-60 text-page text-xs tracking-[0.16em] uppercase rounded-sm transition-colors">
                  {sending ? "Sending…" : "Send reset link"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-ink-muted mt-6 font-light">
            <Link href="/login" className="text-gold link-underline">Back to sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
