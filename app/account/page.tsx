import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import LogoutButton from "@/components/account/LogoutButton";
import CancelBookingButton from "@/components/account/CancelBookingButton";
import SavedList from "@/components/account/SavedList";
import ShareBoardButton from "@/components/account/ShareBoardButton";
import SavedSearchesList from "@/components/account/SavedSearchesList";
import BookingActions from "@/components/account/BookingActions";
import OccasionsForm from "@/components/account/OccasionsForm";
import TripCountdown from "@/components/account/TripCountdown";
import AddToCalendar from "@/components/account/AddToCalendar";
import PushSubscribe from "@/components/ui/PushSubscribe";
import DataControls from "@/components/account/DataControls";
import DataSaverToggle from "@/components/account/DataSaverToggle";
import DocumentVault from "@/components/account/DocumentVault";
import PasskeyManager from "@/components/account/PasskeyManager";
import PasskeyNudge from "@/components/account/PasskeyNudge";
import OfflineTripSync from "@/components/account/OfflineTripSync";
import AppLock from "@/components/account/AppLock";
import AppLockToggle from "@/components/account/AppLockToggle";
import TravellersManager from "@/components/account/TravellersManager";
import Price from "@/components/ui/Price";
import { getPageContent } from "@/lib/page-content";
import { getSiteSettings } from "@/lib/site-settings";
import TripToday from "@/components/account/TripToday";
import TripCountdownWidget from "@/components/account/TripCountdownWidget";
import UpcomingJourneys from "@/components/account/UpcomingJourneys";
import NotificationInbox from "@/components/account/NotificationInbox";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

