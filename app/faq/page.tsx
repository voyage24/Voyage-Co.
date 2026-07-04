import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import JsonLd from "@/components/seo/JsonLd";
import { faqJsonLd } from "@/lib/seo";
import { getPageContent } from "@/lib/page-content";

export const metadata: Metadata = {
  title: "Frequently Asked Questions — Voyages & Co.",
  description: "Everything you need to know about booking, payments, changes, membership, gift cards and travelling with Voyages & Co.",
};

const GROUPS: { title: string; faqs: { q: string; a: string }[] }[] = [
  {
    title: "Booking & reservations",
    faqs: [
      { q: "How do I book a journey?", a: "Browse our stays, journeys, cruises and experiences, then send a reservation request from any page (or use Plan Your Journey for something bespoke). A travel advisor reviews it, confirms availability and details, and finalises your booking with you personally — every journey is hand-checked rather than sold instantly." },
      { q: "Is my booking confirmed immediately?", a: "A request marks your interest and reserves our attention — it isn't an instant confirmation. Your advisor will be in touch (usually within one business day) to confirm availability and the final itinerary. You'll receive a confirmation email with your booking reference once it's secured." },
      { q: "Can you arrange something completely custom?", a: "Absolutely — that's our speciality. Use Plan Your Journey to tell us your destinations, dates, party and style, or build a multi-item trip with the Trip Builder and request a single tailored quote." },
      { q: "Do I need an account to book?", a: "No, you can enquire as a guest. But creating a free account lets you track bookings, save favourites, build itineraries, download vouchers, and earn membership points." },
      { q: "How far in advance should I book?", a: "For peak seasons, signature properties and bespoke itineraries we recommend two to six months ahead. That said, we love a beautiful last-minute escape too — just ask." },
    ],
  },
  {
    title: "Payments & pricing",
    faqs: [
      { q: "How and when do I pay?", a: "There is no online payment at the time of enquiry. Once your advisor confirms the details, our team arranges payment with you securely and shares a clear quote or invoice beforehand. You'll always know the full cost before anything is charged." },
      { q: "What currency are prices shown in?", a: "Prices are managed in INR and displayed in your chosen currency using live exchange rates (switch currency from the top bar). Final billing currency is confirmed with your advisor." },
      { q: "Are taxes and fees included?", a: "Displayed prices are indicative starting rates. Applicable taxes, fees and any extras are itemised in the formal quote your advisor prepares, so there are no surprises." },
      { q: "Do you offer a deposit option?", a: "Yes — for many journeys we can arrange a deposit to secure your booking with the balance due later. Your advisor will outline the schedule when confirming." },
      { q: "What does 'Price on request' mean?", a: "For certain ultra-luxury or highly seasonal experiences we quote individually. Tap Enquire and we'll send tailored pricing." },
    ],
  },
  {
    title: "Changes & cancellations",
    faqs: [
      { q: "Can I change my booking?", a: "Yes. Sign in and open the booking in My Account → Request a change, or contact your advisor. We'll do everything we can to accommodate new dates, guests or preferences, subject to the supplier's terms." },
      { q: "What is your cancellation policy?", a: "Cancellation terms depend on the specific property, cruise line or supplier and are confirmed in writing before you pay. Your advisor will always explain the policy that applies to your journey." },
      { q: "Will I be charged to amend a trip?", a: "Many changes are free; some carry supplier fees (e.g. date changes close to travel). We'll tell you any cost before making the change." },
    ],
  },
  {
    title: "Membership & rewards",
    faqs: [
      { q: "How does membership work?", a: "Every account is a member. You earn one point for every ₹1,000 spent on confirmed journeys. As points grow you move from Member to Silver (1,500 points) to Gold (5,000 points), unlocking priority concierge, welcome amenities, upgrades and a dedicated advisor." },
      { q: "How do I see my points and tier?", a: "Open My Account, or visit the Membership page, to see your live points balance and progress to the next tier." },
      { q: "Do points expire?", a: "Your points and tier are maintained on your account. For anything specific to your balance, just ask your advisor." },
    ],
  },
  {
    title: "Gift cards",
    faqs: [
      { q: "Can I gift a journey?", a: "Yes. Visit Gift a Journey, choose an amount and add a personal message — our concierge issues a beautifully presented digital gift card you can share by link." },
      { q: "How is a gift card redeemed?", a: "The recipient simply quotes their gift code to our concierge, or mentions it on any booking enquiry, and the value is applied to their journey." },
      { q: "How do I check a gift card balance?", a: "Enter the code in the balance checker on the Gift a Journey page." },
    ],
  },
  {
    title: "Concierge & services",
    faqs: [
      { q: "What can the concierge arrange beyond the trip?", a: "A great deal — private transfers, jets and helicopters, yacht charters, private chefs, restaurant reservations, photographers, security and staff, and bespoke surprises. See Concierge Services to request any of these." },
      { q: "How do I reach a human quickly?", a: "Use the WhatsApp button, Request a Callback, or the Ask the Concierge chat. A real advisor will respond." },
    ],
  },
  {
    title: "Travel, visas & documents",
    faqs: [
      { q: "Do you help with visas and entry requirements?", a: "We provide guidance and many product pages list entry notes, but visas and entry rules are ultimately your responsibility. We're always happy to point you in the right direction." },
      { q: "Where are my travel documents?", a: "Once confirmed, vouchers and tickets appear in My Account under the relevant booking, where you can download them. You can also download a branded travel voucher for each confirmed booking." },
      { q: "Do you arrange travel insurance?", a: "We strongly recommend comprehensive travel insurance and can suggest trusted partners — ask your advisor." },
    ],
  },
  {
    title: "Your account & privacy",
    faqs: [
      { q: "How do I reset my password?", a: "Use the sign-in page; if you're stuck, contact us and we'll help you regain access." },
      { q: "How is my data handled?", a: "We treat your information with care and only use it to plan and deliver your journeys. See our Privacy page for full details." },
      { q: "Can I delete my account?", a: "Yes — contact the concierge and we'll take care of it." },
    ],
  },
];

