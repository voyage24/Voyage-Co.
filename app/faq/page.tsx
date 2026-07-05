import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import { getPageContent } from "@/lib/page-content";
import { getPageList } from "@/lib/page-lists";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Voyages & Co.",
  description: "Everything you need to know about booking, payments, changes, membership, gift cards and travelling with Voyages & Co.",
};

export default async function FaqPage() {
  const c = await getPageContent();
  const faqs = await getPageList("list.faq");

  // Group the flat list by section, preserving the order sections first appear.
  const groups: { title: string; faqs: { q: string; a: string }[] }[] = [];
  const index = new Map<string, number>();
  for (const it of faqs) {
    const title = it.section || "More";
    let gi = index.get(title);
    if (gi === undefined) { gi = groups.length; index.set(title, gi); groups.push({ title, faqs: [] }); }
    groups[gi].faqs.push({ q: it.q || "", a: it.a || "" });
  }
  const allFaqs = groups.flatMap(g => g.faqs);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <JsonLd data={faqJsonLd(allFaqs)} />
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("faq.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("faq.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("faq.intro")} <Link href="/contact" className="text-gold link-underline">Contact our concierge</Link>.</p>
      </div>

      <div className="space-y-10">
        {groups.map(group => (
          <section key={group.title}>
            <h2 className="font-serif text-2xl font-light text-ink mb-4">{group.title}</h2>
            <div className="divide-y divide-line border-y border-line">
              {group.faqs.map((f, i) => (
                <details key={i} className="group py-4">
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none text-ink font-medium">
                    {f.q}
                    <Plus size={16} className="text-gold shrink-0 mt-1 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 text-ink-muted font-light leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 bg-panel border border-line rounded-2xl p-8 text-center">
        <p className="font-serif text-xl font-light text-ink mb-2">{c("faq.ctaTitle")}</p>
        <p className="text-ink-muted font-light mb-5">{c("faq.ctaText")}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/contact" className="px-6 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">Contact us</Link>
          <Link href="/callback" className="px-6 py-3 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">Request a callback</Link>
        </div>
      </div>
    </div>
  );
}
