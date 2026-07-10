import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getAdminNotifications } from "@/lib/admin/notifications";
import type { Metadata } from "next";

// Makes the admin installable as its own "Voyages Mail" home-screen app
// (separate from the customer site app), opening straight to the inbox.
export const metadata: Metadata = {
  manifest: "/mail.webmanifest",
  appleWebApp: { capable: true, title: "Voyages Mail", statusBarStyle: "black-translucent" },
};

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) redirect("/admin/login");

  const notifications = await getAdminNotifications();

  return (
    <div className="admin-root flex min-h-screen bg-[#f6f6f3] dark:bg-[#0b131d]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar email={user?.email ?? ""} notifications={notifications} />
        <main className="admin-main flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
