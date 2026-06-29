import { prisma } from "@/lib/prisma";
import BookingsList from "@/components/admin/BookingsList";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-1">
        <h1 className="text-2xl font-semibold text-gray-900">Bookings</h1>
        <a href="/api/admin/export?type=bookings" className="text-xs px-3 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 shrink-0">Export CSV</a>
      </div>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        Every reservation made on the site. Confirm a booking once it&apos;s secured (payment confirmation will
        automate this later), or cancel it.
      </p>
      <BookingsList bookings={bookings.map(b => ({ ...b, documents: b.documents as { label: string; url: string }[] }))} />
    </div>
  );
}
