import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

// ── Editable static-page content ────────────────────────────────────────────
// Each info/marketing page's copy is registered here with its default (the
// text as originally shipped). The admin can override any field; pages read
// their copy through getPageContent() and fall back to these defaults.

export type ContentField = { key: string; label: string; type?: "text" | "textarea" };
export type ContentPage = { page: string; label: string; path: string; fields: ContentField[] };

export const PAGE_REGISTRY: ContentPage[] = [
  {
    page: "services", label: "Concierge Services", path: "/services",
    fields: [
      { key: "services.eyebrow", label: "Eyebrow" },
      { key: "services.title", label: "Title" },
      { key: "services.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "visa", label: "Visa Services", path: "/visa",
    fields: [
      { key: "visa.eyebrow", label: "Eyebrow" },
      { key: "visa.title", label: "Title" },
      { key: "visa.intro", label: "Intro", type: "textarea" },
      { key: "visa.footnote", label: "Footnote / disclaimer", type: "textarea" },
    ],
  },
  {
    page: "insurance", label: "Travel Insurance", path: "/insurance",
    fields: [
      { key: "insurance.eyebrow", label: "Eyebrow" },
      { key: "insurance.title", label: "Title" },
      { key: "insurance.intro", label: "Intro", type: "textarea" },
      { key: "insurance.footnote", label: "Footnote / disclaimer", type: "textarea" },
    ],
  },
  {
    page: "membership", label: "Membership", path: "/membership",
    fields: [
      { key: "membership.eyebrow", label: "Eyebrow" },
      { key: "membership.title", label: "Title" },
      { key: "membership.intro", label: "Intro", type: "textarea" },
    ],
  },
];

export const PAGE_DEFAULTS: Record<string, string> = {
  "services.eyebrow": "Concierge",
  "services.title": "Anything, arranged.",
  "services.intro": "Beyond the journey itself, our concierge orchestrates every detail — the transfers, the tables, the moments that turn a trip into a story.",

  "visa.eyebrow": "Travel Services",
  "visa.title": "Visa assistance",
  "visa.intro": "Entry requirements can be daunting. Our team demystifies the paperwork and supports you from checklist to approval — for tourist, business and transit visas worldwide.",
  "visa.footnote": "Requirements vary by nationality and change often. This service provides guidance and application support; issuance is always at the discretion of the relevant embassy or consulate.",

  "insurance.eyebrow": "Travel Services",
  "insurance.title": "Travel insurance",
  "insurance.intro": "Journey with confidence. We'll match you to cover that fits your trip — from a weekend away to a months-long expedition.",
  "insurance.footnote": "Plans are illustrative; final terms, limits and premiums are confirmed on your quote. Cover is arranged through regulated insurance partners — pre-existing conditions and exclusions may apply.",

  "membership.eyebrow": "Membership",
  "membership.title": "Travel, rewarded.",
  "membership.intro": "Earn one point for every ₹1,000 spent on confirmed journeys. As your points grow, so do your privileges.",
};

export const PAGE_CONTENT_KEYS = new Set(Object.keys(PAGE_DEFAULTS));

const loadPageContent = unstable_cache(
  async (): Promise<Record<string, string>> => {
    const out: Record<string, string> = {};
    try {
      const rows = await prisma.pageContent.findMany();
      for (const r of rows) if (r.value != null) out[r.key] = r.value;
    } catch {
      // table not migrated yet → defaults only
    }
    return out;
  },
  ["page-content"],
  { revalidate: 300, tags: ["page-content"] },
);

// Returns a lookup: override → registry default → "". Cached per request.
export const getPageContent = cache(async (): Promise<(key: string) => string> => {
  const overrides = await loadPageContent();
  return (key: string) => overrides[key] ?? PAGE_DEFAULTS[key] ?? "";
});
