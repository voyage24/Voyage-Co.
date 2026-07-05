"use client";

import { useRouter } from "next/navigation";
import AdminMobileNav from "@/components/admin/AdminMobileNav";
import AdminSearch from "@/components/admin/AdminSearch";
import AdminNotifications from "@/components/admin/AdminNotifications";
import ThemeToggle from "@/components/ui/ThemeToggle";
import type { AdminNotifications as AdminNotifs } from "@/lib/admin/notifications";

export default function AdminTopbar({ email, notifications }: { email: string; notifications: AdminNotifs }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <header className="flex items-center justify-between gap-3 border-b border-black/[0.06] dark:border-white/[0.06] px-4 sm:px-6 py-3 bg-white">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <AdminMobileNav />
        <AdminSearch />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <AdminNotifications data={notifications} />
        <ThemeToggle size={17} />
        <span className="hidden md:inline text-xs text-gray-400 truncate max-w-[160px]">{email}</span>
        <a
          href="https://voyagesco.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-block text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 transition-colors"
        >
          View site ↗
        </a>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md px-3 py-1.5 transition-colors"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
