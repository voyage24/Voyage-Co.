"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import PasskeySignIn from "@/components/account/PasskeySignIn";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function LoginPage() {
  const { t } = useLanguage();
  const c = useContent();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [unverified, setUnverified] = useState(false);
  const [verified] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("verified") === "1");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setUnverified(false);
    try {
      const res = await fetch("/api/account/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Sign in failed"); setUnverified(!!data.unverified); setLoading(false); return; }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=1000&fit=crop&q=85')",
          backgroundSize: "cover", backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-vc-950/85" />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={36} tone="light" />
        </div>

        <div className="bg-panel rounded-2xl shadow-luxury border border-line p-8">
          <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">{c("login.eyebrow") || t("login.eyebrow")}</p>
          <h1 className="font-serif text-3xl font-light text-ink mb-1">{c("login.title") || t("login.title")}</h1>
          <p className="text-sm text-ink-muted mb-7 font-light">{c("login.subtitle") || t("login.subtitle")}</p>

          {verified && (
            <div className="mb-5 rounded-sm border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink font-light">
              Your email is confirmed. Please sign in to continue.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-2">{t("login.emailLabel")}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em]">{t("login.passwordLabel")}</label>
                <Link href="/forgot" className="text-xs text-gold link-underline">{t("login.forgot")}</Link>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type={showPassword ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 font-light">
                {error}
                {unverified && (
                  <>{" "}<Link href={`/verify?pending=${encodeURIComponent(email)}`} className="text-gold link-underline">Resend link</Link>.</>
                )}
              </p>
            )}
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 bg-ink hover:bg-ink/90 text-page font-normal text-xs tracking-[0.16em] uppercase rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? t("login.signingIn") : <>{t("login.signIn")} <ArrowRight size={15} /></>}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[10px] tracking-[0.16em] uppercase text-ink-faint">or</span>
            <span className="h-px flex-1 bg-line" />
          </div>
          <PasskeySignIn />

          <p className="text-center text-sm text-ink-muted mt-6 font-light">
            {t("login.notMember")}{" "}
            <Link href="/signup" className="text-gold link-underline">{t("login.requestInvitation")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
