import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";
import { reSubject } from "@/lib/email/compose-drafts";

// Sends a branded concierge reply to an enquiry from our own SMTP — same
// template as booking emails, no third-party mail app needed. Marks the
// enquiry contacted + handled once a reply goes out.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { subject, message } = await req.json().catch(() => ({}));
  if (!message || !String(message).trim()) return NextResponse.json({ error: "Message is required" }, { status: 400 });

  const enquiry = await prisma.enquiry.findUnique({ where: { id: params.id }, select: { email: true, name: true, subject: true, itemTitle: true } });
  if (!enquiry?.email) return NextResponse.json({ error: "No email on this enquiry" }, { status: 400 });

  const first = (enquiry.name || "").split(" ")[0];
  const heading = first ? `Dear ${first}` : "Hello";
  const subj = String(subject || "").trim() || reSubject(enquiry.subject || enquiry.itemTitle);
  const bodyHtml = String(message).trim().split(/\n{2,}/).map(p => `<p style="margin:0 0 16px;">${p.replace(/\n/g, "<br/>")}</p>`).join("");

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to: enquiry.email,
      subject: subj,
      text: renderConciergeEmailText({ heading, bodyText: String(message).trim(), signoff: "With warm regards," }),
      html: renderConciergeEmailHTML({ eyebrow: "Voyages & Co. Concierge", heading, bodyHtml, signoff: "With warm regards," }),
    });
  } catch (err) {
    console.error("Enquiry reply email failed:", err);
    return NextResponse.json({ error: "Could not send — check email settings." }, { status: 500 });
  }

  await prisma.enquiry.update({ where: { id: params.id }, data: { status: "handled", stage: "contacted" } }).catch(() => {});
  await logAudit(admin.email, "reply", "enquiry", params.id, subj);
  return NextResponse.json({ ok: true });
}
