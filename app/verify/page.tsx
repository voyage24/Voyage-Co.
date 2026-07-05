"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck, AlertCircle } from "lucide-react";
import Logo from "@/components/ui/Logo";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

function VerifyContent() {
  const params = useSearchParams();
  const invalid = params.get("status") === "invalid";
  const [email, setEmail] = useState(params.get("pending") ?? "");
  const [token, setToken] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const resend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true); setError("");
    try {
      const res = await fetch("/api/account/resend-verification", {
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

  const field = "w-full px-4 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-16">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8"><Logo size={34} /></div>
        <div className="bg-panel rounded-2xl shadow-luxury border border-line p-8 text-center">
          {invalid ? (
            <AlertCircle size={30} className="text-gold mx-auto mb-4" />
          ) : (
            <MailCheck size={30} className="text-gold mx-auto mb-4" />
          )}
          <h1 className="font-serif text-2xl font-light text-ink mb-2">
            {invalid ? "Link expired or invalid" : "Confirm your email"}
          </h1>

          {sent ? (
            <p className="text-sm text-ink-muted font-light">
              If an unverified account exists for that address, a fresh confirmation link is on its way. Please check your inbox (and spam).
            </p>
          ) : (
            <>
              <p className="text-sm text-ink-muted font-light mb-6">
                {invalid
                  ? "That confirmation link is no longer valid. Enter your email and we'll send a new one."
                  : <>We&apos;ve sent a confirmation link{email ? <> to <span className="text-ink">{email}</span></> : ""}. Click it to activate your account. Didn&apos;t get it?</>}
              </p>
              <form onSubmit={resend} className="space-y-3 text-left">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className={field} />
                <div className="flex justify-center"><TurnstileWidget onToken={setToken} /></div>
                {error && <p className="text-sm text-red-600 font-light">{error}</p>}
                <button type="submit" disabled={sending || !token} className="w-full py-3 bg-ink hover:bg-ink/90 disabled:opacity-60 text-page text-xs tracking-[0.16em] uppercase rounded-sm transition-colors">
                  {sending ? "Sending…" : "Resend confirmation link"}
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

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}
