"use client";

import { useLanguage } from "@/components/providers/LanguageProvider";
import { useContent } from "@/components/providers/ContentProvider";

export default function CareersPage() {
  const { t } = useLanguage();
  const c = useContent();

  const OPEN_ROLES = [
    { title: t("careers.role1"), department: t("careers.deptJourneyDesign"), location: "Mumbai, India", type: t("careers.typeFullTime") },
    { title: t("careers.role2"), department: t("careers.deptGuestRelations"), location: "Dubai, UAE", type: t("careers.typeFullTime") },
    { title: t("careers.role3"), department: t("careers.deptFlights"), location: t("careers.locRemoteIndia"), type: t("careers.typeFullTime") },
    { title: t("careers.role4"), department: t("careers.deptPartnerships"), location: "Mumbai, India", type: t("careers.typeFullTime") },
    { title: t("careers.role5"), department: t("careers.deptJourneyDesign"), location: t("careers.locRemote"), type: t("careers.typeContract") },
    { title: t("careers.role6"), department: t("careers.deptGuestRelations"), location: "Mumbai, India", type: t("careers.typeFullTime") },
    { title: t("careers.role7"), department: t("careers.deptBrand"), location: t("careers.locRemote"), type: t("careers.typePartTime") },
    { title: t("careers.role8"), department: t("careers.deptVoyages"), location: "Mumbai, India", type: t("careers.typeFullTime") },
  ];

  const VALUES = [
    { title: t("careers.value1Title"), body: t("careers.value1Body") },
    { title: t("careers.value2Title"), body: t("careers.value2Body") },
    { title: t("careers.value3Title"), body: t("careers.value3Body") },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Hero */}
      <div className="text-center mb-16">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{c("careers.eyebrow") || t("careers.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-5">{c("careers.title") || t("careers.title")}</h1>
        <p className="text-lg text-ink-muted max-w-xl mx-auto font-light leading-relaxed">
          {c("careers.intro") || t("careers.intro")}
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
