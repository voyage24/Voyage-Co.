import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";
import { getPageContent } from "@/lib/page-content";
import { getPageList } from "@/lib/page-lists";
import { resolveIcon } from "@/lib/icon-map";

export const metadata: Metadata = {
  title: "Trip Tools & Travel Services — Voyages & Co.",
  description: "Currency converter, smart packing list, travel checklist, visa assistance and travel insurance — everything for a seamless journey.",
};

export default async function ToolsHubPage() {
  const c = await getPageContent();
  const tools = await getPageList("list.tools");
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("tools.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("tools.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("tools.intro")}</p>
      </div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tl, i) => {
          const Icon = resolveIcon(tl.icon);
          return (
            <Link key={`${tl.href}-${i}`} href={tl.href || "#"} className="group bg-panel border border-line rounded-2xl p-6 hover:border-gold/40 hover:-translate-y-1 transition-all">
              <Icon size={22} className="text-gold mb-4" />
              <h3 className="font-serif text-lg font-light text-ink mb-1.5">{tl.title}</h3>
              <p className="text-sm text-ink-muted font-light leading-relaxed">{tl.text}</p>
            </Link>
          );
        })}
      </Reveal>
    </div>
  );
}
