import { prisma } from "@/lib/prisma";
import { sendPushToCustomer } from "@/lib/push";

// Notify every group member except the actor — both an in-app inbox entry and a
// web-push to their devices — when something happens in the group.
export async function notifyGroup(groupId: string, actorId: string, title: string, body: string) {
  const members = await prisma.groupMember.findMany({ where: { groupId, NOT: { customerId: actorId } }, select: { customerId: true } });
  if (!members.length) return;
  const url = `/groups/${groupId}`;
  await Promise.all(members.flatMap(m => [
    prisma.memberNotification.create({ data: { customerId: m.customerId, title, body, url } }).catch(() => {}),
    sendPushToCustomer(m.customerId, { title, body, url }).catch(() => {}),
  ]));
}
