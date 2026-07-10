import InboxClient from "@/components/admin/InboxClient";
import InstallMailApp from "@/components/admin/InstallMailApp";

export const dynamic = "force-dynamic";

export default function MailInboxPage() {
  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
      <InstallMailApp />
      <InboxClient />
    </div>
  );
}
