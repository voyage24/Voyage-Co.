import Link from "next/link";
import { redirect } from "next/navigation";
import { Wallet, Luggage, Crown, Compass, Headset, Settings, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getSiteSettings } from "@/lib/site-settings";
import HubGreeting from "@/components/account/HubGreeting";
import MembershipStatus from "@/components/account/MembershipStatus";
import TripToday from "@/components/account/TripToday";
import TripCountdownWidget from "@/components/account/TripCountdownWidget";
import UpcomingJourneys from "@/components/account/UpcomingJourneys";
import NotificationInbox from "@/components/account/NotificationInbox";
import PersonalizedHome from "@/components/home/PersonalizedHome";
import PushSubscribe from "@/components/ui/PushSubscribe";
import LogoutButton from "@/components/account/LogoutButton";
import OfflineTripSync from "@/components/account/OfflineTripSync";

export const dynamic = "force-dynamic";

// A curated quick-reach shortcut into every corner of the member's world.
const QUICK_LINKS = [
  { href: "/account/wallet", label: "Travel wallet", sub: "Passes & documents", Icon: Wallet },
  { href: "/trips", label: "My trips", sub: "Bookings & itineraries", Icon: Luggage },
  { href: "/membership", label: "Membership", sub: "Points & tiers", Icon: Crown },
  { href: "/plan", label: "Plan a journey", sub: "With a concierge", Icon: Compass },
  { href: "/support", label: "Concierge", sub: "We're here to help", Icon: Headset },
  { href: "/account", label: "Account & settings", sub: "Profile, documents, privacy", Icon: Settings },
];

// The member hub — a warm, standalone landing that greets the signed-in member,
// surfaces their next journey, membership standing, smart nudges and quick links.
// Detailed management (bookings, travellers, documents, security) stays one tap
// deeper at /account; this page is the daily "home" for members.
export default async function MyVoyagesPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const bookings = await prisma.booking.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } });
  const settings = await getSiteSettings();
  const firstName = customer.name?.trim().split(" ")[0] || "";

  // The trip in progress (today within its dates), else the soonest upcoming one.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dated = bookings.filter(b => b.status === "confirmed" && b.checkIn);
  const active = dated.find(b => b.checkIn && b.checkOut && new Date(b.checkIn) <= today && new Date(b.checkOut) >= today);
  const upcomingAll = dated
    .filter(b => b.checkIn && new Date(b.checkIn) >= today)
    .sort((a, b) => new Date(a.checkIn!).getTime() - new Date(b.checkIn!).getTime());
  const todayTrip = active || upcomingAll[0] || null;
  const otherUpcoming = upcomingAll
    .filter(b => b.id !== todayTrip?.id)
    .map(b => ({ reference: b.reference, title: b.itemTitle, type: b.type, checkIn: b.checkIn, checkOut: b.checkOut }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24">
      <OfflineTripSync />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <HubGreeting firstName={firstName} />
        <div className="flex items-center gap-3 pt-1">
          <Link href="/account" className="text-xs tracking-[0.12em] uppercase text-ink-muted link-underline">Account</Link>
          <LogoutButton />
        </div>
      </div>

      <div className="mb-6"><PushSubscribe /></div>

      {/* Next journey + membership standing, side by side on desktop. */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-6 items-start mb-4">
        <div className="space-y-4">
          {todayTrip ? (
            <>
              <TripCountdownWidget checkIn={todayTrip.checkIn} checkOut={todayTrip.checkOut} title={todayTrip.itemTitle} />
              <TripToday trip={{ reference: todayTrip.reference, itemTitle: todayTrip.itemTitle, type: todayTrip.type, image: todayTrip.image, checkIn: todayTrip.checkIn, checkOut: todayTrip.checkOut, status: todayTrip.status }} whatsapp={settings["contact.whatsapp"] || "919919910213"} />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-panel-soft p-8 text-center h-full flex flex-col items-center justify-center">
              <Compass size={22} className="text-gold mb-3" />
              <p className="font-serif text-xl font-light text-ink mb-1">No journeys booked yet</p>
              <p className="text-sm text-ink-muted font-light mb-5">When you book, your countdown and travel details appear here.</p>
              <Link href="/packages" className="inline-flex items-center gap-1.5 px-6 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
                Explore journeys <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
        <MembershipStatus />
      </div>

      <UpcomingJourneys trips={otherUpcoming} />

      {/* Quick links into every corner of the member's world. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
        {QUICK_LINKS.map(({ href, label, sub, Icon }) => (
          <Link key={href} href={href} className="group rounded-2xl border border-line bg-panel-soft p-4 hover:border-gold/40 hover:-translate-y-0.5 transition-all duration-300">
            <Icon size={19} className="text-gold mb-2.5" />
            <p className="text-sm font-medium text-ink leading-tight">{label}</p>
            <p className="text-[11px] text-ink-faint mt-0.5">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Smart "For you" nudges — price drops, affinity, weather, passport. */}
      <PersonalizedHome heading={false} limit={6} />

      <div className="mt-8"><NotificationInbox /></div>

      <div className="mt-10 text-center">
        <Link href="/account" className="inline-flex items-center gap-1.5 text-xs tracking-[0.14em] uppercase text-ink-muted link-underline">
          Manage bookings, travellers & settings <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}
