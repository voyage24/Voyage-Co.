import type { Metadata } from "next";
import RequestForm from "@/components/tools/RequestForm";
import Reveal from "@/components/ui/Reveal";
import { getPageContent } from "@/lib/page-content";
import { getPageList } from "@/lib/page-lists";
import { resolveIcon } from "@/lib/icon-map";

export const metadata: Metadata = {
  title: "Group Booking — Voyages & Co.",
  description: "Bespoke group travel for weddings, celebrations, corporate incentives and multi-generational journeys — planned end to end by our concierge.",
};

export default async function GroupPage() {
  const c = await getPageContent();
  const highlights = await getPageList("list.groupHighlights");
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("group.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-4">{c("group.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("group.intro")}</p>
      </div>

      <Reveal soft className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-14">
        {highlights.map((h, i) => {
          const Icon = resolveIcon(h.icon);
          return (
            <div key={`${h.title}-${i}`} className="bg-panel border border-line rounded-2xl p-6">
              <Icon size={22} className="text-gold mb-4" />
              <h3 className="font-serif text-lg font-light text-ink mb-1.5">{h.title}</h3>
              <p className="text-sm text-ink-muted font-light leading-relaxed">{h.text}</p>
            </div>
          );
        })}
      </Reveal>

      <RequestForm
        endpoint="/api/group-request"
        title="Tell us about your group"
        submitLabel="Request a group proposal"
        successText="Thank you — our group-travel concierge will be in touch shortly to craft your proposal."
        fields={[
          { key: "groupType", label: "Occasion", type: "select", options: ["Wedding / celebration", "Corporate / incentive", "Family / multi-generational", "Friends / special interest", "Other"] },
          { key: "groupSize", label: "Approx. group size", placeholder: "e.g. 24 guests" },
          { key: "destination", label: "Destination(s)", placeholder: "e.g. Rajasthan & Kerala" },
          { key: "dates", label: "Travel dates", placeholder: "e.g. March 2027, 6 nights" },
          { key: "details", label: "Anything else", type: "textarea", placeholder: "Budget, must-haves, special requests…" },
        ]}
      />
    </div>
  );
}
