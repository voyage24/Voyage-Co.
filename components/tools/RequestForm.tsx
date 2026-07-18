"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import TurnstileWidget from "@/components/ui/TurnstileWidget";
import FormProgress from "@/components/ui/FormProgress";
import { useContactDefaults } from "@/components/providers/useContactDefaults";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "select" | "date";
  options?: string[];
  placeholder?: string;
  required?: boolean;
  full?: boolean;
};

// Generic lead form used by the visa & insurance pages. Always collects
// name/email/phone, plus whatever custom fields are passed.
export default function RequestForm({
  endpoint, title, submitLabel = "Send request", successTitle = "Request received.",
  successText = "Our team will be in touch shortly.", fields, id = "request",
}: {
  endpoint: string; title: string; submitLabel?: string; successTitle?: string;
  successText?: string; fields: FieldDef[]; id?: string;
}) {
  const initial: Record<string, string> = { name: "", email: "", phone: "" };
  fields.forEach(f => { initial[f.key] = f.type === "select" && f.options?.length ? f.options[0] : ""; });
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [token, setToken] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const { defaults, remember } = useContactDefaults();
  useEffect(() => { if (defaults) setForm(p => ({ ...p, name: p.name || defaults.name, email: p.email || defaults.email, phone: p.phone || defaults.phone })); }, [defaults]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, turnstileToken: token }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) { remember({ name: form.name, email: form.email, phone: form.phone }); setDone(true); } else setError(data.error ?? "Something went wrong.");
  };

  // Progress reaches 100% only when the request is actually sent — not merely
  // when the two required fields are filled. The middle step needs a required
  // field filled, or (when nothing extra is required) at least one field the
  // traveller has actually typed into — a defaulted select doesn't count.
  const requiredFilled = fields.filter(f => f.required).every(f => !!(form[f.key] || "").trim());
  const anyTyped = fields.some(f => f.type !== "select" && !!(form[f.key] || "").trim());
  const steps = [
    { label: "Your details", done: !!(form.name.trim() && form.email.trim()) },
    { label: "Request", done: requiredFilled && anyTyped },
    { label: "Submitted", done },
  ];

  if (done) {
    return (
      <div id={id} className="bg-panel border border-line rounded-2xl p-6 sm:p-8 scroll-mt-28">
        <FormProgress steps={steps} />
        <div className="text-center">
          <Check size={22} className="text-gold mx-auto mb-3" />
          <p className="font-serif text-xl text-ink mb-1">{successTitle}</p>
          <p className="text-ink-muted font-light">{successText}</p>
        </div>
      </div>
    );
  }

  const cls = "w-full bg-panel-soft border border-line rounded-sm px-3.5 py-2.5 text-sm text-ink focus:outline-none focus:border-gold";
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs tracking-[0.1em] uppercase text-ink-faint mb-1.5">{children}</label>
  );

  return (
    <form id={id} onSubmit={submit} className="bg-panel border border-line rounded-2xl p-6 sm:p-8 space-y-4 scroll-mt-28">
      <h2 className="font-serif text-2xl font-light text-ink">{title}</h2>
      <FormProgress steps={steps} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label>Name <span className="text-gold">*</span></Label><input required className={cls} autoComplete="name" value={form.name} onChange={e => set("name", e.target.value)} /></div>
        <div><Label>Email <span className="text-gold">*</span></Label><input required type="email" className={cls} autoComplete="email" value={form.email} onChange={e => set("email", e.target.value)} /></div>
        <div><Label>Phone</Label><input className={cls} autoComplete="tel" value={form.phone} onChange={e => set("phone", e.target.value)} /></div>
        {fields.map(f => (
          <div key={f.key} className={f.full || f.type === "textarea" ? "sm:col-span-2" : ""}>
            <Label>{f.label}{f.required ? <span className="text-gold"> *</span> : ""}</Label>
            {f.type === "textarea" ? (
              <textarea rows={3} required={f.required} className={cls} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
            ) : f.type === "select" ? (
              <select className={cls} value={form[f.key]} onChange={e => set(f.key, e.target.value)}>
                {f.options?.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input type={f.type === "date" ? "date" : "text"} required={f.required} className={cls} placeholder={f.placeholder} value={form[f.key]} onChange={e => set(f.key, e.target.value)} />
            )}
          </div>
        ))}
      </div>
      <TurnstileWidget onToken={setToken} />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy || !token} className="w-full sm:w-auto px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">{busy ? "Sending…" : submitLabel}</button>
    </form>
  );
}
