import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// General "compose" — send a branded concierge email to any recipient from the
// admin, in-house via our own SMTP. No third-party mail app needed.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { to, subject, message, name, cc, bcc, from } = await req.json().catch(() => ({}));
  const recipient = String(to || "").trim();

  // Optional reply-from alias: replies go out from the address the customer
  // wrote to (e.g. concierge@) — but only ever an address on our own domain,
  // so this can't be used to spoof arbitrary senders.
  const ownDomain = (process.env.SMTP_USER || "").split("@")[1]?.toLowerCase();
  const fromAddr = String(from || "").trim().toLowerCase();
  const sender = ownDomain && EMAIL_RE.test(fromAddr) && fromAddr.endsWith(`@${ownDomain}`)
    ? `"Voyages & Co. Concierge" <${fromAddr}>`
    : FROM_CONCIERGE();
  if (!EMAIL_RE.test(recipient)) return NextResponse.json({ error: "A valid recipient email is required" }, { status: 400 });
  if (!subject || !String(subject).trim()) return NextResponse.json({ error: "Subject is required" }, { status: 400 });
  if (!message || !String(message).trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  // CC / BCC: comma or semicolon separated, keep only valid addresses.
  const parseList = (v: unknown) => String(v || "").split(/[,;]/).map(s => s.trim()).filter(s => EMAIL_RE.test(s));
  const ccList = parseList(cc);
  const bccList = parseList(bcc);

  const first = String(name || "").trim().split(" ")[0];
  const heading = first ? `Dear ${first}` : "Hello";
  const bodyHtml = String(message).trim().split(/\n{2,}/).map(p => `<p style="margin:0 0 16px;">${p.replace(/\n/g, "<br/>")}</p>`).join("");

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: sender,
      to: recipient,
      ...(ccList.length ? { cc: ccList } : {}),
      ...(bccList.length ? { bcc: bccList } : {}),
      subject: String(subject).trim(),
      text: renderConciergeEmailText({ heading, bodyText: String(message).trim(), signoff: "With warm regards," }),
      html: renderConciergeEmailHTML({ eyebrow: "Voyages & Co. Concierge", heading, bodyHtml, signoff: "With warm regards," }),
    });
  } catch (err) {
    console.error("Compose email failed:", err);
    return NextResponse.json({ error: "Could not send — check email settings." }, { status: 500 });
  }

  await logAudit(admin.email, "send", "email", recipient, String(subject).trim());
  return NextResponse.json({ ok: true });
}
