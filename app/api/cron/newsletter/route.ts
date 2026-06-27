import { NextRequest, NextResponse } from "next/server";
import { createWeeklyDraft } from "@/lib/newsletter/compose";
import { createTransport, FROM_NEWSLETTER } from "@/lib/email/transport";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Runs weekly (Thursday morning, see vercel.json). It does NOT send to
// subscribers — it only assembles this week's draft and emails the team a
// heads-up with a one-click link to review and approve it in the admin.
export async function GET(req: NextRequest) {
  // Vercel attaches `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET
  // is set. Reject anything else so the endpoint can't be triggered by
  // outsiders.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const draft = await createWeeklyDraft();
  const reviewUrl = `https://voyagesco.com/admin/newsletter/${draft.id}`;

  try {
    const transporter = createTransport();
    await transporter.sendMail({
      from: FROM_NEWSLETTER(),
      to: process.env.CONTACT_TO_EMAIL,
      subject: "This week's newsletter draft is ready to review",
      html: `
        <p>This week's newsletter draft has been prepared and is ready for your review.</p>
        <p><strong>Subject:</strong> ${draft.subject}</p>
        <p><a href="${reviewUrl}">Review &amp; send it &rarr;</a></p>
        <p style="color:#888;font-size:12px;">Nothing has been sent to subscribers yet — it will only go out once you approve it.</p>
      `,
    });
  } catch (err) {
    console.error("Newsletter heads-up email failed:", err);
  }

  return NextResponse.json({ ok: true, id: draft.id });
}
