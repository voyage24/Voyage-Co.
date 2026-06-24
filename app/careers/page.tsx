"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";

const OPEN_ROLES = [
  { title: "Senior Travel Designer", department: "Journey Design", location: "Mumbai, India", type: "Full-time" },
  { title: "Concierge Manager — Middle East", department: "Guest Relations", location: "Dubai, UAE", type: "Full-time" },
  { title: "Private Aviation Specialist", department: "Flights", location: "Remote (India)", type: "Full-time" },
  { title: "Hotel Partnerships Lead", department: "Partnerships", location: "Mumbai, India", type: "Full-time" },
  { title: "Bespoke Journeys Cartographer", department: "Journey Design", location: "Remote", type: "Contract" },
  { title: "Guest Experience Associate", department: "Guest Relations", location: "Mumbai, India", type: "Full-time" },
  { title: "Content & Journal Editor", department: "Brand", location: "Remote", type: "Part-time" },
  { title: "Cruise & Rail Specialist", department: "Voyages", location: "Mumbai, India", type: "Full-time" },
];

const VALUES = [
  { title: "Obsessive Attention", body: "We sweat details no guest will ever notice — because the ones who do notice are the ones we're building this for." },
  { title: "Quiet Confidence", body: "Genuine luxury rarely announces itself. We work in a register that's calm, precise and entirely unflashy." },
  { title: "Worldwide Curiosity", body: "Every member of the team is, at heart, a traveller first — restless, well-read and always planning the next trip." },
];

export default function CareersPage() {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t("careers.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-5">{t("careers.title")}</h1>
        <p className="text-lg text-ink-muted max-w-xl mx-auto font-light leading-relaxed">
          {t("careers.intro")}
        </p>
      </div>

      {/* Values */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
        {VALUES.map(v => (
          <div key={v.title} className="bg-panel-soft border border-line rounded-xl p-6">
            <h3 className="font-serif text-lg font-light text-ink mb-2">{v.title}</h3>
            <p className="text-sm text-ink-muted font-light leading-relaxed">{v.body}</p>
          </div>
        ))}
      </div>

      {/* Open roles */}
      <div className="mb-12">
        <h2 className="font-serif text-2xl font-light text-ink mb-6">{t("careers.openPositions")}</h2>
        <div className="space-y-3">
          {OPEN_ROLES.map(role => (
            <a
              key={role.title}
              href={`mailto:hello@voyagesco.com?subject=${encodeURIComponent(`Application: ${role.title}`)}`}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 bg-panel border border-line rounded-xl hover:border-gold/40 hover:shadow-card transition-all"
            >
              <div>
                <h3 className="font-serif text-base font-light text-ink">{role.title}</h3>
                <p className="text-xs text-ink-faint font-light mt-0.5">{role.department} · {role.location}</p>
              </div>
              <span className="text-[10px] tracking-[0.16em] uppercase text-ink-muted border border-line px-3 py-1.5 rounded-full self-start sm:self-auto shrink-0">
                {role.type}
              </span>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-panel-soft rounded-2xl p-10 text-center border border-line">
        <h2 className="font-serif text-2xl font-light text-ink mb-2">{t("careers.notSeeRole")}</h2>
        <p className="text-sm text-ink-muted mb-5 font-light">
          {t("careers.notSeeRoleDesc")}
        </p>
        <a href="mailto:hello@voyagesco.com" className="inline-block text-base font-medium text-gold link-underline">
          hello@voyagesco.com
        </a>
      </div>
    </div>
  );
}
