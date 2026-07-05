import { cache } from "react";
import { getPageContentMap } from "./page-content";

// ── Editable repeatable lists ────────────────────────────────────────────────
// Some page content isn't a fixed set of copy fields but a *list* of repeating
// records — FAQ Q&As, service cards, insurance plans, membership tiers, nav and
// footer links. Each list is registered here with its item shape and a default
// (the list as originally shipped, hard-coded in the component). Admins edit the
// whole list (add / remove / reorder / edit) and the value is stored as a JSON
// string in the same PageContent table, under the list's `key`. Components read
// the list through getPageList() (server) or useContentList() (client) and fall
// back to the default when no override is saved.

export type ListField = { key: string; label: string; type?: "text" | "textarea" };
export type ListItem = Record<string, string>;
export type ContentList = {
  key: string;        // storage key in PageContent, e.g. "list.faq"
  page: string;       // slug used in the admin URL, e.g. "faq"
  label: string;      // "FAQ questions"
  path: string;       // public page to preview
  itemLabel: string;  // singular noun for the add button, e.g. "question"
  description?: string;
  fields: ListField[];
  default: ListItem[];
};

// ── FAQ ──────────────────────────────────────────────────────────────────────
// The public /faq page groups questions by section; we model that as a flat list
// with a `section` field and group by first-seen section order at render time.
const FAQ_DEFAULT: ListItem[] = [
  { section: "Booking & reservations", q: "How do I book a journey?", a: "Browse our stays, journeys, cruises and experiences, then send a reservation request from any page (or use Plan Your Journey for something bespoke). A travel advisor reviews it, confirms availability and details, and finalises your booking with you personally — every journey is hand-checked rather than sold instantly." },
  { section: "Booking & reservations", q: "Is my booking confirmed immediately?", a: "A request marks your interest and reserves our attention — it isn't an instant confirmation. Your advisor will be in touch (usually within one business day) to confirm availability and the final itinerary. You'll receive a confirmation email with your booking reference once it's secured." },
  { section: "Booking & reservations", q: "Can you arrange something completely custom?", a: "Absolutely — that's our speciality. Use Plan Your Journey to tell us your destinations, dates, party and style, or build a multi-item trip with the Trip Builder and request a single tailored quote." },
  { section: "Booking & reservations", q: "Do I need an account to book?", a: "No, you can enquire as a guest. But creating a free account lets you track bookings, save favourites, build itineraries, download vouchers, and earn membership points." },
  { section: "Booking & reservations", q: "How far in advance should I book?", a: "For peak seasons, signature properties and bespoke itineraries we recommend two to six months ahead. That said, we love a beautiful last-minute escape too — just ask." },
  { section: "Payments & pricing", q: "How and when do I pay?", a: "There is no online payment at the time of enquiry. Once your advisor confirms the details, our team arranges payment with you securely and shares a clear quote or invoice beforehand. You'll always know the full cost before anything is charged." },
  { section: "Payments & pricing", q: "What currency are prices shown in?", a: "Prices are managed in INR and displayed in your chosen currency using live exchange rates (switch currency from the top bar). Final billing currency is confirmed with your advisor." },
  { section: "Payments & pricing", q: "Are taxes and fees included?", a: "Displayed prices are indicative starting rates. Applicable taxes, fees and any extras are itemised in the formal quote your advisor prepares, so there are no surprises." },
  { section: "Payments & pricing", q: "Do you offer a deposit option?", a: "Yes — for many journeys we can arrange a deposit to secure your booking with the balance due later. Your advisor will outline the schedule when confirming." },
  { section: "Payments & pricing", q: "What does 'Price on request' mean?", a: "For certain ultra-luxury or highly seasonal experiences we quote individually. Tap Enquire and we'll send tailored pricing." },
  { section: "Changes & cancellations", q: "Can I change my booking?", a: "Yes. Sign in and open the booking in My Account → Request a change, or contact your advisor. We'll do everything we can to accommodate new dates, guests or preferences, subject to the supplier's terms." },
  { section: "Changes & cancellations", q: "What is your cancellation policy?", a: "Cancellation terms depend on the specific property, cruise line or supplier and are confirmed in writing before you pay. Your advisor will always explain the policy that applies to your journey." },
  { section: "Changes & cancellations", q: "Will I be charged to amend a trip?", a: "Many changes are free; some carry supplier fees (e.g. date changes close to travel). We'll tell you any cost before making the change." },
  { section: "Membership & rewards", q: "How does membership work?", a: "Every account is a member. You earn one point for every ₹1,000 spent on confirmed journeys. As points grow you move from Member to Silver (1,500 points) to Gold (5,000 points), unlocking priority concierge, welcome amenities, upgrades and a dedicated advisor." },
  { section: "Membership & rewards", q: "How do I see my points and tier?", a: "Open My Account, or visit the Membership page, to see your live points balance and progress to the next tier." },
  { section: "Membership & rewards", q: "Do points expire?", a: "Your points and tier are maintained on your account. For anything specific to your balance, just ask your advisor." },
  { section: "Gift cards", q: "Can I gift a journey?", a: "Yes. Visit Gift a Journey, choose an amount and add a personal message — our concierge issues a beautifully presented digital gift card you can share by link." },
  { section: "Gift cards", q: "How is a gift card redeemed?", a: "The recipient simply quotes their gift code to our concierge, or mentions it on any booking enquiry, and the value is applied to their journey." },
  { section: "Gift cards", q: "How do I check a gift card balance?", a: "Enter the code in the balance checker on the Gift a Journey page." },
  { section: "Concierge & services", q: "What can the concierge arrange beyond the trip?", a: "A great deal — private transfers, jets and helicopters, yacht charters, private chefs, restaurant reservations, photographers, security and staff, and bespoke surprises. See Concierge Services to request any of these." },
  { section: "Concierge & services", q: "How do I reach a human quickly?", a: "Use the WhatsApp button, Request a Callback, or the Ask the Concierge chat. A real advisor will respond." },
  { section: "Travel, visas & documents", q: "Do you help with visas and entry requirements?", a: "We provide guidance and many product pages list entry notes, but visas and entry rules are ultimately your responsibility. We're always happy to point you in the right direction." },
  { section: "Travel, visas & documents", q: "Where are my travel documents?", a: "Once confirmed, vouchers and tickets appear in My Account under the relevant booking, where you can download them. You can also download a branded travel voucher for each confirmed booking." },
  { section: "Travel, visas & documents", q: "Do you arrange travel insurance?", a: "We strongly recommend comprehensive travel insurance and can suggest trusted partners — ask your advisor." },
  { section: "Your account & privacy", q: "How do I reset my password?", a: "Use the sign-in page; if you're stuck, contact us and we'll help you regain access." },
  { section: "Your account & privacy", q: "How is my data handled?", a: "We treat your information with care and only use it to plan and deliver your journeys. See our Privacy page for full details." },
  { section: "Your account & privacy", q: "Can I delete my account?", a: "Yes — contact the concierge and we'll take care of it." },
];

