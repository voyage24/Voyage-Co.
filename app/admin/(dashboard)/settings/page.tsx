import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import AccountSettings from "@/components/admin/AccountSettings";

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
    </div>
  );
}
