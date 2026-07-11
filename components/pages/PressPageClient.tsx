"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent, useContentList } from "@/components/providers/ContentProvider";

// Facts are computed live on the server (founded year, destinations curated,
// average itinerary lead time) so they stay honest and update as the brand
// grows. Press quotes are only shown when real ones have been added via the CMS
// (list.pressMentions) — a newly launched maison has no press file to invent.
export default function PressPageClient({
  founded, destinations, leadTime,
}: {
  founded: string;
  destinations: string;
  leadTime: string;
}) {
  const { t } = useLanguage();
  const c = useContent();
  const mentionsOverride = useContentList("list.pressMentions");
  const factsOverride = useContentList("list.pressFacts");

  const mentions = mentionsOverride ?? [];

  const FACTS = [
    { label: t("press.factLabel1"), value: founded },
    { label: t("press.factLabel2"), value: c("press.hq") || "Pune, India" },
    { label: t("press.factLabel3"), value: destinations },
    { label: t("press.factLabel4"), value: leadTime },
  ];
  const facts = factsOverride ?? FACTS;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("press.eyebrow") || t("press.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("press.title") || t("press.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto leading-relaxed">
          {c("press.intro") || t("press.intro")}
        </p>
      </div>

      {/* As featured in — only when real coverage exists (owner adds via CMS) */}
      {mentions.length > 0 ? (
        <div className="mb-16">
          <h2 className="font-serif text-2xl font-light text-ink mb-6 text-center">{t("press.asFeaturedIn")}</h2>
          <div className="space-y-4">
            {mentions.map((m, i) => (
              <div key={`${m.outlet}-${i}`} className="bg-panel border border-line rounded-xl p-6">
                <p className="text-base text-ink-muted font-light italic leading-relaxed mb-3">&ldquo;{m.quote}&rdquo;</p>
                <div className="flex items-center gap-2 text-xs text-ink-faint font-light">
                  <span className="text-gold font-medium tracking-[0.08em] uppercase">{m.outlet}</span>
                  {m.date && <><span>·</span><span>{m.date}</span></>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-16 bg-panel border border-line rounded-2xl p-8 sm:p-10 text-center">
          <p className="text-[11px] tracking-[0.2em] uppercase text-gold mb-3">Newly launched · {founded}</p>
          <p className="text-ink-muted font-light max-w-xl mx-auto leading-relaxed">
            Voyages &amp; Co. is a young maison, and our press file is just beginning. Journalists and editors
            writing about luxury and bespoke travel — we&apos;d be delighted to share our story, founders and craft.
          </p>
        </div>
      )}

      {/* Quick facts — computed live so they stay accurate */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-16">
        {facts.map((f, i) => (
          <div key={`${f.label}-${i}`} className="text-center bg-panel-soft border border-line rounded-xl p-5">
            <p className="font-serif text-xl font-light text-ink mb-1">{f.value}</p>
            <p className="text-[10px] tracking-[0.14em] uppercase text-ink-faint font-light">{f.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-panel-soft border border-line rounded-2xl p-10 text-center">
        <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("press.mediaEnquiries")}</h2>
        <p className="text-sm text-ink-muted mb-5 font-light">
          {t("press.mediaEnquiriesDesc")}
        </p>
        <a href="mailto:hello@voyagesco.com" className="inline-block text-base font-medium text-gold link-underline">
          hello@voyagesco.com
        </a>
      </div>
    </div>
  );
}
