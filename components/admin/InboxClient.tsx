"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Mail, MailOpen, Reply, Archive, Trash2, Loader2, Send } from "lucide-react";

type Email = {
  id: string; fromName: string | null; fromEmail: string; subject: string | null;
  bodyText: string | null; bodyHtml: string | null; receivedAt: string; read: boolean;
};

export default function InboxClient() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [unread, setUnread] = useState(0);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState("");

  const apply = (d: { emails: Email[]; unread: number; configured: boolean }) => { setEmails(d.emails || []); setUnread(d.unread || 0); setConfigured(d.configured); };

  const load = () => fetch("/api/admin/inbox").then(r => r.json()).then(apply).catch(() => {}).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, []);

  const refresh = async () => {
    setRefreshing(true); setNote("");
    const res = await fetch("/api/admin/inbox", { method: "POST" });
    const d = await res.json().catch(() => ({}));
    apply(d);
    if (d.refresh && !d.refresh.ok) setNote(d.refresh.error || "Could not reach the mailbox.");
    else if (d.refresh) setNote(`${d.refresh.new} new message${d.refresh.new === 1 ? "" : "s"}.`);
    setRefreshing(false);
  };

  const open = (e: Email) => {
    if (openId === e.id) { setOpenId(null); return; }
    setOpenId(e.id); setReplyText("");
    if (!e.read) { setEmails(list => list.map(x => x.id === e.id ? { ...x, read: true } : x)); setUnread(u => Math.max(0, u - 1)); fetch(`/api/admin/inbox/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: true }) }); }
  };

  const act = async (id: string, body: object) => { await fetch(`/api/admin/inbox/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); load(); };
  const del = async (id: string) => { if (!confirm("Delete this message from the site inbox?")) return; await fetch(`/api/admin/inbox/${id}`, { method: "DELETE" }); load(); };

  const sendReply = async (e: Email) => {
    if (!replyText.trim()) return;
    setSending(true);
    const res = await fetch("/api/admin/email/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: e.fromEmail, name: e.fromName || "", subject: `Re: ${e.subject || "Your message"}`, message: replyText }),
    });
    setSending(false);
    if (res.ok) { setReplyText(""); setOpenId(null); act(e.id, { read: true }); }
    else { const d = await res.json().catch(() => ({})); alert(d.error || "Could not send."); }
  };

  if (loading) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={refresh} disabled={refreshing} className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white text-sm disabled:opacity-50">
          {refreshing ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />} {refreshing ? "Checking…" : "Check for new mail"}
        </button>
        {unread > 0 && <span className="text-xs bg-gold/20 text-gray-800 rounded-full px-2.5 py-1">{unread} unread</span>}
        {note && <span className="text-xs text-gray-500">{note}</span>}
      </div>

      {!configured && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Inbox reading isn&apos;t configured yet. Add the IMAP credentials in Vercel (see setup help below) to pull replies into the site.
        </div>
      )}

      <details className="mb-4 rounded-md border border-gray-200 bg-gray-50 text-sm">
        <summary className="cursor-pointer px-4 py-2.5 text-gray-700 select-none">IMAP setup help (GoDaddy email)</summary>
        <div className="px-4 pb-4 pt-1 text-gray-600 space-y-3 leading-relaxed">
          <p>The site reads replies over IMAP using your mailbox&apos;s server settings.</p>
          <div>
            <p className="font-medium text-gray-800">1. Vercel → Settings → Environment Variables</p>
            <ul className="list-disc ml-5 mt-1 space-y-0.5">
              <li><code>IMAP_HOST</code> = <code>imap.secureserver.net</code> (GoDaddy Workspace/Professional Email). If your mailbox is Titan-powered instead, use <code>imap.titan.email</code>.</li>
              <li><code>IMAP_PORT</code> = <code>993</code></li>
              <li><code>IMAP_USER</code> = your full email address</li>
              <li><code>IMAP_PASS</code> = your mailbox password (the one that logs into webmail, not an SMTP/relay key)</li>
            </ul>
            <p className="mt-1 text-gray-500">Then redeploy. No leading/trailing spaces.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">2. Confirm the exact server</p>
            <p className="mt-1">The host must match your provider. Check GoDaddy&apos;s &ldquo;server and port settings&rdquo; help page, or your desktop mail app&apos;s incoming-server field, and use that value. Legacy GoDaddy = <code>imap.secureserver.net</code>.</p>
          </div>
          <div>
            <p className="font-medium text-gray-800">3. If it&apos;s still rejected</p>
            <p className="mt-1">Message GoDaddy support: &ldquo;Please enable IMAP access for this mailbox and confirm the IMAP host/port. Also confirm IMAP logins from cloud/datacenter IPs are allowed — my app connects from a server.&rdquo;</p>
          </div>
          <p className="text-gray-500">Use &ldquo;Check for new mail&rdquo; above — the error line tells you the exact reason (host / login / connection).</p>
        </div>
      </details>

      {emails.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">No messages yet. Tap &ldquo;Check for new mail&rdquo; to pull replies from your mailbox.</p>
      ) : (
        <div className="space-y-2">
          {emails.map(e => {
            const isOpen = openId === e.id;
            return (
              <div key={e.id} className={`border rounded-lg bg-white ${e.read ? "border-gray-200" : "border-gray-900/30"}`}>
                <button onClick={() => open(e)} className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  {e.read ? <MailOpen size={16} className="text-gray-400 shrink-0" /> : <Mail size={16} className="text-gray-900 shrink-0" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm truncate ${e.read ? "text-gray-700" : "text-gray-900 font-medium"}`}>{e.fromName || e.fromEmail}</span>
                    <span className="block text-xs text-gray-500 truncate">{e.subject || "(no subject)"}</span>
                  </span>
                  <span className="text-xs text-gray-400 shrink-0">{new Date(e.receivedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    <p className="text-xs text-gray-400 mb-2">{e.fromEmail} · {new Date(e.receivedAt).toLocaleString("en-GB")}</p>
                    {e.bodyText ? (
                      <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-80 overflow-y-auto">{e.bodyText}</div>
                    ) : e.bodyHtml ? (
                      <iframe title="email" sandbox="" srcDoc={e.bodyHtml} className="w-full h-80 border border-gray-100 rounded" />
                    ) : <p className="text-sm text-gray-400">(empty message)</p>}

                    <div className="mt-3 space-y-2">
                      <textarea value={replyText} onChange={ev => setReplyText(ev.target.value)} rows={4} placeholder={`Reply to ${e.fromName || e.fromEmail}…`} className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500 resize-none" />
                      <div className="flex items-center gap-3">
                        <button onClick={() => sendReply(e)} disabled={sending || !replyText.trim()} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50">
                          {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {sending ? "Sending…" : "Send reply"}
                        </button>
                        <button onClick={() => act(e.id, { read: !e.read })} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Reply size={13} className="rotate-180" /> Mark {e.read ? "unread" : "read"}</button>
                        <button onClick={() => act(e.id, { archived: true })} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Archive size={13} /> Archive</button>
                        <button onClick={() => del(e.id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 ml-auto"><Trash2 size={13} /> Delete</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
