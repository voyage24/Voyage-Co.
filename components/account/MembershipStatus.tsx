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
    <div className="bg-gradient-to-br from-[#3c2817] to-[#1a0c08] text-[#f4f0e9] rounded-2xl p-6 max-w-md mx-auto ring-1 ring-gold/20">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] tracking-[0.2em] uppercase text-white/75">Membership</p>
        <span className="text-[10px] tracking-[0.18em] uppercase border border-gold/70 bg-gold/10 text-[#f0dca8] px-2.5 py-1 rounded-full capitalize">{me.tier}</span>
      </div>
      <p className="font-serif text-4xl font-light text-[#efd9a4] mb-1">{me.points.toLocaleString("en-IN")}</p>
      <p className="text-xs text-white/75 mb-4">points</p>
      {next ? (
        <>
          <div className="h-1.5 bg-white/15 rounded-full overflow-hidden mb-1.5"><div className="h-full bg-gold rounded-full" style={{ width: `${pct}%` }} /></div>
          <p className="text-xs text-white/85">{(next.at - me.points).toLocaleString("en-IN")} points to {next.name}</p>
        </>
      ) : (
        <p className="text-xs text-white/85">You&apos;ve reached our highest tier. Thank you.</p>
      )}
    </div>
  );
}
