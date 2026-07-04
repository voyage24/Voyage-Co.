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
  {
    page: "faq", label: "FAQ", path: "/faq",
    fields: [
      { key: "faq.eyebrow", label: "Eyebrow" },
      { key: "faq.title", label: "Title" },
      { key: "faq.intro", label: "Intro (before the contact link)", type: "textarea" },
      { key: "faq.ctaTitle", label: "Bottom card — title" },
      { key: "faq.ctaText", label: "Bottom card — text" },
    ],
  },
  {
    page: "offers", label: "Offers", path: "/offers",
    fields: [
      { key: "offers.eyebrow", label: "Eyebrow" },
      { key: "offers.title", label: "Title" },
      { key: "offers.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "callback", label: "Request a Callback", path: "/callback",
    fields: [
      { key: "callback.eyebrow", label: "Eyebrow" },
      { key: "callback.title", label: "Title" },
      { key: "callback.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "about", label: "About", path: "/about",
    fields: [
      { key: "about.eyebrow", label: "Eyebrow" },
      { key: "about.title", label: "Title" },
      { key: "about.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "plan", label: "Plan Your Journey", path: "/plan",
    fields: [
      { key: "plan.eyebrow", label: "Eyebrow" },
      { key: "plan.title", label: "Title" },
      { key: "plan.subtitle", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "explore", label: "Explore", path: "/explore",
    fields: [
      { key: "explore.eyebrow", label: "Eyebrow" },
      { key: "explore.title", label: "Title" },
      { key: "explore.subtitle", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "careers", label: "Careers", path: "/careers",
    fields: [
      { key: "careers.eyebrow", label: "Eyebrow" },
      { key: "careers.title", label: "Title" },
      { key: "careers.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "partners", label: "Partners", path: "/partners",
    fields: [
      { key: "partners.eyebrow", label: "Eyebrow" },
      { key: "partners.title", label: "Title" },
      { key: "partners.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "press", label: "Press", path: "/press",
    fields: [
      { key: "press.eyebrow", label: "Eyebrow" },
      { key: "press.title", label: "Title" },
      { key: "press.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "help", label: "Help Centre", path: "/help",
    fields: [
      { key: "help.eyebrow", label: "Eyebrow" },
      { key: "help.title", label: "Title" },
      { key: "help.subtitle", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "contact", label: "Contact / Concierge", path: "/contact",
    fields: [
      { key: "contact.eyebrow", label: "Eyebrow" },
      { key: "contact.title", label: "Title" },
      { key: "contact.subtitle", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "terms", label: "Terms of Service", path: "/terms",
    fields: [
      { key: "terms.eyebrow", label: "Eyebrow" },
      { key: "terms.title", label: "Title" },
      { key: "terms.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "privacy", label: "Privacy Policy", path: "/privacy",
    fields: [
      { key: "privacy.eyebrow", label: "Eyebrow" },
      { key: "privacy.title", label: "Title" },
      { key: "privacy.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "cancellations", label: "Cancellation Policy", path: "/cancellations",
    fields: [
      { key: "cancellations.eyebrow", label: "Eyebrow" },
      { key: "cancellations.title", label: "Title" },
    ],
  },
  {
    page: "gift", label: "Gift a Journey", path: "/gift",
    fields: [
      { key: "gift.eyebrow", label: "Eyebrow" },
      { key: "gift.title", label: "Title" },
      { key: "gift.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "quiz", label: "Travel Quiz", path: "/quiz",
    fields: [
      { key: "quiz.eyebrow", label: "Eyebrow" },
      { key: "quiz.title", label: "Title" },
    ],
  },
  {
    page: "compare", label: "Compare", path: "/compare",
    fields: [
      { key: "compare.eyebrow", label: "Eyebrow" },
      { key: "compare.title", label: "Title" },
    ],
  },
  {
    page: "itinerary", label: "Trip Builder", path: "/itinerary",
    fields: [
      { key: "itinerary.eyebrow", label: "Eyebrow" },
      { key: "itinerary.title", label: "Title" },
      { key: "itinerary.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "tools", label: "Trip Tools Hub", path: "/tools",
    fields: [
      { key: "tools.eyebrow", label: "Eyebrow" },
      { key: "tools.title", label: "Title" },
      { key: "tools.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "destinations", label: "Destinations", path: "/destinations",
    fields: [
      { key: "destinations.eyebrow", label: "Eyebrow" },
      { key: "destinations.title", label: "Title" },
      { key: "destinations.intro", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "login", label: "Sign In", path: "/login",
    fields: [
      { key: "login.eyebrow", label: "Eyebrow" },
      { key: "login.title", label: "Title" },
      { key: "login.subtitle", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "signup", label: "Create Account", path: "/signup",
    fields: [
      { key: "signup.eyebrow", label: "Eyebrow" },
      { key: "signup.title", label: "Title" },
      { key: "signup.subtitle", label: "Intro", type: "textarea" },
    ],
  },
  {
    page: "nav", label: "Navigation menu", path: "/",
    fields: [
      { key: "nav.destinations", label: "Destinations link" },
      { key: "nav.stays", label: "Stays link" },
      { key: "nav.cruises", label: "Cruises link" },
      { key: "nav.flights", label: "Flights link" },
      { key: "nav.experiences", label: "Experiences link" },
      { key: "nav.journal", label: "Journal link" },
      { key: "nav.tripTools", label: "Trip Tools link" },
      { key: "nav.planCta", label: "Plan CTA button" },
    ],
  },
  {
    page: "footer", label: "Footer", path: "/",
    fields: [
      { key: "footer.stayInTouch", label: "Newsletter — eyebrow" },
      { key: "footer.dispatchLine1", label: "Newsletter — headline line 1" },
      { key: "footer.dispatchLine2", label: "Newsletter — headline line 2" },
      { key: "footer.emailPlaceholder", label: "Newsletter — email placeholder" },
      { key: "footer.subscribe", label: "Newsletter — button label" },
      { key: "footer.tagline", label: "Brand tagline", type: "textarea" },
      { key: "footer.colDiscover", label: "Column heading — Discover" },
      { key: "footer.colMaison", label: "Column heading — Maison" },
      { key: "footer.colCare", label: "Column heading — Care" },
      { key: "footer.copyright", label: "Copyright line" },
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

  "faq.eyebrow": "Help",
  "faq.title": "Frequently asked questions",
  "faq.intro": "Everything you need to know about planning, booking and travelling with us. Can't find your answer?",
  "faq.ctaTitle": "Still have a question?",
  "faq.ctaText": "Our advisors are always happy to help.",

  "offers.eyebrow": "Exclusive",
  "offers.title": "Offers",
  "offers.intro": "Curated offers and member-only rates on extraordinary journeys.",

  "callback.eyebrow": "Speak to an advisor",
  "callback.title": "Request a callback",
  "callback.intro": "Tell us when suits you and one of our travel advisors will call to help plan your journey — no obligation.",

  "about.eyebrow": "Our Ethos",
  "about.title": "The Voyages & Co. Maison",
  "about.intro": "A private travel atelier, devoted to crafting journeys of rare beauty for those who expect the extraordinary — and accept nothing less.",

  "plan.eyebrow": "Bespoke Travel",
  "plan.title": "Plan Your Journey",
  "plan.subtitle": "Tell us a little about the trip you have in mind, and a travel designer will craft a tailored proposal.",

  "explore.eyebrow": "Explore the World",
  "explore.title": "Explore by Map",
  "explore.subtitle": "Wander the globe and tap a destination to discover the stays that await.",

  "careers.eyebrow": "Careers",
  "careers.title": "Join the Maison",
  "careers.intro": "We are always glad to hear from exceptional people who share our devotion to the art of travel.",

  "partners.eyebrow": "Partnerships",
  "partners.title": "Partner with Voyages & Co.",
  "partners.intro": "We collaborate with the world's finest properties and curators to create journeys our members will never forget.",

  "press.eyebrow": "Press",
  "press.title": "Press & Media",
  "press.intro": "For interviews, press materials or partnership stories, our communications team would be glad to assist.",

  "help.eyebrow": "How May We Help?",
  "help.title": "Help Centre",
  "help.subtitle": "Answers to questions our members often ask",

  "contact.eyebrow": "At Your Service",
  "contact.title": "The Concierge",
  "contact.subtitle": "A specialist would be glad to assist with your enquiry.",

  "terms.eyebrow": "Legal",
  "terms.title": "Terms of Service",
  "terms.intro": "Welcome to Voyages & Co. Please read these Terms of Service carefully before using our services. These terms constitute a legally binding agreement between you and Voyages & Co. Ltd.",

  "privacy.eyebrow": "Legal",
  "privacy.title": "Privacy Policy",
  "privacy.intro": "Voyages & Co. Ltd. (\"Voyages & Co.\", \"we\", \"us\") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services at voyagesco.com.",

  "cancellations.eyebrow": "Legal",
  "cancellations.title": "Cancellation Policy",

  "gift.eyebrow": "The gift of travel",
  "gift.title": "Gift a journey",
  "gift.intro": "Give someone an unforgettable escape. Tell us the details and our concierge will arrange a beautifully presented gift card.",

  "quiz.eyebrow": "Find your journey",
  "quiz.title": "What kind of traveller are you?",

  "compare.eyebrow": "Compare",
  "compare.title": "Side by side",

  "itinerary.eyebrow": "Trip builder",
  "itinerary.title": "Your itinerary",
  "itinerary.intro": "Bundle stays, journeys, cruises and experiences, then request a single tailored quote.",

  "tools.eyebrow": "Plan with ease",
  "tools.title": "Trip tools & services",
  "tools.intro": "Practical companions for every journey — from quick conversions to visas, insurance and the concierge.",

  "destinations.eyebrow": "Explore",
  "destinations.title": "Destinations",
  "destinations.intro": "A world of extraordinary places, each with its own collection of stays, experiences and journeys.",

  "login.eyebrow": "Members' Access",
  "login.title": "Welcome back",
  "login.subtitle": "Sign in to manage your journeys",

  "signup.eyebrow": "Membership",
  "signup.title": "Create Your Account",
  "signup.subtitle": "Join Voyages & Co. to plan, book and manage your journeys.",

  "nav.destinations": "Destinations",
  "nav.stays": "Stays",
  "nav.cruises": "Cruises",
  "nav.flights": "Flights",
  "nav.experiences": "Experiences",
  "nav.journal": "Journal",
  "nav.tripTools": "Trip Tools",
  "nav.planCta": "Plan Your Journey",

  "footer.stayInTouch": "Stay in Touch",
  "footer.dispatchLine1": "Receive our private dispatches &",
  "footer.dispatchLine2": "rare invitations.",
  "footer.emailPlaceholder": "Email address",
  "footer.subscribe": "Subscribe",
  "footer.tagline": "A private travel atelier crafting extraordinary journeys for the discerning.",
  "footer.colDiscover": "Discover",
  "footer.colMaison": "Maison",
  "footer.colCare": "Care",
  "footer.copyright": "© 2026 Voyages & Co. (by Lighthouse Ventures) · voyagesco.com",
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

// Raw admin overrides (no defaults) — passed to the client ContentProvider so
// client components (navbar/footer) can prefer an override and otherwise fall
// back to their translated label.
export const getPageContentMap = cache(async (): Promise<Record<string, string>> => loadPageContent());