export const LIST_REGISTRY: ContentList[] = [
  {
    key: "list.faq",
    page: "faq",
    label: "FAQ questions",
    path: "/faq",
    itemLabel: "question",
    description: "Questions grouped by section. Reuse a section name to add a question to that group; the group order follows the first question that names it.",
    fields: [
      { key: "section", label: "Section" },
      { key: "q", label: "Question" },
      { key: "a", label: "Answer", type: "textarea" },
    ],
    default: FAQ_DEFAULT,
  },
  {
    key: "list.services",
    page: "services",
    label: "Concierge service cards",
    path: "/services",
    itemLabel: "service",
    description: "The service cards on the Concierge page. Icon is a Lucide icon name (e.g. Car, Plane, Ship, ChefHat, Camera) — an unknown name falls back to a sparkle.",
    fields: [
      { key: "icon", label: "Icon (Lucide name)" },
      { key: "title", label: "Title" },
      { key: "text", label: "Description", type: "textarea" },
    ],
    default: [
      { icon: "Car", title: "Private Transfers", text: "Chauffeured arrivals, departures and door-to-door transport in every city." },
      { icon: "Plane", title: "Private Jet & Helicopter", text: "Seamless private aviation, scenic transfers and last-mile lifts." },
      { icon: "Ship", title: "Yacht & Boat Charter", text: "Crewed yachts and day boats for coastlines, islands and celebrations." },
      { icon: "ChefHat", title: "Private Chef & Dining", text: "In-villa chefs, tasting menus and bespoke culinary experiences." },
      { icon: "UtensilsCrossed", title: "Restaurant Reservations", text: "Tables at the most coveted restaurants, secured on your behalf." },
      { icon: "Camera", title: "Photographer & Videographer", text: "Capture your journey with a private photographer at any destination." },
      { icon: "ShieldCheck", title: "Security & Staff", text: "Discreet close protection, butlers, nannies and personal assistants." },
      { icon: "Sparkles", title: "Bespoke Requests", text: "Proposals, surprises, access and the impossible — simply ask." },
    ],
  },
  {
    key: "list.insurance",
    page: "insurance",
    label: "Insurance plans",
    path: "/insurance",
    itemLabel: "plan",
    description: "The cover tiers on the Travel Insurance page. Put one perk per line. The second plan in the list is highlighted as “Popular”.",
    fields: [
      { key: "name", label: "Plan name" },
      { key: "tag", label: "Tagline" },
      { key: "perks", label: "Perks (one per line)", type: "textarea" },
    ],
    default: [
      { name: "Essential", tag: "Everyday cover", perks: "Emergency medical & evacuation\nTrip cancellation & curtailment\nLost or delayed baggage\n24/7 assistance helpline" },
      { name: "Signature", tag: "Most popular", perks: "Everything in Essential\nHigher medical & cancellation limits\nMissed connection & travel delay\nGadget & valuables cover\nAdventure activities" },
      { name: "Elite", tag: "Comprehensive", perks: "Everything in Signature\nTop-tier medical worldwide\nCancel-for-any-reason option\nBusiness equipment cover\nConcierge medical support" },
    ],
  },
  {
    key: "list.membership",
    page: "membership",
    label: "Membership tiers",
    path: "/membership",
    itemLabel: "tier",
    description: "The reward tiers on the Membership page. Put one perk per line. The last tier in the list is highlighted.",
    fields: [
      { key: "name", label: "Tier name" },
      { key: "at", label: "Threshold (e.g. 1,500 points)" },
      { key: "perks", label: "Perks (one per line)", type: "textarea" },
    ],
    default: [
      { name: "Member", at: "0 points", perks: "Save journeys & build itineraries\nMember-only offers\nTailored ideas from our concierge" },
      { name: "Silver", at: "1,500 points", perks: "Everything in Member\nPriority concierge\nWelcome amenity on stays" },
      { name: "Gold", at: "5,000 points", perks: "Everything in Silver\nComplimentary upgrades when available\nA dedicated travel advisor" },
    ],
  },
];

// Splits a "one per line" textarea value into trimmed, non-empty lines.
export function splitLines(value: string | undefined): string[] {
  return (value ?? "").split("\n").map(s => s.trim()).filter(Boolean);
}

export const LIST_KEYS = new Set(LIST_REGISTRY.map(l => l.key));
export const LIST_BY_PAGE = new Map(LIST_REGISTRY.map(l => [l.page, l]));
const LIST_DEFAULTS = new Map(LIST_REGISTRY.map(l => [l.key, l.default]));

function parseList(raw: string | undefined, fallback: ListItem[]): ListItem[] {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ListItem[]) : fallback;
  } catch {
    return fallback;
  }
}

// Server: parsed override list → registry default. Cached per request.
export const getPageList = cache(async (key: string): Promise<ListItem[]> => {
  const map = await getPageContentMap();
  return parseList(map[key], LIST_DEFAULTS.get(key) ?? []);
});
