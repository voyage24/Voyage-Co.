import InboxClient from "@/components/admin/InboxClient";

export const dynamic = "force-dynamic";

export default function AdminInboxPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
        <p className="text-sm text-gray-500">Replies from your mailbox, pulled into the site so you can read and respond here. Messages also remain in your Titan mailbox.</p>
      </div>
      <InboxClient />
    </div>
  );
}
