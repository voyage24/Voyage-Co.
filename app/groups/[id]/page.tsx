import { redirect } from "next/navigation";
import { getCurrentCustomer } from "@/lib/customer/session";
import { getGroupSnapshot } from "@/lib/group/access";
import GroupWorkspace from "@/components/groups/GroupWorkspace";

export const dynamic = "force-dynamic";

export default async function GroupPage({ params }: { params: { id: string } }) {
  const customer = await getCurrentCustomer();
  if (!customer) redirect(`/login?next=/groups/${params.id}`);
  const snapshot = await getGroupSnapshot(params.id, customer!.id);
  if (!snapshot) redirect("/groups");
  return <GroupWorkspace initial={snapshot} meId={customer!.id} />;
}
