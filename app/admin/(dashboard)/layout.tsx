import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import { canAccess } from "@/lib/admin/permissions";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getAdminNotifications } from "@/lib/admin/notifications";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  const user = await getSessionUser(token);

  if (!user) redirect("/admin/login");

  // Role-based access: bounce to the dashboard when this role can't open the
  // requested section (path forwarded by middleware).
  const path = headers().get("x-admin-path");
  if (path && path !== "/admin" && !canAccess(user.role, path)) redirect("/admin");

  const notifications = await getAdminNotifications();

  return (
    <div className="admin-root flex min-h-screen bg-[#f6f6f3] dark:bg-[#0b131d]">
      <AdminSidebar role={user.role} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar email={user?.email ?? ""} notifications={notifications} role={user.role} />
        <main className="admin-main flex-1 min-w-0 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
