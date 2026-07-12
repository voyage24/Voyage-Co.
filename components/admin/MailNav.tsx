"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mail, Send, MailCheck, Archive, LayoutTemplate, Newspaper, LogOut } from "lucide-react";
import { canAccess } from "@/lib/admin/permissions";

const TABS = [
  { href: "/admin/mail", label: "Inbox", Icon: Mail },
  { href: "/admin/mail/compose", label: "Compose", Icon: Send },
  { href: "/admin/mail/sent", label: "Sent", Icon: MailCheck },
  { href: "/admin/mail/archive", label: "Archive", Icon: Archive },
  { href: "/admin/mail/templates", label: "Templates", Icon: LayoutTemplate },
  { href: "/admin/mail/newsletter", label: "Newsletter", Icon: Newspaper },
];

// Chrome for the dedicated "Voyages Mail" app. Tabs sit under the header on
// desktop and as a fixed, thumb-friendly bottom bar on phones. Trimmed to role.
export default function MailNav({ email, role = "owner" }: { email: string; role?: string }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const tabs = TABS.filter(t => canAccess(role, t.href));

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  };

  const Tab = ({ href, label, Icon }: { href: string; label: string; Icon: typeof Mail }) => {
    const active = href === "/admin/mail" ? pathname === href : pathname.startsWith(href);
    return (
      <Link href={href} className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${active ? "text-gold" : "text-gray-400 hover:text-gray-200"}`}>
        <Icon size={18} />
        <span>{label}</span>
        <span className={`h-0.5 w-8 rounded-full transition-colors ${active ? "bg-gold" : "bg-transparent"}`} />
      </Link>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-gray-900 text-gray-100" style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="flex items-center justify-between px-4 h-12">
          <span className="font-semibold text-sm tracking-[0.14em] uppercase">Voyages Mail</span>
          <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white" title={email}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
        {/* Desktop: tabs under the header */}
        <nav className="hidden sm:flex border-t border-white/10">
          {tabs.map(t => <Tab key={t.href} {...t} />)}
        </nav>
      </header>

      {/* Phone: fixed bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900 text-gray-100 border-t border-white/10 flex"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {tabs.map(t => <Tab key={t.href} {...t} />)}
      </nav>
    </>
  );
}
