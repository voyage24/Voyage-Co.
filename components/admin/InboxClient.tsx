"use client";

import { useEffect, useRef, useState } from "react";
import { RefreshCw, Mail, MailOpen, Reply, Archive, Trash2, Loader2, Send, Wand2 } from "lucide-react";
import { reSubject } from "@/lib/email/compose-drafts";
import { haptic } from "@/lib/haptics";

type Email = {
  id: string; fromName: string | null; fromEmail: string; toEmail?: string | null; subject: string | null;
  bodyText: string | null; bodyHtml: string | null; receivedAt: string; read: boolean;
  replyTo?: string; replyName?: string | null; replyFrom?: string;
};
type InboxData = { emails: Email[]; unread: number; configured: boolean };

// `initial` is the server-rendered snapshot — when provided the inbox paints
// immediately instead of fetching in a second round-trip after page load.
export default function InboxClient({ initial }: { initial?: InboxData }) {
  const [emails, setEmails] = useState<Email[]>(initial?.emails ?? []);
  const [unread, setUnread] = useState(initial?.unread ?? 0);
  const [configured, setConfigured] = useState(initial?.configured ?? true);
  const [loading, setLoading] = useState(!initial);
  const [sentInfo, setSentInfo] = useState<{ id: string; to: string } | null>(null);
  const [replyTo, setReplyTo] = useState("");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyContext, setReplyContext] = useState("");
  const [replyCc, setReplyCc] = useState("");
  const [replyBcc, setReplyBcc] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [sending, setSending] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [note, setNote] = useState("");
  const [draftInfo, setDraftInfo] = useState("");
  const draftedRef = useRef<Set<string>>(new Set());

  const plain = (e: Email) => e.bodyText || (e.bodyHtml || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  // Draft a contextual AI reply to the received message (editable). Falls back
  // to the template server-side when the AI key isn't configured.
  const draftReply = async (e: Email) => {
    setDrafting(true);
    try {
      const res = await fetch("/api/admin/email/draft", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: e.subject || "", name: e.replyName || "", context: replyContext, incoming: plain(e).slice(0, 4000) }),
      });
      const d = await res.json().catch(() => ({}));
      if (d.draft) setReplyText(d.draft);
      setDraftInfo(d.source === "ai" ? "AI reply ✓" : (d.note || "template reply"));
    } catch { /* leave blank */ } finally { setDrafting(false); }
  };

  const apply = (d: { emails: Email[]; unread: number; configured: boolean }) => { setEmails(d.emails || []); setUnread(d.unread || 0); setConfigured(d.configured); };

  const load = () => fetch("/api/admin/inbox").then(r => r.json()).then(apply).catch(() => {}).finally(() => setLoading(false));
  // With a server snapshot the initial fetch is skipped — the list is already painted.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (!initial) load(); }, []);

  // App-icon badge (Badging API) for the installed Voyages Mail app — mirrors
  // the unread count, cleared when everything is read.
  useEffect(() => {
    const nav = navigator as Navigator & { setAppBadge?: (n?: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (!nav.setAppBadge) return;
    try { if (unread > 0) nav.setAppBadge(unread); else nav.clearAppBadge?.(); } catch { /* unsupported */ }
  }, [unread]);

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
    setOpenId(e.id); setReplyText(""); setReplyContext(""); setReplyCc(""); setReplyBcc(""); setShowCc(false);
    setReplyTo(e.replyTo || e.fromEmail); setSentInfo(null);
    // Auto-draft a contextual AI reply the first time this message is opened.
    if (!draftedRef.current.has(e.id)) { draftedRef.current.add(e.id); draftReply(e); }
    if (!e.read) { setEmails(list => list.map(x => x.id === e.id ? { ...x, read: true } : x)); setUnread(u => Math.max(0, u - 1)); fetch(`/api/admin/inbox/${e.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ read: true }) }); }
  };

  const act = async (id: string, body: object) => { await fetch(`/api/admin/inbox/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); load(); };
  const del = async (id: string) => { if (!confirm("Delete this message from the site inbox?")) return; await fetch(`/api/admin/inbox/${id}`, { method: "DELETE" }); load(); };

  // Multi-select: tick emails, then archive or delete them in one go.
  const toggleSel = (id: string) => setSel(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allSelected = emails.length > 0 && sel.size === emails.length;
  const toggleAll = () => setSel(allSelected ? new Set() : new Set(emails.map(e => e.id)));
  const bulk = async (action: "archive" | "delete" | "read") => {
    if (action === "delete" && !confirm(`Delete ${sel.size} message${sel.size === 1 ? "" : "s"} from the site inbox?`)) return;
    setBulkBusy(true);
    await Promise.all(Array.from(sel).map(id =>
      action === "delete"
        ? fetch(`/api/admin/inbox/${id}`, { method: "DELETE" })
        : fetch(`/api/admin/inbox/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "archive" ? { archived: true } : { read: true }) }),
    ));
    setBulkBusy(false);
    setSel(new Set());
    setOpenId(null);
    haptic("success");
    load();
  };

  const sendReply = async (e: Email) => {
    if (!replyText.trim() || !replyTo.trim()) return;
    setSending(true);
    const res = await fetch("/api/admin/email/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: replyTo.trim(), name: e.replyName || "", subject: reSubject(e.subject, "Your message"), message: replyText, cc: replyCc, bcc: replyBcc, from: e.replyFrom || "" }),
    });
    setSending(false);
    if (res.ok) {
      // Confirm inline, right where the reply was written — the row stays put.
      setSentInfo({ id: e.id, to: replyTo.trim() });
      setReplyText("");
      act(e.id, { read: true });
      haptic("success");
    }
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

      {emails.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
          <label className="inline-flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} className="accent-gray-900" />
            Select all
          </label>
          {sel.size > 0 && (
            <>
              <span className="text-xs text-gray-700 font-medium">{sel.size} selected</span>
              <button onClick={() => bulk("read")} disabled={bulkBusy} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-white disabled:opacity-50"><MailOpen size={12} /> Mark read</button>
              <button onClick={() => bulk("archive")} disabled={bulkBusy} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50"><Archive size={12} /> Archive</button>
              <button onClick={() => bulk("delete")} disabled={bulkBusy} className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"><Trash2 size={12} /> Delete</button>
              <button onClick={() => setSel(new Set())} className="text-xs text-gray-500 hover:text-gray-800 ml-auto">Clear</button>
            </>
          )}
        </div>
      )}

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
                <div className="flex items-center">
                <input
                  type="checkbox" checked={sel.has(e.id)} onChange={() => toggleSel(e.id)}
                  aria-label="Select email" className="ml-3 shrink-0 accent-gray-900"
                />
                <button onClick={() => open(e)} className="flex-1 min-w-0 flex items-center gap-3 px-3 py-3 text-left">
                  {e.read ? <MailOpen size={16} className="text-gray-400 shrink-0" /> : <Mail size={16} className="text-gray-900 shrink-0" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block text-sm truncate ${e.read ? "text-gray-700" : "text-gray-900 font-medium"}`}>{e.fromName || e.fromEmail}</span>
                    <span className="block text-xs text-gray-500 truncate">{e.subject || "(no subject)"}</span>
                  </span>
                  <span className="text-xs text-gray-400 shrink-0 pr-1">{new Date(e.receivedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                </button>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-3">
                    <p className="text-xs text-gray-400 mb-2">{e.fromEmail} · {new Date(e.receivedAt).toLocaleString("en-GB")}</p>
                    {e.bodyText ? (
                      <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-80 overflow-y-auto">{e.bodyText}</div>
                    ) : e.bodyHtml ? (
                      <iframe title="email" sandbox="" srcDoc={e.bodyHtml} className="w-full h-80 border border-gray-100 rounded" />
                    ) : <p className="text-sm text-gray-400">(empty message)</p>}

                    <div className="mt-3 space-y-2">
                      {sentInfo?.id === e.id ? (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                          ✓ Mail sent to <span className="font-medium">{sentInfo.to}</span>
                          <button onClick={() => setSentInfo(null)} className="ml-3 text-xs text-emerald-700 underline">Write another</button>
                        </div>
                      ) : (
                      <>
                      {/* Editable recipient — defaults to the other party, never our own mailbox. */}
                      <div className="flex items-center gap-2 text-xs bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                        <span className="text-gray-400 shrink-0">To:</span>
                        <input
                          value={replyTo} onChange={ev => setReplyTo(ev.target.value)}
                          className="flex-1 min-w-0 bg-transparent text-gray-800 font-medium focus:outline-none"
                        />
                        {e.replyName && <span className="text-gray-400 truncate shrink-0">({e.replyName})</span>}
                        {e.replyFrom && <span className="text-gray-400 shrink-0">· from {e.replyFrom}</span>}
                      </div>
                      <input
                        value={replyContext} onChange={ev => setReplyContext(ev.target.value)}
                        placeholder="Steer the AI (optional) — e.g. confirm the upgrade, offer the 12 Aug slot"
                        className="w-full text-xs px-3 py-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400"
                      />
                      {!showCc ? (
                        <button onClick={() => setShowCc(true)} className="text-xs text-gray-500 hover:text-gray-800">+ Add Cc / Bcc</button>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input value={replyCc} onChange={ev => setReplyCc(ev.target.value)} placeholder="Cc — comma-separated" className="w-full text-xs px-3 py-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400" />
                          <input value={replyBcc} onChange={ev => setReplyBcc(ev.target.value)} placeholder="Bcc — comma-separated" className="w-full text-xs px-3 py-2 rounded-md border border-gray-200 bg-gray-50 focus:outline-none focus:border-gray-400" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{drafting ? "Drafting an AI reply…" : (draftInfo || "AI-drafted reply — edit before sending")}</span>
                        <button onClick={() => draftReply(e)} disabled={drafting} className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-40">
                          {drafting ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />} Regenerate
                        </button>
                      </div>
                      <textarea value={replyText} onChange={ev => setReplyText(ev.target.value)} rows={6} placeholder={drafting ? "Drafting…" : `Reply to ${replyTo || e.fromEmail}…`} className="w-full text-sm px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-gray-500 resize-none" />
                      <div className="flex items-center gap-3">
                        <button onClick={() => sendReply(e)} disabled={sending || drafting || !replyText.trim() || !replyTo.trim()} className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-md bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-50">
                          {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} {sending ? "Sending…" : "Send reply"}
                        </button>
                        <button onClick={() => act(e.id, { read: !e.read })} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Reply size={13} className="rotate-180" /> Mark {e.read ? "unread" : "read"}</button>
                        <button onClick={() => act(e.id, { archived: true })} className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"><Archive size={13} /> Archive</button>
                        <button onClick={() => del(e.id)} className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 ml-auto"><Trash2 size={13} /> Delete</button>
                      </div>
                      </>
                      )}
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
