import Link from "next/link";
import { Smartphone } from "lucide-react";
import InboxClient from "@/components/admin/InboxClient";

export const dynamic = "force-dynamic";

export default function AdminInboxPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Inbox</h1>
          <p className="text-sm text-gray-500">Replies from your mailbox, pulled into the site so you can read and respond here. Messages also remain in your Titan mailbox.</p>
        </div>
        <Link href="/admin/mail" className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 border border-gray-200 rounded-md px-3 py-1.5 shrink-0">
          <Smartphone size={14} /> Open Mail app
        </Link>
      </div>
      <InboxClient />
    </div>
  );
}
