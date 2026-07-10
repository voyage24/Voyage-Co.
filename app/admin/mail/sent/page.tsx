import { prisma } from "@/lib/prisma";
import { MailCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MailSentPage() {
  const emails = await prisma.sentEmail.findMany({ orderBy: { createdAt: "desc" }, take: 60 });

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Sent</h1>
      {emails.length === 0 ? (
        <p className="text-sm text-gray-400 border border-dashed border-gray-200 rounded-md p-8 text-center">Nothing sent from the site yet.</p>
      ) : (
        <div className="space-y-2">
          {emails.map(e => (
            <details key={e.id} className="border border-gray-200 rounded-lg bg-white">
              <summary className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
                <MailCheck size={16} className="text-emerald-600 shrink-0" />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-gray-900 truncate">To: {e.toEmail}</span>
                  <span className="block text-xs text-gray-500 truncate">{e.subject}</span>
                </span>
                <span className="text-xs text-gray-400 shrink-0">
                  {e.createdAt.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{" "}
                  {e.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </summary>
              <div className="border-t border-gray-100 px-4 py-3">
                <p className="text-xs text-gray-400 mb-2">
                  From {e.fromEmail}
                  {e.cc && <> · Cc: {e.cc}</>}
                  {e.bcc && <> · Bcc: {e.bcc}</>}
                </p>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{e.bodyText}</div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
