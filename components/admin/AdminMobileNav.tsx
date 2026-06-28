"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_SECTIONS } from "@/components/admin/AdminSidebar";

export default function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="Open menu" className="text-gray-700">
        <Menu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 text-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-white font-semibold text-sm">Voyages & Co. Admin</p>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-5">
              {NAV_SECTIONS.map((section, i) => (
                <div key={section.title ?? i}>
                  {section.title && (
                    <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-[0.14em] uppercase text-gray-500">{section.title}</p>
                  )}
                  <ul className="space-y-1">
                    {section.items.map(item => {
                      const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={() => setOpen(false)}
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
          </div>
        </div>
      )}
    </div>
  );
}
