import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Result = { type: string; title: string; subtitle: string; href: string; image?: string | null };

// Static site pages, so a search for "faq", "membership", "gift", "contact"
// etc. surfaces the right page — not just bookable items.
const PAGES: { title: string; subtitle: string; href: string; kw: string }[] = [
  { title: "Frequently Asked Questions", subtitle: "Help & answers", href: "/faq", kw: "faq help questions how to cancel change refund payment visa documents support" },
  { title: "Plan Your Journey", subtitle: "Bespoke planning", href: "/plan", kw: "plan bespoke custom tailor design enquiry" },
  { title: "Find Your Journey", subtitle: "Travel-style quiz", href: "/quiz", kw: "quiz find journey style match recommend" },
  { title: "Trip Builder", subtitle: "Build your itinerary", href: "/itinerary", kw: "itinerary trip builder bundle plan" },
  { title: "Membership & Rewards", subtitle: "Tiers, points & perks", href: "/membership", kw: "membership loyalty points tier rewards silver gold perks benefits" },
  { title: "Gift a Journey", subtitle: "Gift cards", href: "/gift", kw: "gift card voucher present gifting balance" },
  { title: "Offers", subtitle: "Exclusive & member offers", href: "/offers", kw: "offers deals discount member rates promotion sale" },
  { title: "Concierge Services", subtitle: "Transfers, chef, charter & more", href: "/services", kw: "concierge services transfer chauffeur chef yacht jet helicopter charter restaurant security photographer" },
  { title: "Destinations", subtitle: "Browse by destination", href: "/destinations", kw: "destinations countries places where to go" },
  { title: "Explore by Map", subtitle: "Interactive map", href: "/explore", kw: "explore map world destinations" },
  { title: "Request a Callback", subtitle: "We'll call you", href: "/callback", kw: "callback call phone advisor speak talk" },
  { title: "Luxury Stays", subtitle: "Hotels, villas & resorts", href: "/hotels", kw: "hotels stays resorts villas accommodation rooms suites" },
  { title: "Cruises", subtitle: "Voyages at sea", href: "/cruises", kw: "cruises voyages ships sailing ocean river" },
  { title: "Flights", subtitle: "Air travel", href: "/flights", kw: "flights air business first class private aviation" },
  { title: "Rail Journeys", subtitle: "Luxury trains", href: "/trains", kw: "trains rail journeys railway" },
  { title: "Experiences", subtitle: "Curated experiences", href: "/experiences", kw: "experiences activities tours wellness adventure culinary safari" },
  { title: "Journal", subtitle: "Stories & guides", href: "/blog", kw: "journal blog stories guides articles inspiration" },
  { title: "My Account", subtitle: "Bookings, saved & points", href: "/account", kw: "account profile bookings saved trips login sign in points" },
  { title: "Contact", subtitle: "Reach the concierge", href: "/contact", kw: "contact concierge help support email phone enquiry" },
  { title: "About", subtitle: "Our atelier", href: "/about", kw: "about company story team who we are" },
  { title: "Help & Support", subtitle: "Get help", href: "/help", kw: "help support assistance faq" },
];

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ results: [] });

  const like = { contains: q, mode: "insensitive" as const };
  const ql = q.toLowerCase();
  const pageMatches = PAGES
    .filter(p => p.title.toLowerCase().includes(ql) || p.kw.includes(ql))
    .slice(0, 5)
    .map(p => ({ type: "Page", title: p.title, subtitle: p.subtitle, href: p.href, image: null }));

  try {
    const [hotels, packages, experiences, cruises, posts, flights, trains] = await Promise.all([
      prisma.hotel.findMany({
        where: { published: true, OR: [{ name: like }, { location: like }, { city: like }, { country: like }, { region: like }] },
        take: 5, select: { id: true, name: true, location: true, image: true },
      }),
      prisma.package.findMany({
        where: { published: true, OR: [{ title: like }, { subtitle: like }, { category: like }] },
        take: 5, select: { id: true, title: true, subtitle: true, image: true },
      }),
      prisma.experience.findMany({
        where: { published: true, OR: [{ title: like }, { location: like }, { category: like }] },
        take: 5, select: { id: true, title: true, location: true, image: true },
      }),
      prisma.cruise.findMany({
        where: { published: true, OR: [{ name: like }, { cruiseLine: like }, { region: like }, { departurePort: like }] },
        take: 5, select: { id: true, name: true, region: true, image: true },
      }),
      prisma.blogPost.findMany({
        where: { published: true, OR: [{ title: like }, { excerpt: like }, { category: like }] },
        take: 5, select: { slug: true, title: true, category: true, image: true },
      }),
      prisma.flight.findMany({
        where: { published: true, OR: [{ airline: like }, { originCity: like }, { destinationCity: like }, { origin: like }, { destination: like }] },
        take: 3, select: { airline: true, originCity: true, destinationCity: true },
      }),
      prisma.train.findMany({
        where: { published: true, OR: [{ name: like }, { originCity: like }, { destinationCity: like }] },
        take: 3, select: { name: true, originCity: true, destinationCity: true },
      }),
    ]);

    const results: Result[] = [
      ...pageMatches,
      ...packages.map(p => ({ type: "Journey", title: p.title, subtitle: p.subtitle, href: `/packages/${p.id}`, image: p.image })),
      ...hotels.map(h => ({ type: "Stay", title: h.name, subtitle: h.location, href: `/hotels/${h.id}`, image: h.image })),
      ...experiences.map(e => ({ type: "Experience", title: e.title, subtitle: e.location, href: `/experiences/${e.id}`, image: e.image })),
      ...cruises.map(c => ({ type: "Cruise", title: c.name, subtitle: c.region, href: `/cruises/${c.id}`, image: c.image })),
      ...flights.map(f => ({ type: "Flight", title: `${f.originCity} → ${f.destinationCity}`, subtitle: f.airline, href: "/flights", image: null })),
      ...trains.map(t => ({ type: "Rail", title: t.name, subtitle: `${t.originCity} → ${t.destinationCity}`, href: "/trains", image: null })),
      ...posts.map(b => ({ type: "Journal", title: b.title, subtitle: b.category, href: `/blog/${b.slug}`, image: b.image })),
    ];

    return NextResponse.json({ results });
  } catch (err) {
    console.error("Search failed:", err);
    return NextResponse.json({ results: [] });
  }
}
