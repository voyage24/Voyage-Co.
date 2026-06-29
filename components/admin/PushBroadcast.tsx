"use client";

import { useState } from "react";

export default function PushBroadcast() {
  const [form, setForm] = useState({ title: "", body: "", url: "/" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));
  const input = "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900";

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Send this notification to all subscribers?")) return;
    setBusy(true); setMsg("");
    const res = await fetch("/api/admin/push", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    setMsg(res.ok ? `Sent to ${data.sent} of ${data.total} subscribers.` : (data.error ?? "Failed to send."));
    if (res.ok) setForm({ title: "", body: "", url: "/" });
  };

  return (
    <form onSubmit={send} className="bg-white border border-gray-200 rounded-lg p-5 max-w-xl space-y-3">
      <div><label className="text-xs text-gray-500">Title *</label><input className={input} value={form.title} onChange={e => set("title", e.target.value)} placeholder="New journeys just landed" /></div>
      <div><label className="text-xs text-gray-500">Message *</label><textarea rows={3} className={input} value={form.body} onChange={e => set("body", e.target.value)} placeholder="Discover our new winter collection in the Maldives." /></div>
      <div><label className="text-xs text-gray-500">Link (where it opens)</label><input className={input} value={form.url} onChange={e => set("url", e.target.value)} placeholder="/offers" /></div>
      {msg && <p className="text-sm text-gray-700">{msg}</p>}
      <button disabled={busy} className="px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-sm font-medium rounded-md">{busy ? "Sending…" : "Send to all subscribers"}</button>
    </form>
  );
}
