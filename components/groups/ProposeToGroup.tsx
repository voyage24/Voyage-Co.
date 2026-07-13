"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Users, Check, Loader2, Plus } from "lucide-react";

type Group = { id: string; title: string };

// Propose a stay/experience to one of the member's group trips, so the group can
// vote on it — the same shortlist the Smart Trip Planner seeds. Mirrors the
// inline style of AddToItineraryButton.
export default function ProposeToGroup({ type, id, title, image, href, price, label }: {
  type: string; id: string; title: string; image?: string; href: string; price?: number; label?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [added, setAdded] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggle = () => {
    const next = !open; setOpen(next);
    if (next && groups === null) {
      fetch("/api/groups").then(r => r.json()).then(d => { setLoggedIn(!!d.loggedIn); setGroups(d.groups ?? []); }).catch(() => { setGroups([]); setLoggedIn(false); });
    }
  };

  const propose = async (groupId: string) => {
    setBusy(groupId);
    await fetch(`/api/groups/${groupId}/shortlist`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id, title, image, href, price }) }).catch(() => {});
    setBusy(null); setAdded(a => ({ ...a, [groupId]: true }));
  };

  const nextPath = typeof window !== "undefined" ? window.location.pathname : "/";

  return (
    <div className="relative inline-flex" ref={ref}>
      <button type="button" onClick={toggle} aria-expanded={open}
        className={`inline-flex items-center gap-1.5 text-xs tracking-[0.1em] uppercase transition-colors ${open ? "text-gold" : "text-ink-muted hover:text-ink"}`}>
        <Users size={15} /> {label && "Propose to group"}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 mt-2 w-60 bg-panel-raised border border-line shadow-luxury rounded-lg py-1.5">
          {groups === null ? (
            <div className="px-4 py-3 text-center"><Loader2 size={16} className="animate-spin text-gold mx-auto" /></div>
          ) : loggedIn === false ? (
            <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="block px-4 py-2.5 text-sm text-ink-muted hover:text-ink hover:bg-panel-soft">Sign in to propose →</Link>
          ) : groups.length === 0 ? (
            <Link href="/groups" className="flex items-center gap-2 px-4 py-2.5 text-sm text-ink-muted hover:text-ink hover:bg-panel-soft"><Plus size={14} className="text-gold" /> Start a group trip</Link>
          ) : (
            <>
              <p className="px-4 py-1.5 text-[10px] tracking-[0.16em] uppercase text-ink-faint">Add to a group trip</p>
              {groups.map(g => (
                <button key={g.id} onClick={() => propose(g.id)} disabled={busy === g.id || added[g.id]} className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-ink hover:bg-panel-soft disabled:opacity-70 text-left">
                  <span className="truncate">{g.title}</span>
                  {added[g.id] ? <Check size={15} className="text-gold shrink-0" /> : busy === g.id ? <Loader2 size={14} className="animate-spin shrink-0" /> : null}
                </button>
              ))}
              <Link href="/groups" className="flex items-center gap-2 px-4 py-2.5 text-xs text-gold hover:bg-panel-soft border-t border-line mt-1"><Plus size={13} /> New group trip</Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
