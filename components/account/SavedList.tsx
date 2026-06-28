"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

export type SavedRow = { id: string; type: string; itemId: string; itemTitle: string; image: string | null; href: string };

export default function SavedList({ items }: { items: SavedRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  const remove = async (it: SavedRow) => {
    setBusy(it.id);
    await fetch("/api/account/saved", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: it.type, itemId: it.itemId }),
    });
    setBusy(null);
    router.refresh();
  };

  if (items.length === 0) {
    return <p className="text-ink-muted font-light text-sm">Nothing saved yet. Tap the heart on any stay, journey, experience or cruise to save it here.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {items.map(it => (
        <div key={it.id} className="flex items-center gap-3 bg-panel border border-line rounded-xl p-3">
          <Link href={it.href} className="relative w-16 h-16 shrink-0 overflow-hidden rounded-md border border-line">
            {it.image && <Image src={it.image} alt="" fill sizes="64px" className="object-cover" />}
          </Link>
          <Link href={it.href} className="min-w-0 flex-1">
            <span className="block text-[10px] tracking-[0.16em] uppercase text-gold">{it.type}</span>
            <span className="block text-sm font-light text-ink truncate">{it.itemTitle}</span>
          </Link>
          <button onClick={() => remove(it)} disabled={busy === it.id} aria-label="Remove" className="text-ink-faint hover:text-ink shrink-0 disabled:opacity-50">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
