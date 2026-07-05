"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import TurnstileWidget from "@/components/ui/TurnstileWidget";

const BUDGETS = ["plan.budget1", "plan.budget2", "plan.budget3", "plan.budget4", "plan.budgetFlexible"];
const INTERESTS = [
  "plan.intBeach", "plan.intCulture", "plan.intWellness", "plan.intAdventure",
  "plan.intSafari", "plan.intCulinary", "plan.intSpiritual", "plan.intCity",
];

const TOTAL_STEPS = 6;

export default function PlanWizard() {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const [token, setToken] = useState("");

  const [form, setForm] = useState({
    destination: "", dates: "", nights: "", adults: 2, children: 0,
    budget: "", interests: [] as string[], name: "", email: "", phone: "", occasion: "", notes: "",
  });
  const set = (k: keyof typeof form, v: any) => setForm(p => ({ ...p, [k]: v }));
  const toggleInterest = (label: string) =>
    setForm(p => ({ ...p, interests: p.interests.includes(label) ? p.interests.filter(i => i !== label) : [...p.interests, label] }));

  const canSubmit = form.name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const submit = async () => {
    if (!canSubmit || sending) return;
    setSending(true); setError(false);
    try {
      const res = await fetch("/api/plan", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          interests: form.interests.map(k => t(k)),
          budget: form.budget ? t(form.budget) : "",
          turnstileToken: token,
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch { setError(true); } finally { setSending(false); }
  };

  const input = "w-full px-4 py-3 rounded-sm bg-panel-soft border border-line text-ink focus:outline-none focus:border-gold transition-colors";
  const label = "block text-sm font-medium text-ink mb-2";

  if (sent) {
    return (
      <div className="bg-panel border border-line rounded-2xl shadow-card p-10 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full border-2 border-gold flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-gold" />
        </div>
        <h2 className="font-serif text-3xl font-light text-ink mb-3">{t("plan.successTitle")}</h2>
        <p className="text-ink-muted font-light">{t("plan.successDesc")}</p>
      </div>
    );
  }

  return (
    <div className="bg-panel border border-line rounded-2xl shadow-card p-6 sm:p-10 max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i < step ? "bg-gold" : "bg-line"}`} />
        ))}
      </div>
      <p className="text-[11px] tracking-[0.2em] uppercase text-ink-faint mb-6">{t("plan.step")} {step} {t("plan.of")} {TOTAL_STEPS}</p>

      {step === 1 && (
        <div>
          <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("plan.q1Title")}</h2>
          <p className="text-sm text-ink-muted font-light mb-5">{t("plan.q1Help")}</p>
          <input autoFocus value={form.destination} onChange={e => set("destination", e.target.value)} placeholder={t("plan.q1Placeholder")} className={input} />
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="font-serif text-2xl font-light text-ink mb-5">{t("plan.q2Title")}</h2>
          <div className="space-y-4">
            <div>
              <label className={label}>{t("plan.q2When")}</label>
              <input value={form.dates} onChange={e => set("dates", e.target.value)} placeholder={t("plan.q2WhenPlaceholder")} className={input} />
            </div>
            <div>
              <label className={label}>{t("plan.q2Nights")}</label>
              <input type="number" min={1} value={form.nights} onChange={e => set("nights", e.target.value)} placeholder="7" className={input} />
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div>
          <h2 className="font-serif text-2xl font-light text-ink mb-5">{t("plan.q3Title")}</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>{t("plan.q3Adults")}</label>
              <input type="number" min={1} value={form.adults} onChange={e => set("adults", Number(e.target.value))} className={input} />
            </div>
            <div>
              <label className={label}>{t("plan.q3Children")}</label>
              <input type="number" min={0} value={form.children} onChange={e => set("children", Number(e.target.value))} className={input} />
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div>
          <h2 className="font-serif text-2xl font-light text-ink mb-5">{t("plan.q4Title")}</h2>
          <div className="space-y-2">
            {BUDGETS.map(b => (
              <button key={b} type="button" onClick={() => set("budget", b)}
                className={`w-full text-left px-4 py-3 rounded-sm border transition-colors ${form.budget === b ? "border-gold bg-gold/5 text-ink" : "border-line text-ink-muted hover:border-gold/40"}`}>
                {t(b)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div>
          <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("plan.q5Title")}</h2>
          <p className="text-sm text-ink-muted font-light mb-5">{t("plan.q5Help")}</p>
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(i => (
              <button key={i} type="button" onClick={() => toggleInterest(i)}
                className={`px-4 py-2 rounded-full text-sm border transition-colors ${form.interests.includes(i) ? "border-gold bg-gold/5 text-ink" : "border-line text-ink-muted hover:border-gold/40"}`}>
                {t(i)}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 6 && (
        <div>
          <h2 className="font-serif text-2xl font-light text-ink mb-5">{t("plan.q6Title")}</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={label}>{t("contact.fullName")} <span className="text-gold">*</span></label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Rahul Sharma" className={input} />
              </div>
              <div>
                <label className={label}>{t("contact.emailLabel")} <span className="text-gold">*</span></label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="you@example.com" className={input} />
              </div>
            </div>
            <div>
              <label className={label}>{t("booking.phone")} <span className="text-ink-faint font-normal">({t("common.optional")})</span></label>
              <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 99199 10213" className={input} />
            </div>
            <div>
              <label className={label}>{t("plan.occasion")} <span className="text-ink-faint font-normal">({t("common.optional")})</span></label>
              <input value={form.occasion} onChange={e => set("occasion", e.target.value)} placeholder={t("plan.occasionPlaceholder")} className={input} />
            </div>
            <div>
              <label className={label}>{t("plan.notes")} <span className="text-ink-faint font-normal">({t("common.optional")})</span></label>
              <textarea rows={3} value={form.notes} onChange={e => set("notes", e.target.value)} className={`${input} resize-none`} />
            </div>
            {error && <p className="text-sm text-red-600">{t("contact.sendError")}</p>}
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between mt-8">
        <button type="button" onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
          className="inline-flex items-center gap-2 text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink disabled:opacity-30 transition-colors">
          <ArrowLeft size={15} /> {t("plan.back")}
        </button>
        {step < TOTAL_STEPS ? (
          <button type="button" onClick={() => setStep(s => Math.min(TOTAL_STEPS, s + 1))}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink/90 text-page text-xs tracking-[0.14em] uppercase rounded-sm transition-colors">
            {t("plan.next")} <ArrowRight size={15} />
          </button>
        ) : (
          <button type="button" onClick={submit} disabled={!canSubmit || sending || !token}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ink hover:bg-ink/90 disabled:opacity-50 text-page text-xs tracking-[0.14em] uppercase rounded-sm transition-colors">
            {sending ? t("plan.submitting") : t("plan.submit")}
          </button>
        )}
      </div>
      {step === TOTAL_STEPS && <div className="mt-5 flex justify-end"><TurnstileWidget onToken={setToken} /></div>}
    </div>
  );
}
