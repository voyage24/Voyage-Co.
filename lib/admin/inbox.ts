import { prisma } from "@/lib/prisma";
import { imapConfigured } from "@/lib/email/imap";

// Current inbox snapshot (recent, non-archived) — used by the inbox API and
// server-rendered into the mail app so it opens instantly instead of loading
// the page and then fetching the list in a second round-trip.
export type InboxEmail = {
  id: string; fromName: string | null; fromEmail: string; toEmail: string | null; subject: string | null;
  bodyText: string | null; bodyHtml: string | null; receivedAt: string; read: boolean;
};

export async function getInboxList(): Promise<{ emails: InboxEmail[]; unread: number; configured: boolean }> {
  const [emails, unread] = await Promise.all([
    prisma.inboundEmail.findMany({ where: { archived: false }, orderBy: { receivedAt: "desc" }, take: 60 }),
    prisma.inboundEmail.count({ where: { archived: false, read: false } }),
  ]);
  return {
    emails: emails.map(e => ({
      id: e.id, fromName: e.fromName, fromEmail: e.fromEmail, toEmail: e.toEmail, subject: e.subject,
      bodyText: e.bodyText, bodyHtml: e.bodyHtml, receivedAt: e.receivedAt.toISOString(), read: e.read,
    })),
    unread,
    configured: imapConfigured(),
  };
}
