"use client";

import { useEffect, useState } from "react";

const NEXT: Record<string, { name: string; at: number } | null> = {
  member: { name: "Silver", at: 1500 },
  silver: { name: "Gold", at: 5000 },
  gold: null,
};

export default function MembershipStatus() {
  const [me, setMe] = useState<{ points: number; tier: string } | null>(null);
  useEffect(() => { fetch("/api/account/me").then(r => r.json()).then(d => { if (d.customer) setMe({ points: d.customer.points ?? 0, tier: d.customer.tier ?? "member" }); }).catch(() => {}); }, []);
  if (!me) return null;

  const next = NEXT[me.tier];
  const pct = next ? Math.min(100, Math.round((me.points / next.at) * 100)) : 100;

  return (
    <div className="bg-gradient-to-br from-[#2b1d12] to-[#1c0a0d] text-[#f4f0e9] rounded-2xl p-6 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/50">Membership</p>
        <span className="text-[10px] tracking-[0.18em] uppercase border border-gold/50 text-gold px-2.5 py-1 rounded-full capitalize">{me.tier}</span>
      </div>
      <p className="font-serif text-4xl font-light text-gold mb-1">{me.points.toLocaleString("en-IN")}</p>
      <p className="text-xs text-white/50 mb-4">points</p>
      {next ? (
        <>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1.5"><div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} /></div>
          <p className="text-xs text-white/60">{(next.at - me.points).toLocaleString("en-IN")} points to {next.name}</p>
        </>
      ) : (
        <p className="text-xs text-white/60">You&apos;ve reached our highest tier. Thank you.</p>
      )}
    </div>
  );
}
