import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUser, SESSION_COOKIE_NAME } from "@/lib/admin/session";
import TeamManager from "@/components/admin/TeamManager";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage() {
  const me = await getSessionUser(cookies().get(SESSION_COOKIE_NAME)?.value);
  const users = await prisma.adminUser.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, lastLoginAt: true },
  });
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Team</h1>
      <p className="text-sm text-gray-500 mb-5">Admin accounts that can sign in to manage the site.</p>
      <TeamManager users={users} meId={me?.id ?? ""} />
    </div>
  );
}
