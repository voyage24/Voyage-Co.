import Link from "next/link";
import { prisma } from "@/lib/prisma";

const CARDS = [
  { key: "hotel", label: "Hotels", href: "/admin/hotels" },
  { key: "flight", label: "Flights", href: "/admin/flights" },
  { key: "train", label: "Trains", href: "/admin/trains" },
  { key: "experience", label: "Experiences", href: "/admin/experiences" },
  { key: "package", label: "Packages", href: "/admin/packages" },
  { key: "cruise", label: "Cruises", href: "/admin/cruises" },
  { key: "blogPost", label: "Blog Posts", href: "/admin/blog" },
  { key: "featuredDestination", label: "Featured Destinations", href: "/admin/destinations" },
  { key: "testimonial", label: "Testimonials", href: "/admin/testimonials" },
  { key: "customer", label: "Customers", href: "/admin/customers" },
  { key: "newsletter", label: "Newsletter Subscribers", href: "/admin/newsletter" },
] as const;

export default async function AdminDashboardPage() {
  const [hotel, flight, train, experience, pkg, cruise, blogPost, featuredDestination, newsletter, newEnquiries, testimonial, pendingBookings, customer] = await Promise.all([
    prisma.hotel.count(),
    prisma.flight.count(),
    prisma.train.count(),
    prisma.experience.count(),
    prisma.package.count(),
    prisma.cruise.count(),
    prisma.blogPost.count(),
    prisma.featuredDestination.count(),
    prisma.newsletterSubscriber.count(),
    prisma.enquiry.count({ where: { status: "new" } }),
    prisma.testimonial.count(),
    prisma.booking.count({ where: { status: "pending" } }),
    prisma.customer.count(),
  ]);

  const counts: Record<string, number> = { hotel, flight, train, experience, package: pkg, cruise, blogPost, featuredDestination, newsletter, testimonial, customer };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Link
          href="/admin/bookings"
          className={`block rounded-lg p-5 border transition-colors ${
            pendingBookings > 0 ? "bg-amber-50 border-amber-300 hover:border-amber-400" : "bg-white border-gray-200 hover:border-gray-400"
          }`}
        >
          <p className="text-3xl font-semibold text-gray-900">{pendingBookings}</p>
          <p className="text-sm text-gray-600 mt-1">
            Pending {pendingBookings === 1 ? "booking" : "bookings"} {pendingBookings > 0 ? "— awaiting confirmation" : ""}
          </p>
        </Link>
        <Link
          href="/admin/enquiries"
          className={`block rounded-lg p-5 border transition-colors ${
            newEnquiries > 0 ? "bg-amber-50 border-amber-300 hover:border-amber-400" : "bg-white border-gray-200 hover:border-gray-400"
          }`}
        >
          <p className="text-3xl font-semibold text-gray-900">{newEnquiries}</p>
          <p className="text-sm text-gray-600 mt-1">
            New {newEnquiries === 1 ? "enquiry" : "enquiries"} {newEnquiries > 0 ? "— awaiting follow-up" : ""}
          </p>
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {CARDS.map(c => (
          <Link
            key={c.key}
            href={c.href}
            className="bg-white border border-gray-200 rounded-lg p-5 hover:border-gray-400 transition-colors"
          >
            <p className="text-3xl font-semibold text-gray-900">{counts[c.key]}</p>
            <p className="text-sm text-gray-500 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
