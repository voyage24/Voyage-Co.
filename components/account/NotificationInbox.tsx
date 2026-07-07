"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

type Note = { id: string; title: string; body: string; url: string | null; read: boolean; createdAt: string };

// In-app inbox mirroring push notifications, so members can revisit booking and
// flight updates they missed. Renders nothing until there's something to show.
export default function NotificationInbox() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);

  const load = () => fetch("/api/account/notifications").then(r => r.json()).then(d => { if (d.loggedIn) { setNotes(d.notifications); setUnread(d.unread); } }).catch(() => {});
  useEffect(() => { load(); }, []);

  const markAll = async () => {
    setUnread(0); setNotes(ns => ns.map(n => ({ ...n, read: true })));
    try { (navigator as Navigator & { clearAppBadge?: () => Promise<void> }).clearAppBadge?.(); } catch { /* unsupported */ }
    try { window.dispatchEvent(new Event("vc-notifications-read")); } catch { /* ignore */ }
    await fetch("/api/account/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
  };

  if (notes.length === 0) return null;

  return (
    <div className="bg-panel border border-line rounded-2xl p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gold" />
          <h2 className="font-serif text-xl font-light text-ink">Notifications</h2>
          {unread > 0 && <span className="text-[10px] bg-gold text-vc-950 rounded-full px-2 py-0.5 font-medium">{unread} new</span>}
        </div>
        {!open ? (
          <button onClick={() => setOpen(true)} className="text-xs tracking-[0.12em] uppercase text-gold link-underline">View all</button>
        ) : unread > 0 && (
          <button onClick={markAll} className="text-xs tracking-[0.12em] uppercase text-ink-muted link-underline">Mark all read</button>
        )}
      </div>

      <ul className="divide-y divide-line">
        {(open ? notes : notes.slice(0, 3)).map(n => {
          const inner = (
            <div className={`py-3 ${!n.read ? "" : "opacity-70"}`}>
              <div className="flex items-start gap-2">
                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />}
                <div className="min-w-0">
                  <p className="text-sm text-ink">{n.title}</p>
                  <p className="text-xs text-ink-muted font-light">{n.body}</p>
                  <p className="text-[11px] text-ink-faint mt-0.5">{new Date(n.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            </div>
          );
          return <li key={n.id}>{n.url ? <Link href={n.url}>{inner}</Link> : inner}</li>;
        })}
      </ul>
    </div>
  );
}
