import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import AccountSettings from "@/components/admin/AccountSettings";
import MojibakeFixer from "@/components/admin/MojibakeFixer";
import PushAlertsToggle from "@/components/admin/PushAlertsToggle";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const user = await getSessionUser(cookies().get(SESSION_COOKIE_NAME)?.value);
  if (!user) redirect("/admin/login");

  const admins = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, createdAt: true, lastLoginAt: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h1>
      <p className="text-sm text-gray-500 mb-5">Signed in as {user.email}.</p>
      <AccountSettings admins={admins} currentId={user.id} />
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">This Device</h2>
        <p className="text-xs text-gray-500 mb-2 max-w-md">
          Get a push notification for new bookings, enquiries, follow-ups and mail on this device — even when the admin panel is closed, and even if your session later expires.
        </p>
        <PushAlertsToggle />
      </div>
      <div className="mt-8">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Maintenance</h2>
        <MojibakeFixer />
      </div>
    </div>
  );
}
