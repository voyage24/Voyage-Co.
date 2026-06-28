import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";
import LogoutButton from "@/components/account/LogoutButton";
import Price from "@/components/ui/Price";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

export default async function AccountPage() {
  const customer = await getCurrentCustomer();
  if (!customer) redirect("/login");

  const bookings = await prisma.booking.findMany({
    where: { customerId: customer.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-10">
        <div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">My Account</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">{customer.name || customer.email}</h1>
          <p className="text-sm text-ink-muted font-light mt-1">{customer.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="font-serif text-2xl font-light text-ink">My Bookings</h2>
        <Link href="/trips" className="text-xs tracking-[0.12em] uppercase text-gold link-underline">Saved trips →</Link>
      </div>

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
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 bg-panel border border-line rounded-xl p-5">
              <div className="min-w-0">
                <p className="font-serif text-lg font-light text-ink truncate">{b.itemTitle}</p>
                <p className="text-xs text-ink-faint font-light mt-0.5">
                  {b.reference}
                  {b.checkIn && ` · ${b.checkIn}${b.checkOut ? ` → ${b.checkOut}` : ""}`}
                  {` · ${b.guests} ${b.guests === 1 ? "guest" : "guests"}`}
                </p>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <Price amount={b.total} className="font-serif text-lg font-light text-ink" />
                <span className={`text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-full border ${STATUS_STYLES[b.status] ?? STATUS_STYLES.pending}`}>
                  {b.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