// Padded tap-targets that clearly highlight on hover (desktop) and on tap
// (phone) so it's obvious which action was pressed.
const ACTION_CLS =
  "inline-flex items-center gap-1 text-xs tracking-[0.12em] uppercase text-ink-muted rounded px-2.5 py-1.5 border border-transparent hover:bg-panel-soft hover:text-ink hover:border-line active:bg-gold/20 active:text-ink transition-colors whitespace-nowrap";

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const [bookings, saved, passkeyRows] = await Promise.all([
    prisma.booking.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.savedItem.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.webauthnCredential.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" }, select: { id: true, deviceName: true, createdAt: true } }).catch(() => []),
  ]);
  const passkeys = passkeyRows.map(p => ({ id: p.id, deviceName: p.deviceName, createdAt: p.createdAt.toISOString() }));
  const c = await getPageContent();
  const settings = await getSiteSettings();

  // The trip in progress (today within its dates), else the soonest upcoming one.
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dated = bookings.filter(b => b.status === "confirmed" && b.checkIn);
  const active = dated.find(b => b.checkIn && b.checkOut && new Date(b.checkIn) <= today && new Date(b.checkOut) >= today);
  // Every upcoming journey (any type), soonest first.
  const upcomingAll = dated
    .filter(b => b.checkIn && new Date(b.checkIn) >= today)
    .sort((a, b) => new Date(a.checkIn!).getTime() - new Date(b.checkIn!).getTime());
  const todayTrip = active || upcomingAll[0] || null;
  const otherUpcoming = upcomingAll
    .filter(b => b.id !== todayTrip?.id)
    .map(b => ({ reference: b.reference, title: b.itemTitle, type: b.type, checkIn: b.checkIn, checkOut: b.checkOut }));

  return (
    <AppLock>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">{c("account.eyebrow")}</p>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{customer.name || customer.email}</h1>
            {customer.tier && customer.tier !== "member" && (
              <span className="text-[10px] tracking-[0.18em] uppercase border border-gold/50 text-gold px-2.5 py-1 rounded-full capitalize">{customer.tier}</span>
            )}
          </div>
          <p className="text-sm text-ink-muted font-light mt-1">{customer.email}</p>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <Link href="/membership" className="text-xs text-gold link-underline">{(customer.points ?? 0).toLocaleString("en-IN")} points · Membership →</Link>
            <Link href="/account/card" className="text-xs text-ink-muted link-underline">Digital card</Link>
            <Link href="/account/wallet" className="inline-flex items-center gap-1 text-xs text-ink-muted link-underline">Travel wallet</Link>
          </div>
          <div className="mt-2"><PushSubscribe /></div>
        </div>
        <LogoutButton />
      </div>

      <OfflineTripSync />
      {todayTrip && <TripCountdownWidget checkIn={todayTrip.checkIn} checkOut={todayTrip.checkOut} title={todayTrip.itemTitle} />}
      {todayTrip && <TripToday trip={{ reference: todayTrip.reference, itemTitle: todayTrip.itemTitle, type: todayTrip.type, image: todayTrip.image, checkIn: todayTrip.checkIn, checkOut: todayTrip.checkOut, status: todayTrip.status }} whatsapp={settings["contact.whatsapp"] || "919919910213"} />}
      <UpcomingJourneys trips={otherUpcoming} />
      {passkeys.length === 0 && <PasskeyNudge />}
      <NotificationInbox />

      <h2 className="font-serif text-2xl font-light text-ink mb-5">My Bookings</h2>

      {bookings.length === 0 ? (
        <div className="border border-dashed border-line rounded-2xl p-10 text-center">
          <p className="text-ink-muted font-light mb-5">You have no bookings yet.</p>
          <Link href="/packages" className="inline-block px-7 py-3 bg-ink text-page text-xs tracking-[0.16em] uppercase rounded-sm hover:bg-ink/90 transition-colors">
            Explore Journeys
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <div key={b.id} className="bg-panel border border-line rounded-xl p-5">
             <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
              <div className="min-w-0">
                <p className="font-serif text-lg font-light text-ink truncate">{b.itemTitle}</p>
                <p className="text-xs text-ink-faint font-light mt-0.5">
                  {b.reference}
                  {b.checkIn && ` · ${b.checkIn}${b.checkOut ? ` → ${b.checkOut}` : ""}`}
                  {` · ${b.guests} ${b.guests === 1 ? "guest" : "guests"}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Price amount={b.total} className="font-serif text-lg font-light text-ink" />
                <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status] ?? STATUS_STYLES.pending}`}>
                  {b.status}
                </span>
              </div>
             </div>

             {b.status !== "cancelled" && (
               <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-3 border-t border-line/60">
                 {b.status === "confirmed" && <TripCountdown checkIn={b.checkIn} />}
                 <Link href={`/account/invoice/${b.reference}`} className={ACTION_CLS}>Invoice</Link>
                 {b.status === "confirmed" && (
                   <>
                     <Link href={`/account/voucher/${b.reference}`} className={ACTION_CLS}>Voucher</Link>
                     <Link href={`/account/pass/${b.reference}`} className={ACTION_CLS}>Wallet pass</Link>
                     <Link href={`/account/journey/${b.reference}`} className={`${ACTION_CLS} text-gold`}>Journal →</Link>
                     <AddToCalendar title={b.itemTitle} reference={b.reference} checkIn={b.checkIn} checkOut={b.checkOut} />
                   </>
                 )}
                 {b.status === "pending" && <CancelBookingButton id={b.id} />}
               </div>
             )}
             {b.status !== "cancelled" && (
               <BookingActions reference={b.reference} documents={(b.documents as { label: string; url: string }[]) ?? []} />
             )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mt-12 mb-5">
        <h2 className="font-serif text-2xl font-light text-ink">Saved</h2>
        {saved.length > 0 && <ShareBoardButton />}
      </div>
      <SavedList items={saved.map(s => ({ id: s.id, type: s.type, itemId: s.itemId, itemTitle: s.itemTitle, image: s.image, href: s.href }))} />

      <SavedSearchesList />

      <OccasionsForm />

      <div className="mt-12"><TravellersManager /></div>
      <div className="mt-6"><DocumentVault /></div>
      <div className="mt-6"><PasskeyManager passkeys={passkeys} /></div>
      <AppLockToggle hasPasskey={passkeys.length > 0} />
      <div className="mt-6"><DataSaverToggle /></div>
      <div className="mt-6"><DataControls /></div>
    </div>
    </AppLock>
  );
}