const allFaqs = GROUPS.flatMap(g => g.faqs);

export default async function FaqPage() {
  const c = await getPageContent();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      <JsonLd data={faqJsonLd(allFaqs)} />
      <div className="text-center mb-12">
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-3">{c("faq.eyebrow")}</p>
        <h1 className="font-serif text-3xl sm:text-5xl font-light text-ink mb-3">{c("faq.title")}</h1>
        <p className="text-ink-muted font-light max-w-xl mx-auto">{c("faq.intro")} <Link href="/contact" className="text-gold link-underline">Contact our concierge</Link>.</p>
      </div>

      <div className="space-y-10">
        {GROUPS.map(group => (
          <section key={group.title}>
            <h2 className="font-serif text-2xl font-light text-ink mb-4">{group.title}</h2>
            <div className="divide-y divide-line border-y border-line">
              {group.faqs.map((f, i) => (
                <details key={i} className="group py-4">
                  <summary className="flex items-start justify-between gap-4 cursor-pointer list-none text-ink font-medium">
                    {f.q}
                    <Plus size={16} className="text-gold shrink-0 mt-1 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 text-ink-muted font-light leading-relaxed">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 bg-panel border border-line rounded-2xl p-8 text-center">
        <p className="font-serif text-xl font-light text-ink mb-2">{c("faq.ctaTitle")}</p>
        <p className="text-ink-muted font-light mb-5">{c("faq.ctaText")}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/contact" className="px-6 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">Contact us</Link>
          <Link href="/callback" className="px-6 py-3 border border-line-strong text-ink text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink hover:text-page transition-all">Request a callback</Link>
        </div>
      </div>
    </div>
  );
}
