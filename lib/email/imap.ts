import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { prisma } from "@/lib/prisma";

// Fetches recent messages from the mailbox over IMAP and stores any new ones in
// InboundEmail (deduped by Message-ID). Credentials default to the SMTP login
// (Titan uses the same); IMAP_HOST defaults to Titan's server.
//
// Env: IMAP_HOST (default imap.titan.email), IMAP_PORT (993), IMAP_USER/PASS
// (fall back to SMTP_USER/SMTP_PASS).

export function imapConfigured(): boolean {
  return !!(process.env.IMAP_USER || process.env.SMTP_USER) && !!(process.env.IMAP_PASS || process.env.SMTP_PASS);
}

export async function fetchInbox(limit = 40): Promise<{ ok: boolean; fetched: number; new: number; error?: string }> {
  const user = process.env.IMAP_USER || process.env.SMTP_USER;
  const pass = process.env.IMAP_PASS || process.env.SMTP_PASS;
  if (!user || !pass) return { ok: false, fetched: 0, new: 0, error: "IMAP not configured" };
  // Diagnostic: which credential source + masked user was attempted.
  const source = process.env.IMAP_USER ? "IMAP_USER" : "SMTP_USER (fallback)";
  const maskedUser = user.replace(/^(.{2}).*(@.*)$/, "$1***$2");
  const who = ` [tried ${maskedUser} via ${source}, pass len ${pass.length}]`;

  const client = new ImapFlow({
    host: process.env.IMAP_HOST || "imap.titan.email",
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: { user, pass },
    logger: false,
  });

  let fetched = 0;
  let added = 0;
  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      const status = await client.status("INBOX", { messages: true });
      const total = status.messages || 0;
      if (total === 0) return { ok: true, fetched: 0, new: 0 };
      // Fetch the most recent `limit` messages.
      const start = Math.max(1, total - limit + 1);
      for await (const msg of client.fetch(`${start}:*`, { envelope: true, source: true, uid: true })) {
        fetched++;
        const parsed = await simpleParser(msg.source as Buffer);
        const messageId = parsed.messageId || `${msg.uid}@voyagesco-imap`;
        const exists = await prisma.inboundEmail.findUnique({ where: { messageId }, select: { id: true } });
        if (exists) continue;
        const from = parsed.from?.value?.[0];
        await prisma.inboundEmail.create({
          data: {
            messageId,
            uid: msg.uid ?? null,
            fromName: from?.name || null,
            fromEmail: from?.address || "unknown",
            toEmail: Array.isArray(parsed.to) ? parsed.to[0]?.text : parsed.to?.text || null,
            subject: parsed.subject || null,
            bodyText: parsed.text?.slice(0, 20000) || null,
            bodyHtml: (typeof parsed.html === "string" ? parsed.html : null)?.slice(0, 80000) || null,
            receivedAt: parsed.date || new Date(),
          },
        }).then(() => { added++; }).catch(() => { /* dedupe race / bad row */ });
      }
    } finally {
      lock.release();
    }
    return { ok: true, fetched, new: added };
  } catch (err) {
    console.error("IMAP fetch failed:", err);
    // Surface the underlying reason so setup issues are diagnosable.
    const raw = (err as { responseText?: string; message?: string; code?: string }) || {};
    const detail = raw.responseText || raw.message || raw.code || "unknown error";
    const hint = /ENOTFOUND|EAI_AGAIN/i.test(detail)
      ? "host not found — check IMAP_HOST"
      : /AUTHENTICATION|invalid credentials|LOGIN failed/i.test(detail)
      ? "login rejected — check the mailbox username/password or enable IMAP"
      : /timeout|ETIMEDOUT|ECONNREFUSED/i.test(detail)
      ? "could not connect — check IMAP_HOST / IMAP_PORT"
      : "";
    return { ok: false, fetched, new: added, error: `IMAP: ${detail}${hint ? ` (${hint})` : ""}${who}`.slice(0, 320) };
  } finally {
    try { await client.logout(); } catch { /* ignore */ }
  }
}
