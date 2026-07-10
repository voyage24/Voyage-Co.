import { prisma } from "@/lib/prisma";
import { imapConfigured } from "@/lib/email/imap";

// Current inbox snapshot (recent, non-archived) — used by the inbox API and
// server-rendered into the mail app so it opens instantly instead of loading
// the page and then fetching the list in a second round-trip.
export type InboxEmail = {
  id: string; fromName: string | null; fromEmail: string; toEmail: string | null; subject: string | null;
  bodyText: string | null; bodyHtml: string | null; receivedAt: string; read: boolean;
  replyTo: string;            // the OTHER party — never our own mailbox
  replyName: string | null;   // their display name (for the greeting)
  replyFrom: string;          // our address/alias the reply should go out from
};

const addr = (s: string | null | undefined) => (s || "").match(/[\w.+-]+@[\w.-]+\.\w+/)?.[0]?.toLowerCase() || "";

export async function getInboxList(): Promise<{ emails: InboxEmail[]; unread: number; configured: boolean }> {
  const [emails, unread] = await Promise.all([
    prisma.inboundEmail.findMany({ where: { archived: false }, orderBy: { receivedAt: "desc" }, take: 60 }),
    prisma.inboundEmail.count({ where: { archived: false, read: false } }),
  ]);
  const ourDomain = (process.env.SMTP_USER || "").split("@")[1]?.toLowerCase() || "";
  return {
    emails: emails.map(e => {
      const from = addr(e.fromEmail);
      const to = addr(e.toEmail);
      // A message FROM our own domain is a self-copy (cc'd reply, bounce test…),
      // so "reply" targets its recipient — otherwise the sender, as usual.
      const mine = !!ourDomain && from.endsWith(`@${ourDomain}`);
      return {
        id: e.id, fromName: e.fromName, fromEmail: e.fromEmail, toEmail: e.toEmail, subject: e.subject,
        bodyText: e.bodyText, bodyHtml: e.bodyHtml, receivedAt: e.receivedAt.toISOString(), read: e.read,
        replyTo: mine ? (to || from) : from,
        replyName: mine ? null : e.fromName,
        replyFrom: mine ? from : (to.endsWith(`@${ourDomain}`) ? to : ""),
      };
    }),
    unread,
    configured: imapConfigured(),
  };
}
