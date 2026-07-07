import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { logAudit } from "@/lib/admin/audit";
import { createTransport, FROM_CONCIERGE } from "@/lib/email/transport";
import { renderConciergeEmailHTML, renderConciergeEmailText } from "@/lib/email/template";

// Emails the customer their quotation with a branded concierge email + a button
// to view/accept it online — same template as booking/enquiry emails. Marks the
// quote "sent".
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const q = await prisma.quote.findUnique({ where: { id: params.id } });
  if (!q) return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  if (!q.customerEmail) return NextResponse.json({ error: "No customer email on this quote" }, { status: 400 });

  const first = (q.customerName || "").split(" ")[0];
  const heading = first ? `Dear ${first}` : "Your quotation";
  const money = q.currency === "INR" ? `₹${q.total.toLocaleString("en-IN")}` : `${q.currency} ${q.total.toLocaleString()}`;
  const link = `https://voyagesco.com/quote/${q.token}`;
  const valid = q.validUntil ? `<p style="margin:0 0 6px;"><strong>Valid until:</strong> ${q.validUntil}</p>` : "";

  const bodyHtml = `
    <p style="margin:0 0 16px;">It was our pleasure to prepare your bespoke quotation. Please find the summary below — tap through to view the full details and confirm at your convenience.</p>
    <p style="margin:0 0 6px;"><strong>${q.title}</strong></p>
    <p style="margin:0 0 6px;"><strong>Total:</strong> ${money}</p>
    ${valid}`;
  const bodyText = `It was our pleasure to prepare your bespoke quotation.\n\n${q.title}\nTotal: ${money}\n${q.validUntil ? `Valid until: ${q.validUntil}\n` : ""}\nView your quote: ${link}`;

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_CONCIERGE(),
      to: q.customerEmail,
      subject: `Your quotation — ${q.title}`,
      text: renderConciergeEmailText({ heading, bodyText, signoff: "With warm regards," }),
      html: renderConciergeEmailHTML({ eyebrow: "Your Quotation", heading, bodyHtml, signoff: "With warm regards,", ctaLabel: "View your quote", ctaHref: link }),
    });
  } catch (err) {
    console.error("Quote send email failed:", err);
    return NextResponse.json({ error: "Could not send — check email settings." }, { status: 500 });
  }

  await prisma.quote.update({ where: { id: q.id }, data: { status: "sent" } }).catch(() => {});
  await logAudit(admin.email, "send", "quote", q.id, q.title);
  return NextResponse.json({ ok: true });
}
