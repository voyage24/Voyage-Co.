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
import Price from "@/components/ui/Price";
import { getPageContent } from "@/lib/page-content";

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

  const [bookings, saved] = await Promise.all([
    prisma.booking.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
    prisma.savedItem.findMany({ where: { customerId: customer.id }, orderBy: { createdAt: "desc" } }),
  ]);
  const c = await getPageContent();

  return (
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
          <Link href="/membership" className="text-xs text-gold link-underline mt-1 inline-block">{(customer.points ?? 0).toLocaleString("en-IN")} points · Membership →</Link>
          <div className="mt-2"><PushSubscribe /></div>
        </div>
        <LogoutButton />
      </div>

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

      <div className="mt-12"><DataControls /></div>
    </div>
  );
}
