import { prisma } from "@/lib/prisma";
import PushBroadcast from "@/components/admin/PushBroadcast";

export const dynamic = "force-dynamic";

export default async function AdminNotificationsPage() {
  const count = await prisma.pushSubscription.count().catch(() => 0);
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-1">Push Notifications</h1>
      <p className="text-sm text-gray-500 mb-5">Broadcast a notification to everyone who has enabled push on your site. <strong>{count}</strong> {count === 1 ? "subscriber" : "subscribers"} currently.</p>
      <PushBroadcast />
    </div>
  );
}
