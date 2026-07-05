import Link from "next/link";
import { Plus } from "lucide-react";

type Item = { id: string; data: Record<string, string> };

// A short FAQ block on the homepage, managed via the Homepage FAQ collection.
// Renders nothing until at least one question is added.
export default function HomeFaq({ items }: { items: Item[] }) {
  if (!items.length) return null;
  return (
    <section className="max-w-3xl mx-auto px-6 lg:px-12 py-16 sm:py-20">
      <h2 className="font-serif text-3xl sm:text-4xl font-light text-ink mb-8 text-center">Frequently asked</h2>
      <div className="divide-y divide-line border-y border-line">
        {items.map(f => (
          <details key={f.id} className="group py-4">
            <summary className="flex items-start justify-between gap-4 cursor-pointer list-none text-ink font-medium">
              {f.data.q}
              <Plus size={16} className="text-gold shrink-0 mt-1 transition-transform group-open:rotate-45" />
            </summary>
            <p className="mt-3 text-ink-muted font-light leading-relaxed">{f.data.a}</p>
          </details>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link href="/faq" className="text-xs tracking-[0.14em] uppercase text-gold link-underline">All questions →</Link>
      </div>
    </section>
  );
}
