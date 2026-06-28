"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Grouped ("indexed") navigation so the growing admin stays organised.
export const NAV_SECTIONS: { title: string | null; items: { href: string; label: string }[] }[] = [
  {
    title: null,
    items: [{ href: "/admin", label: "Dashboard" }],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/bookings", label: "Bookings" },
      { href: "/admin/enquiries", label: "Enquiries" },
      { href: "/admin/customers", label: "Customers" },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/hotels", label: "Hotels" },
      { href: "/admin/flights", label: "Flights" },
      { href: "/admin/trains", label: "Trains" },
      { href: "/admin/experiences", label: "Experiences" },
      { href: "/admin/packages", label: "Packages" },
      { href: "/admin/cruises", label: "Cruises" },
      { href: "/admin/blog", label: "Blog Posts" },
      { href: "/admin/destinations", label: "Featured Destinations" },
      { href: "/admin/testimonials", label: "Testimonials" },
    ],
  },
  {
    title: "Storefront",
    items: [
      { href: "/admin/storefront", label: "Storefront" },
      { href: "/admin/media", label: "Media Library" },
    ],
  },
  {
    title: "Marketing",
    items: [{ href: "/admin/newsletter", label: "Newsletter" }],
  },
  {
    title: "Configuration",
    items: [
      { href: "/admin/appearance", label: "Appearance" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

// Flat list kept for any consumer that just needs every link.
export const NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav className="hidden lg:block w-56 shrink-0 bg-gray-900 text-gray-200 min-h-screen p-4">
      <p className="text-white font-semibold text-sm px-2 mb-6">Voyages &amp; Co. Admin</p>
      <div className="space-y-6">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.title ?? i}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-500">{section.title}</p>
            )}
            <ul className="space-y-1">
              {section.items.map(item => {
                const active = isActive(pathname, item.href);
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
          </div>
        ))}
      </div>
    </nav>
  );
}
