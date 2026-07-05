"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import Logo from "@/components/ui/Logo";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function SignupPage() {
  const { t } = useLanguage();
  const c = useContent();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/account/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken: token }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Could not create account"); setLoading(false); return; }
      if (data.pendingVerification) {
        router.push(`/verify?pending=${encodeURIComponent(form.email)}`);
        return;
      }
      router.push("/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-10">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1600&h=1000&fit=crop&q=85')",
          backgroundSize: "cover", backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-vc-950/85" />

      <div className="relative w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size={36} tone="light" />
        </div>

        <div className="bg-panel rounded-2xl shadow-luxury border border-line p-8">
          <p className="text-[10px] tracking-[0.28em] uppercase text-gold mb-2">{c("signup.eyebrow") || t("signup.eyebrow")}</p>
          <h1 className="font-serif text-3xl font-light text-ink mb-1">{c("signup.title") || t("signup.title")}</h1>
          <p className="text-sm text-ink-muted mb-7 font-light">{c("signup.subtitle") || t("signup.subtitle")}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "name", label: t("signup.fullName"), type: "text", placeholder: "Rahul Sharma", icon: User },
              { key: "email", label: t("signup.emailLabel"), type: "email", placeholder: "you@example.com", icon: Mail },
              { key: "phone", label: t("signup.mobileNumber"), type: "tel", placeholder: "+91 98765 43210", icon: Phone },
            ].map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key}>
                <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-2">{label}</label>
                <div className="relative">
                  <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type={type} required value={form[key as keyof typeof form]} onChange={set(key as keyof typeof form)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
              </div>
            ))}

            <div>
              <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-2">{t("signup.passwordLabel")}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
                <input
                  type={showPassword ? "text" : "password"} required value={form.password} onChange={set("password")}
                  placeholder={t("signup.passwordPlaceholder")}
                  className="w-full pl-10 pr-10 py-3 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-ink-faint font-light">
              {t("signup.agreeText")}{" "}
              <Link href="/terms" className="text-gold link-underline">{t("common.terms")}</Link> {t("signup.and")}{" "}
              <Link href="/privacy" className="text-gold link-underline">{t("privacy.title")}</Link>.
            </p>

            <TurnstileWidget onToken={setToken} className="mt-1" />

            {error && <p className="text-sm text-red-600 font-light">{error}</p>}
            <button
              type="submit" disabled={loading || !token}
              className="w-full py-3.5 bg-ink hover:bg-ink/90 text-page font-normal text-xs tracking-[0.16em] uppercase rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? t("signup.submitting") : <>{t("signup.requestInvitationBtn")} <ArrowRight size={15} /></>}
            </button>
          </form>

          <p className="text-center text-sm text-ink-muted mt-6 font-light">
            {t("signup.alreadyMember")}{" "}
            <Link href="/login" className="text-gold link-underline">{t("signup.signIn")}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
