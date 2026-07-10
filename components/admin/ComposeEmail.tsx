"use client";

import { useState } from "react";
import { Send, Check, Wand2, Loader2 } from "lucide-react";
import { draftFromSubject } from "@/lib/email/compose-drafts";

// Compose and send a branded concierge email to any recipient — in-house via
// SMTP, no third-party mail app. Drafts the body from the subject (AI-written
// when configured, else a professional template).
export default function ComposeEmail() {
  const [form, setForm] = useState({ to: "", name: "", cc: "", bcc: "", subject: "", context: "", message: "" });
  const [showCc, setShowCc] = useState(false);
  const [busy, setBusy] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }));

  // Draft the body — AI-tailored when the key is configured, else the template.
  const draft = async () => {
    if (!form.subject.trim()) return;
    setDrafting(true); setMsg("");
    try {
      const res = await fetch("/api/admin/email/draft", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: form.subject, name: form.name, context: form.context }),
      });
      const d = await res.json().catch(() => ({}));
      setForm(p => ({ ...p, message: d.draft || draftFromSubject(p.subject) }));
    } catch {
      setForm(p => ({ ...p, message: draftFromSubject(p.subject) }));
    } finally { setDrafting(false); }
  };
  const autoDraftOnBlur = () => { if (form.subject.trim() && !form.message.trim()) draft(); };

  const send = async () => {
    setBusy(true); setMsg(""); setSent(false);
    const res = await fetch("/api/admin/email/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setBusy(false);
    const d = await res.json().catch(() => ({}));
    if (res.ok) { setSent(true); setForm({ to: "", name: "", cc: "", bcc: "", subject: "", context: "", message: "" }); setShowCc(false); setTimeout(() => setSent(false), 3000); }
    else setMsg(d.error || "Could not send.");
  };

  const input = "w-full text-sm px-3 py-2.5 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500";

  return (
    <div className="max-w-2xl space-y-4">
      <p className="text-sm text-gray-500">Sends a branded Voyages &amp; Co. email from your concierge address. The &ldquo;Dear …&rdquo; greeting and sign-off are added automatically.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Recipient email *</label>
          <input type="email" value={form.to} onChange={set("to")} placeholder="guest@example.com" className={input} />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Recipient name (optional)</label>
          <input value={form.name} onChange={set("name")} placeholder="For the greeting" className={input} />
        </div>
      </div>

      {!showCc ? (
        <button type="button" onClick={() => setShowCc(true)} className="text-xs text-gray-500 hover:text-gray-800">+ Add Cc / Bcc</button>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Cc</label>
            <input value={form.cc} onChange={set("cc")} placeholder="comma-separated" className={input} />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Bcc</label>
            <input value={form.bcc} onChange={set("bcc")} placeholder="comma-separated" className={input} />
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-gray-500 block mb-1">Subject *</label>
        <input value={form.subject} onChange={set("subject")} onBlur={autoDraftOnBlur} placeholder="Subject" className={input} />
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-1">Context for the draft (optional)</label>
        <input value={form.context} onChange={set("context")} placeholder="e.g. confirm their Maldives stay, check-in 12 Aug, upgrade to a villa" className={input} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="text-xs text-gray-500">Message *</label>
          <button type="button" onClick={draft} disabled={!form.subject.trim() || drafting} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40">
            {drafting ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} {drafting ? "Drafting…" : "Draft with AI"}
          </button>
        </div>
        <textarea value={form.message} onChange={set("message")} rows={9} placeholder="Enter a subject and the draft appears here — edit as needed…" className={`${input} resize-none`} />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={send} disabled={busy || !form.to || !form.subject || !form.message}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white text-sm disabled:opacity-50"
        >
          {sent ? <Check size={15} /> : <Send size={15} />} {busy ? "Sending…" : sent ? "Sent" : "Send email"}
        </button>
        {msg && <span className="text-sm text-red-600">{msg}</span>}
      </div>
    </div>
  );
}
