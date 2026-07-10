"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Mail, Send, LayoutTemplate, Newspaper, LogOut } from "lucide-react";
import { canAccess } from "@/lib/admin/permissions";

const TABS = [
  { href: "/admin/mail", label: "Inbox", Icon: Mail },
  { href: "/admin/mail/compose", label: "Compose", Icon: Send },
  { href: "/admin/mail/templates", label: "Templates", Icon: LayoutTemplate },
  { href: "/admin/mail/newsletter", label: "Newsletter", Icon: Newspaper },
];

// Top chrome for the dedicated "Voyages Mail" app — only mail features, no link
// back into the rest of the admin console. Tabs are trimmed to the user's role.
export default function MailNav({ email, role = "owner" }: { email: string; role?: string }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const tabs = TABS.filter(t => canAccess(role, t.href));

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900 text-gray-100" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="flex items-center justify-between px-4 h-12">
        <span className="font-semibold text-sm tracking-[0.14em] uppercase">Voyages Mail</span>
        <button onClick={logout} className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white" title={email}>
          <LogOut size={14} /> Sign out
        </button>
      </div>
      <nav className="flex border-t border-white/10">
        {tabs.map(({ href, label, Icon }) => {
          const active = href === "/admin/mail" ? pathname === href : pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[11px] transition-colors ${active ? "text-gold" : "text-gray-400 hover:text-gray-200"}`}>
              <Icon size={17} />
              <span>{label}</span>
              <span className={`h-0.5 w-8 rounded-full transition-colors ${active ? "bg-gold" : "bg-transparent"}`} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
