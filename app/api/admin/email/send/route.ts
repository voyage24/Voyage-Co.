import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { createTransport } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { signatureFor, stripTrailingSignoff } from "@/lib/email/signatures";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// General "compose" — send a branded concierge email to any recipient from the
// admin, in-house via our own SMTP. No third-party mail app needed.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { to, subject, message, name, cc, bcc, from, attachments } = await req.json().catch(() => ({}));
  const recipient = String(to || "").trim();

  // Attachments arrive as { filename, url } (uploaded to Blob). nodemailer
  // fetches each by href. Keep only https URLs on our own Blob host, capped.
  const mailAttachments = (Array.isArray(attachments) ? attachments : [])
    .filter((a: unknown): a is { filename: string; url: string } => {
      const o = a as { filename?: unknown; url?: unknown };
      return typeof o?.url === "string" && /^https:\/\/[a-z0-9.-]*\.public\.blob\.vercel-storage\.com\//i.test(o.url) && typeof o?.filename === "string";
    })
    .slice(0, 10)
    .map(a => ({ filename: a.filename, href: a.url }));

  // Optional reply-from alias: replies go out from the address the customer
  // wrote to (e.g. concierge@) — but only ever an address on our own domain,
  // so this can't be used to spoof arbitrary senders.
  const ownDomain = (process.env.SMTP_USER || "").split("@")[1]?.toLowerCase();
  const fromAddr = String(from || "").trim().toLowerCase();
  const useAlias = ownDomain && EMAIL_RE.test(fromAddr) && fromAddr.endsWith(`@${ownDomain}`);
  const effectiveAddr = useAlias ? fromAddr : (process.env.SMTP_USER || "");
  const sig = signatureFor(effectiveAddr);
  const sender = `"${sig.name}" <${effectiveAddr}>`;
  if (!EMAIL_RE.test(recipient)) return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 });
  if (!subject || !String(subject).trim()) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!message || !String(message).trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  // CC / BCC: comma or semicolon separated, keep only valid addresses.
  const parseList = (v: unknown) => String(v || "").split(/[,;]/).map(s => s.trim()).filter(s => EMAIL_RE.test(s));
  const ccList = parseList(cc);
  const bccList = parseList(bcc);

  const first = String(name || "").trim().split(" ")[0];
  const heading = first ? `Dear ${first}` : "Hello";
  // The template signs the email off, so drop any sign-off left at the end of
  // the body — otherwise the message closes twice.
  const bodyText = stripTrailingSignoff(String(message).trim());
  const bodyHtml = bodyText.split(/\n{2,}/).map(p => `<p style="margin:0 0 16px;">${p.replace(/\n/g, "<br/>")}</p>`).join("");

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: sender,
      to: recipient,
      ...(ccList.length ? { cc: ccList } : {}),
      ...(bccList.length ? { bcc: bccList } : {}),
      ...(mailAttachments.length ? { attachments: mailAttachments } : {}),
      subject: String(subject).trim(),
      text: renderConciergeEmailText({ heading, bodyText, signoff: sig.opening, team: sig.team }),
      html: renderConciergeEmailHTML({ eyebrow: sig.eyebrow, heading, bodyHtml, signoff: sig.opening, team: sig.team }),
    });
  } catch (err) {
    console.error("Compose email failed:", err);
    return NextResponse.json({ error: "Could not send — check email settings." }, { status: 500 });
  }

  // Record in the mail app's Sent folder (SMTP sends don't reach the mailbox's
  // own Sent folder, so the site keeps its own).
  await prisma.sentEmail.create({
    data: {
      toEmail: recipient,
      cc: ccList.length ? ccList.join(", ") : null,
      bcc: bccList.length ? bccList.join(", ") : null,
      fromEmail: sender.match(/<([^>]+)>/)?.[1] || sender,
      subject: String(subject).trim(),
      bodyText,
    },
  }).catch(() => {});

  await logAudit(admin.email, "send", "email", recipient, String(subject).trim());
  return NextResponse.json({ ok: true });
}
