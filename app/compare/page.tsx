"use client";

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { useCompare, removeCompare, clearCompare, type CompareItem } from "@/lib/compare";
import { useContent } from "@/components/providers/ContentProvider";

const TYPE_LABEL: Record<string, string> = {
  hotel: "Stays", cruise: "Cruises", package: "Journeys", experience: "Experiences",
};

function Group({ type, items }: { type: string; items: CompareItem[] }) {
  // Union of attribute keys, preserving first-seen order.
  const keys: string[] = [];
  items.forEach(it => Object.keys(it.attrs ?? {}).forEach(k => { if (!keys.includes(k)) keys.push(k); }));

  return (
    <div className="mb-12">
      <h2 className="font-serif text-2xl font-light text-ink mb-4">{TYPE_LABEL[type] ?? type}</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse min-w-[520px]">
          <thead>
            <tr>
              <th className="w-32" />
              {items.map(it => (
                <th key={it.id} className="p-3 align-top text-left">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-2">
                    <Image src={it.image} alt={it.title} fill sizes="240px" className="object-cover" />
                    <button onClick={() => removeCompare(it.type, it.id)} className="absolute top-1.5 right-1.5 bg-vc-950/70 text-white rounded-full p-1" aria-label="Remove">
                      <X size={13} />
                    </button>
                  </div>
                  <Link href={it.href} className="text-sm font-medium text-ink link-underline">{it.title}</Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keys.map(k => (
              <tr key={k} className="border-t border-line">
                <td className="p-3 text-[11px] tracking-[0.12em] uppercase text-ink-faint align-top">{k}</td>
                {items.map(it => (
                  <td key={it.id} className="p-3 text-sm text-ink-muted font-light align-top">{it.attrs?.[k] ?? "—"}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ComparePage() {
  const c = useContent();
  const list = useCompare();
  const types = Array.from(new Set(list.map(i => i.type)));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-2">{c("compare.eyebrow") || "Compare"}</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{c("compare.title") || "Side by side"}</h1>
        </div>
        {list.length > 0 && <button onClick={clearCompare} className="text-xs tracking-[0.12em] uppercase text-ink-muted hover:text-ink">Clear all</button>}
      </div>

      {list.length === 0 ? (
        <div className="border border-dashed border-line rounded-2xl p-12 text-center">
          <p className="text-ink-muted font-light mb-4">Nothing to compare yet. Add items with the “Compare” button on any stay, journey, experience or cruise.</p>
          <Link href="/hotels" className="text-gold link-underline text-sm">Browse stays →</Link>
        </div>
      ) : (
        types.map(type => <Group key={type} type={type} items={list.filter(i => i.type === type)} />)
      )}
    </div>
  );
}
