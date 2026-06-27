"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/enquiries", label: "Enquiries" },
  { href: "/admin/hotels", label: "Hotels" },
  { href: "/admin/flights", label: "Flights" },
  { href: "/admin/trains", label: "Trains" },
  { href: "/admin/experiences", label: "Experiences" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/cruises", label: "Cruises" },
  { href: "/admin/blog", label: "Blog Posts" },
  { href: "/admin/destinations", label: "Featured Destinations" },
  { href: "/admin/newsletter", label: "Newsletter" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block w-56 shrink-0 bg-gray-900 text-gray-200 min-h-screen p-4">
      <p className="text-white font-semibold text-sm px-2 mb-6">Voyages & Co. Admin</p>
      <ul className="space-y-1">
        {NAV_ITEMS.map(item => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  active ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
