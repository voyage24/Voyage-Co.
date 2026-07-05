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
  {
    key: "list.careersRoles",
    page: "careers-roles",
    label: "Careers — open roles",
    path: "/careers",
    itemLabel: "role",
    description: "Open positions listed on the Careers page.",
    fields: [
      { key: "title", label: "Role title" },
      { key: "department", label: "Department" },
      { key: "location", label: "Location" },
      { key: "type", label: "Type" },
    ],
    default: [
      { title: "Senior Travel Designer", department: "Journey Design", location: "Mumbai, India", type: "Full-time" },
      { title: "Concierge Manager — Middle East", department: "Guest Relations", location: "Dubai, UAE", type: "Full-time" },
      { title: "Private Aviation Specialist", department: "Flights", location: "Remote (India)", type: "Full-time" },
      { title: "Hotel Partnerships Lead", department: "Partnerships", location: "Mumbai, India", type: "Full-time" },
      { title: "Bespoke Journeys Cartographer", department: "Journey Design", location: "Remote", type: "Contract" },
      { title: "Guest Experience Associate", department: "Guest Relations", location: "Mumbai, India", type: "Full-time" },
      { title: "Content & Journal Editor", department: "Brand", location: "Remote", type: "Part-time" },
      { title: "Cruise & Rail Specialist", department: "Voyages", location: "Mumbai, India", type: "Full-time" },
    ],
  },
  {
    key: "list.careersValues",
    page: "careers-values",
    label: "Careers — our values",
    path: "/careers",
    itemLabel: "value",
    fields: [
      { key: "title", label: "Title" },
      { key: "body", label: "Body", type: "textarea" },
    ],
    default: [
      { title: "Obsessive Attention", body: "We sweat details no guest will ever notice — because the ones who do notice are the ones we're building this for." },
      { title: "Quiet Confidence", body: "Genuine luxury rarely announces itself. We work in a register that's calm, precise and entirely unflashy." },
      { title: "Worldwide Curiosity", body: "Every member of the team is, at heart, a traveller first — restless, well-read and always planning the next trip." },
    ],
  },
  {
    key: "list.tools",
    page: "tools",
    label: "Trip Tools cards",
    path: "/tools",
    itemLabel: "tool",
    description: "The cards on the Trip Tools page. Icon is a Lucide name (e.g. Plane, Luggage, ListChecks). Link is a path like /tools/currency.",
    fields: [
      { key: "icon", label: "Icon (Lucide name)" },
      { key: "title", label: "Title" },
      { key: "text", label: "Description", type: "textarea" },
      { key: "href", label: "Link (path)" },
    ],
    default: [
      { icon: "Plane", title: "Live flight tracker", text: "Follow any flight live on the world map.", href: "/tools/flight-tracker" },
      { icon: "ArrowLeftRight", title: "Currency converter", text: "Live rates across 40+ currencies.", href: "/tools/currency" },
      { icon: "Luggage", title: "Smart packing list", text: "A tailored list from your trip details.", href: "/tools/packing" },
      { icon: "ListChecks", title: "Travel checklist", text: "A countdown of everything to sort before you go.", href: "/tools/checklist" },
      { icon: "ShieldCheck", title: "Visa assistance", text: "Guidance and support for entry requirements.", href: "/visa" },
      { icon: "FileText", title: "Travel insurance", text: "Cover for medical, cancellation and baggage.", href: "/insurance" },
      { icon: "Sparkles", title: "Concierge services", text: "Transfers, chefs, charters — anything, arranged.", href: "/services" },
    ],
  },
  {
    key: "list.groupHighlights",
    page: "group-highlights",
    label: "Group Booking highlights",
    path: "/group",
    itemLabel: "highlight",
    description: "The three highlight cards on the Group Booking page. Icon is a Lucide name (e.g. CalendarHeart, Gem, Users).",
    fields: [
      { key: "icon", label: "Icon (Lucide name)" },
      { key: "title", label: "Title" },
      { key: "text", label: "Description", type: "textarea" },
    ],
    default: [
      { icon: "CalendarHeart", title: "Celebrations & weddings", text: "Destination weddings, milestone birthdays and anniversaries, planned to the finest detail." },
      { icon: "Gem", title: "Corporate & incentive", text: "Off-sites, retreats and reward trips that reflect your brand and reward your people." },
      { icon: "Users", title: "Family & friends", text: "Multi-generational journeys and private group escapes, effortlessly coordinated." },
    ],
  },
  {
    key: "list.reserve",
    page: "reserve-perks",
    label: "Voyages Reserve perks",
    path: "/membership#voyages-reserve",
    itemLabel: "perk",
    fields: [
      { key: "perk", label: "Perk" },
    ],
    default: [
      { perk: "A dedicated personal travel designer" },
      { perk: "Priority concierge, around the clock" },
      { perk: "Complimentary upgrades & welcome amenities" },
      { perk: "Invitations to private events & experiences" },
      { perk: "Preferred rates at signature properties" },
      { perk: "First access to new journeys" },
    ],
  },
  {
    key: "list.nav",
    page: "nav-links",
    label: "Navigation links",
    path: "/",
    itemLabel: "link",
    description: "The main links in the top navigation bar. Saving this list replaces the default menu and overrides the per-label text on the Navigation menu page. Link is a path like /hotels.",
    fields: [
      { key: "label", label: "Label" },
      { key: "href", label: "Link (path)" },
    ],
    default: [
      { label: "Destinations", href: "/packages" },
      { label: "Stays", href: "/hotels" },
      { label: "Cruises", href: "/cruises" },
      { label: "Flights", href: "/flights" },
      { label: "Experiences", href: "/experiences" },
      { label: "Journal", href: "/blog" },
      { label: "Trip Tools", href: "/tools" },
    ],
  },
  {
    key: "list.footer",
    page: "footer-links",
    label: "Footer links",
    path: "/",
    itemLabel: "link",
    description: "Links in the footer columns. Column must be Discover, Maison or Care to appear under that heading. Link is a path like /hotels.",
    fields: [
      { key: "column", label: "Column (Discover / Maison / Care)" },
      { key: "label", label: "Label" },
      { key: "href", label: "Link (path)" },
    ],
    default: [
      { column: "Discover", label: "Destinations", href: "/packages" },
      { column: "Discover", label: "Stays", href: "/hotels" },
      { column: "Discover", label: "Cruises", href: "/cruises" },
      { column: "Discover", label: "Experiences", href: "/experiences" },
      { column: "Discover", label: "Private Flights", href: "/flights" },
      { column: "Discover", label: "Explore by Map", href: "/explore" },
      { column: "Discover", label: "By Destination", href: "/destinations" },
      { column: "Discover", label: "Offers", href: "/offers" },
      { column: "Discover", label: "Membership", href: "/membership" },
      { column: "Discover", label: "Trip Builder", href: "/itinerary" },
      { column: "Discover", label: "Find Your Journey", href: "/quiz" },
      { column: "Maison", label: "About", href: "/about" },
      { column: "Maison", label: "Journal", href: "/blog" },
      { column: "Maison", label: "Careers", href: "/careers" },
      { column: "Maison", label: "Press", href: "/press" },
      { column: "Maison", label: "Partners", href: "/partners" },
      { column: "Care", label: "Concierge", href: "/contact" },
      { column: "Care", label: "Request a Callback", href: "/callback" },
      { column: "Care", label: "Gift a Journey", href: "/gift" },
      { column: "Care", label: "Concierge Services", href: "/services" },
      { column: "Care", label: "Trip tools", href: "/tools" },
      { column: "Care", label: "Live flight tracker", href: "/tools/flight-tracker" },
      { column: "Care", label: "Visa assistance", href: "/visa" },
      { column: "Care", label: "Travel insurance", href: "/insurance" },
      { column: "Care", label: "FAQ", href: "/faq" },
      { column: "Care", label: "Support", href: "/support" },
      { column: "Care", label: "Cancellations", href: "/cancellations" },
      { column: "Care", label: "Privacy", href: "/privacy" },
      { column: "Care", label: "Terms", href: "/terms" },
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
