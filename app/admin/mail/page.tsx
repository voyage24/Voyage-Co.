import InboxClient from "@/components/admin/InboxClient";
import InstallMailApp from "@/components/admin/InstallMailApp";
import { getInboxList } from "@/lib/admin/inbox";

export const dynamic = "force-dynamic";

export default async function MailInboxPage() {
  // Server-rendered snapshot: the list paints with the page, no second fetch.
  const initial = await getInboxList();
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
      <InstallMailApp />
      <InboxClient initial={initial} />
    </div>
  );
}
