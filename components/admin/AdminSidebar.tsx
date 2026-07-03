"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BarChart3, CalendarCheck, Inbox, FileText, Star, Users,
  BedDouble, Plane, TrainFront, Sparkles, Package, Ship, Newspaper, MapPin,
  Quote, Award, Image as ImageIcon, Store, FolderOpen, Mail, Gift, Tag, Bell,
  Palette, UserCog, Settings, type LucideIcon,
} from "lucide-react";

// Grouped ("indexed") navigation so the growing admin stays organised.
export const NAV_SECTIONS: { title: string | null; items: { href: string; label: string; icon: LucideIcon }[] }[] = [
  {
    title: null,
    items: [
      { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Sales",
    items: [
      { href: "/admin/bookings", label: "Bookings", icon: CalendarCheck },
      { href: "/admin/enquiries", label: "Enquiries", icon: Inbox },
      { href: "/admin/quotes", label: "Quotes", icon: FileText },
      { href: "/admin/reviews", label: "Reviews", icon: Star },
      { href: "/admin/customers", label: "Customers", icon: Users },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/admin/hotels", label: "Hotels", icon: BedDouble },
      { href: "/admin/flights", label: "Flights", icon: Plane },
      { href: "/admin/trains", label: "Trains", icon: TrainFront },
      { href: "/admin/experiences", label: "Experiences", icon: Sparkles },
      { href: "/admin/packages", label: "Packages", icon: Package },
      { href: "/admin/cruises", label: "Cruises", icon: Ship },
      { href: "/admin/blog", label: "Blog Posts", icon: Newspaper },
      { href: "/admin/destinations", label: "Featured Destinations", icon: MapPin },
      { href: "/admin/testimonials", label: "Testimonials", icon: Quote },
      { href: "/admin/press", label: "Press & Awards", icon: Award },
      { href: "/admin/moments", label: "Moments", icon: ImageIcon },
    ],
  },
  {
    title: "Storefront",
    items: [
      { href: "/admin/storefront", label: "Storefront", icon: Store },
      { href: "/admin/media", label: "Media Library", icon: FolderOpen },
    ],
  },
  {
    title: "Marketing",
    items: [
      { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
      { href: "/admin/giftcards", label: "Gift Cards", icon: Gift },
      { href: "/admin/offers", label: "Offers", icon: Tag },
      { href: "/admin/notifications", label: "Push Notifications", icon: Bell },
    ],
  },
  {
    title: "Configuration",
    items: [
      { href: "/admin/appearance", label: "Appearance", icon: Palette },
      { href: "/admin/team", label: "Team", icon: UserCog },
      { href: "/admin/settings", label: "Settings", icon: Settings },
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
  let navIndex = 0; // flat counter for staggering the link entrance animation

  return (
    <nav className="hidden lg:flex flex-col w-60 shrink-0 bg-gray-100 text-gray-600 min-h-screen border-r border-black/[0.05]">
      <div className="px-5 py-5 border-b border-black/[0.06]">
        <p className="font-serif text-lg font-light text-gray-900 leading-none">Voyages &amp; Co.</p>
        <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mt-1 font-semibold">Admin</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {NAV_SECTIONS.map((section, i) => (
          <div key={section.title ?? i}>
            {section.title && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-600">{section.title}</p>
            )}
            <ul className="space-y-0.5">
              {section.items.map(item => {
                const active = isActive(pathname, item.href);
                const delay = navIndex++ * 25;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      style={{ animationDelay: `${delay}ms` }}
                      className={`admin-nav-link group flex items-center gap-3 pl-3 pr-3 py-2 rounded-md text-sm border-l-2 transition-[background-color,color,border-color,transform] duration-200 hover:translate-x-1 ${
                        active
                          ? "bg-indigo-500/[0.12] text-gray-900 border-indigo-400"
                          : "text-gray-500 border-transparent hover:bg-black/[0.05] dark:hover:bg-white/[0.06] hover:text-gray-900"
                      }`}
                    >
                      <item.icon size={16} className={active ? "text-gray-900" : "text-gray-500 group-hover:text-gray-800"} />
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
