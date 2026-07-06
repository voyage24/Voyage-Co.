"use client";

import { useEffect, useState } from "react";
import { UserCheck } from "lucide-react";

type Traveller = { id: string; fullName: string };

// If the signed-in member has saved travellers, offer a quick pick to fill the
// name field. Renders nothing for guests or members with no saved travellers.
export default function SavedTravellerPicker({ onPick }: { onPick: (name: string) => void }) {
  const [list, setList] = useState<Traveller[]>([]);

  useEffect(() => {
    fetch("/api/account/travellers")
      .then(r => r.json())
      .then(d => { if (d.loggedIn) setList(d.travellers || []); })
      .catch(() => {});
  }, []);

  if (list.length === 0) return null;

  return (
    <label className="inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-gold cursor-pointer">
      <UserCheck size={14} />
      <select
        onChange={e => { const t = list.find(x => x.id === e.target.value); if (t) onPick(t.fullName); e.target.value = ""; }}
        defaultValue=""
        className="bg-transparent text-gold uppercase tracking-[0.12em] focus:outline-none cursor-pointer"
      >
        <option value="" disabled>Use saved traveller</option>
        {list.map(t => <option key={t.id} value={t.id} className="text-ink normal-case tracking-normal">{t.fullName}</option>)}
      </select>
    </label>
  );
}
