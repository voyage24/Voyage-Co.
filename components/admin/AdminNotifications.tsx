"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import type { AdminNotifications } from "@/lib/admin/notifications";

function ago(iso: string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const SEEN_KEY = "admin-notifs-seen";

export default function AdminNotifications({ data }: { data: AdminNotifications }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const total = data.count + data.reviews;

  // Badge = only what's NEW since the bell was last opened (per this browser),
  // so opening it clears the count and new items make it reappear.
  const [seen, setSeen] = useState<{ at: string; reviews: number } | null>(null);
  useEffect(() => {
    try { const raw = localStorage.getItem(SEEN_KEY); if (raw) setSeen(JSON.parse(raw)); } catch { /* ignore */ }
  }, []);

  const newItems = data.items.filter(n => !seen || new Date(n.at) > new Date(seen.at)).length;
  const newReviews = seen ? Math.max(0, data.reviews - seen.reviews) : data.reviews;
  const badge = newItems + newReviews;

  const markSeen = () => {
    const s = { at: new Date().toISOString(), reviews: data.reviews };
    setSeen(s);
    try { localStorage.setItem(SEEN_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  };

  const toggle = () => setOpen(o => { const next = !o; if (next) markSeen(); return next; });

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button onClick={toggle} aria-label="Notifications" className="relative text-gray-500 hover:text-gray-900 p-1">
        <Bell size={18} />
        {badge > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">{badge > 99 ? "99+" : badge}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[92vw] bg-white border border-gray-200 rounded-lg shadow-lg z-[60] overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">Notifications</span>
            {total === 0 && <span className="text-xs text-gray-400">All clear</span>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {data.reviews > 0 && (
              <Link href="/admin/reviews" onClick={() => setOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50">
                <span className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 shrink-0">Reviews</span>
                <span className="text-sm text-gray-800">{data.reviews} {data.reviews === 1 ? "review" : "reviews"} to moderate</span>
              </Link>
            )}
            {data.items.length === 0 && data.reviews === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">Nothing needs attention.</p>
            ) : (
              data.items.map((n, i) => (
                <Link key={i} href={n.href} onClick={() => setOpen(false)} className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-0">
                  <span className={`text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded shrink-0 ${n.type === "Booking" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>{n.type}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-gray-900 truncate">{n.title}</span>
                    <span className="block text-xs text-gray-400 truncate">{n.subtitle} · {ago(n.at)}</span>
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
