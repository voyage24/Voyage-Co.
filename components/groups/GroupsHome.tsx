"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Users, Plus, ArrowRight, Loader2 } from "lucide-react";

type Group = { id: string; title: string; destination: string | null; members: number; isOwner: boolean };

export default function GroupsHome() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => { fetch("/api/groups").then(r => r.json()).then(d => setGroups(d.groups ?? [])).catch(() => setGroups([])); }, []);

  const create = async () => {
    if (creating || !title.trim()) return;
    setCreating(true);
    const res = await fetch("/api/groups", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, destination }) });
    const d = await res.json().catch(() => ({}));
    setCreating(false);
    if (d.ok) router.push(`/groups/${d.id}`);
  };

  return (
    <div>
      {/* Create */}
      {open ? (
        <div className="rounded-2xl border border-gold/30 bg-panel-soft p-5 mb-6">
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Trip name — e.g. Goa reunion 2026" className="w-full px-4 py-3 rounded-lg bg-panel border border-line text-ink text-sm focus:outline-none focus:border-gold mb-3" />
          <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Destination (optional)" className="w-full px-4 py-3 rounded-lg bg-panel border border-line text-ink text-sm focus:outline-none focus:border-gold mb-4" />
          <div className="flex gap-2">
            <button onClick={create} disabled={creating || !title.trim()} className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-page text-xs tracking-[0.14em] uppercase rounded-sm hover:bg-ink/90 disabled:opacity-50">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Create trip
            </button>
            <button onClick={() => setOpen(false)} className="px-5 py-2.5 border border-line text-ink-muted text-xs tracking-[0.14em] uppercase rounded-sm hover:text-ink">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="w-full flex items-center gap-3 rounded-2xl border border-dashed border-line-strong p-5 mb-6 text-left hover:border-gold transition-colors group">
          <span className="w-11 h-11 rounded-full bg-gold/15 text-gold flex items-center justify-center shrink-0"><Plus size={20} /></span>
          <span><span className="block text-sm font-medium text-ink">Start a group trip</span><span className="block text-xs text-ink-muted">Invite friends or family and plan together</span></span>
          <ArrowRight size={18} className="text-gold ml-auto group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {/* List */}
      {groups === null ? (
        <div className="py-12 text-center"><Loader2 size={22} className="animate-spin text-gold mx-auto" /></div>
      ) : groups.length === 0 ? (
        <p className="text-ink-muted font-light text-center py-8">No group trips yet — start one above, or open an invite link a friend shared.</p>
      ) : (
        <div className="space-y-3">
          {groups.map(g => (
            <Link key={g.id} href={`/groups/${g.id}`} className="flex items-center gap-4 rounded-2xl border border-line bg-panel p-5 hover:border-gold/40 transition-colors">
              <span className="w-11 h-11 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0"><Users size={19} /></span>
              <span className="min-w-0 flex-1">
                <span className="block font-serif text-lg font-light text-ink truncate">{g.title}</span>
                <span className="block text-xs text-ink-faint mt-0.5">{g.destination ? `${g.destination} · ` : ""}{g.members} {g.members === 1 ? "member" : "members"}{g.isOwner ? " · You organise" : ""}</span>
              </span>
              <ArrowRight size={18} className="text-gold shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
