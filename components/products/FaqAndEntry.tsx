import { Plus } from "lucide-react";

type Faq = { q: string; a: string };

// Renders the "Entry & travel requirements" note and an FAQ accordion on a
// product page. Uses native <details> so it works without client JS.
export default function FaqAndEntry({ faqs, entryRequirements }: { faqs?: Faq[] | null; entryRequirements?: string | null }) {
  const list = Array.isArray(faqs) ? faqs.filter(f => f?.q && f?.a) : [];
  if (list.length === 0 && !entryRequirements?.trim()) return null;

  return (
    <div className="mt-10 space-y-8">
      {entryRequirements?.trim() && (
        <section>
          <h2 className="font-serif text-2xl font-light text-ink mb-3">Entry &amp; travel requirements</h2>
          <p className="text-ink-muted font-light leading-relaxed whitespace-pre-line">{entryRequirements}</p>
        </section>
      )}

      {list.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-light text-ink mb-4">Frequently asked</h2>
          <div className="divide-y divide-line border-y border-line">
            {list.map((f, i) => (
              <details key={i} className="group py-4">
                <summary className="flex items-center justify-between cursor-pointer list-none text-ink font-medium">
                  {f.q}
                  <Plus size={16} className="text-gold shrink-0 transition-transform group-open:rotate-45" />
                </summary>
                <p className="mt-3 text-ink-muted font-light leading-relaxed whitespace-pre-line">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
