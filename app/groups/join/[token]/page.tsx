import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentCustomer } from "@/lib/customer/session";

export const dynamic = "force-dynamic";

// Invite link. If signed out, bounce through login and come back here; if signed
// in, add the member to the group and open the workspace.
export default async function JoinGroupPage({ params }: { params: { token: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/login?next=${encodeURIComponent(`/groups/join/${params.token}`)}`);

  const group = await prisma.groupTrip.findUnique({ where: { shareToken: params.token }, select: { id: true } });
  if (!group) redirect("/groups?invite=invalid");

  await prisma.groupMember.upsert({
    where: { groupId_customerId: { groupId: group.id, customerId: customer!.id } },
    update: {},
    create: { groupId: group.id, customerId: customer!.id, role: "member" },
  });
  redirect(`/groups/${group.id}`);
}
