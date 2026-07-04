"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_SECTIONS } from "@/components/admin/AdminSidebar";

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  let navIndex = 0; // flat counter for staggering the link entrance

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-gray-700">
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          {/* Mirrors the desktop sidebar exactly — same grouped sections and
              icons, theme-aware surface, slides in from the left. */}
          <div className="drawer-panel absolute left-0 top-0 bottom-0 w-64 bg-white text-gray-600 p-4 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6 px-1">
              <div>
                <p className="text-gray-900 font-semibold text-sm leading-none">Voyages &amp; Co.</p>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 mt-1 font-semibold">Admin</p>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-gray-400 hover:text-gray-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5">
              {NAV_SECTIONS.map((section, i) => (
                <div key={section.title ?? i}>
                  {section.title && (
                    <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-600">{section.title}</p>
                  )}
                  <ul className="space-y-0.5">
                    {section.items.map(item => {
                      const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                      const delay = navIndex++ * 22;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
                            style={{ animationDelay: `${delay}ms` }}
                            className={`drawer-item group flex items-center gap-3 px-3 py-2 rounded-md text-sm border-l-2 transition-colors ${
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
          </div>
        </div>
      )}
    </div>
  );
}
