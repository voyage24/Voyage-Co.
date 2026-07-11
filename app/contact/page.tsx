"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, Send } from "lucide-react";
import { useContactDefaults } from "@/components/providers/useContactDefaults";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import VoiceInput from "@/components/ui/VoiceInput";

function ContactContent() {
  const { t, language } = useLanguage();
  const c = useContent();
  const searchParams = useSearchParams();
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    subject: searchParams.get("subject") ?? "",
    message: searchParams.get("message") ?? "",
  });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(false);
  const [token, setToken] = useState("");
  const { defaults, remember } = useContactDefaults();

  useEffect(() => {
    if (!defaults) return;
    setForm(prev => ({ ...prev, name: prev.name || defaults.name, email: prev.email || defaults.email, phone: prev.phone || defaults.phone }));
  }, [defaults]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(false);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, language: language.code, turnstileToken: token }),
      });
      if (!res.ok) throw new Error("Failed to send");
      remember({ name: form.name, email: form.email, phone: form.phone });
      setSent(true);
    } catch {
      setError(true);
    } finally {
      setSending(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-sm bg-panel-soft border border-line text-sm text-ink focus:outline-none focus:border-gold transition-colors";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
      <div className="text-center mb-12">
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">{c("contact.eyebrow") || t("contact.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("contact.title") || t("contact.title")}</h1>
        <p className="text-ink-muted font-light">{c("contact.subtitle") || t("contact.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          {[
            { icon: Mail, title: t("contact.email"), detail: "hello@voyagesco.com", sub: t("contact.emailSub"), href: "mailto:hello@voyagesco.com" },
          ].map(c => {
            const Icon = c.icon;
            return (
              <a key={c.title} href={c.href} className="flex items-start gap-4 bg-panel rounded-2xl border border-line shadow-card p-5 hover:border-gold/40 transition-colors">
                <div className="w-10 h-10 rounded-sm border border-gold/30 bg-gold/5 flex items-center justify-center shrink-0">
                  <Icon size={17} className="text-gold" />
                </div>
                <div>
                  <p className="font-medium text-ink text-sm">{c.title}</p>
                  <p className="text-sm text-gold font-medium">{c.detail}</p>
                  <p className="text-xs text-ink-faint font-light">{c.sub}</p>
                </div>
              </a>
            );
          })}
        </div>

        {/* Form */}
        <div className="lg:col-span-3 bg-panel rounded-2xl border border-line shadow-card p-8">
          {sent ? (
            <div className="text-center py-12">
              <h3 className="font-serif text-2xl font-light text-ink mb-2">{t("contact.messageReceived")}</h3>
              <p className="text-ink-muted text-sm font-light">{t("contact.messageReceivedDesc")}</p>
              <button onClick={() => setSent(false)} className="mt-5 text-xs tracking-[0.12em] uppercase text-gold link-underline">{t("contact.sendAnother")}</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("contact.makeEnquiry")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-1.5">
                    {t("contact.fullName")} <span className="text-gold">*</span>
                  </label>
                  <input type="text" required autoComplete="name" value={form.name} onChange={set("name")} placeholder="Rahul Sharma" className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-1.5">
                    {t("contact.emailLabel")} <span className="text-gold">*</span>
                  </label>
                  <input type="email" required autoComplete="email" value={form.email} onChange={set("email")} placeholder="you@example.com" className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-1.5">
                  {t("booking.phone")} <span className="text-ink-faint normal-case tracking-normal">({t("common.optional")})</span>
                </label>
                <input type="tel" autoComplete="tel" value={form.phone} onChange={set("phone")} placeholder="+91 99199 10213" className={inputClass} />
              </div>

              <div>
                <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em] block mb-1.5">{t("contact.subject")} <span className="text-gold">*</span></label>
                <select value={form.subject} onChange={set("subject")} required className={`${inputClass} text-ink-muted`}>
                  <option value="">{t("contact.selectTopic")}</option>
                  <option>{t("contact.topicNewJourney")}</option>
                  <option>{t("contact.topicExistingBooking")}</option>
                  <option>{t("contact.topicMembership")}</option>
                  <option>{t("contact.topicPrivateAviation")}</option>
                  <option>{t("contact.topicWellness")}</option>
                  <option>{t("contact.topicOther")}</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-medium text-ink-faint uppercase tracking-[0.12em]">
                    {t("contact.message")} <span className="text-gold">*</span>
                  </label>
                  <VoiceInput onResult={text => setForm(prev => ({ ...prev, message: prev.message ? `${prev.message} ${text}` : text }))} />
                </div>
                <textarea
                  required rows={5} value={form.message} onChange={set("message")}
                  placeholder={t("contact.messagePlaceholder")}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <TurnstileWidget onToken={setToken} />
              {error && (
                <p className="text-xs text-red-600 font-light">{t("contact.sendError")}</p>
              )}
              <button
                type="submit"
                disabled={sending || !token}
                className="w-full py-3.5 bg-ink hover:bg-ink/90 disabled:opacity-60 text-page font-normal text-xs tracking-[0.14em] uppercase rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <Send size={14} /> {sending ? t("contact.sending") : t("contact.sendEnquiry")}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense>
      <ContactContent />
    </Suspense>
  );
}
