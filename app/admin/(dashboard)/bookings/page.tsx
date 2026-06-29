import { prisma } from "@/lib/prisma";
import BookingsList from "@/components/admin/BookingsList";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({ orderBy: { createdAt: "desc" }, take: 500 });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Bookings</h1>
      <p className="text-sm text-gray-500 mb-5 max-w-2xl">
        Every reservation made on the site. Confirm a booking once it&apos;s secured (payment confirmation will
        automate this later), or cancel it.
      </p>
      <BookingsList bookings={bookings.map(b => ({ ...b, documents: b.documents as { label: string; url: string }[] }))} />
    </div>
  );
}
