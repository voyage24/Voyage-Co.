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
  { key: "newsletter", label: "Newsletter Subscribers", href: "/admin/newsletter" },
] as const;

export default async function AdminDashboardPage() {
  const [hotel, flight, train, experience, pkg, cruise, blogPost, featuredDestination, newsletter] = await Promise.all([
    prisma.hotel.count(),
    prisma.flight.count(),
    prisma.train.count(),
    prisma.experience.count(),
    prisma.package.count(),
    prisma.cruise.count(),
    prisma.blogPost.count(),
    prisma.featuredDestination.count(),
    prisma.newsletterSubscriber.count(),
  ]);

  const counts: Record<string, number> = { hotel, flight, train, experience, package: pkg, cruise, blogPost, featuredDestination, newsletter };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>
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
