import { NextRequest, NextResponse } from "next/server";
import { fetchInbox, imapConfigured } from "@/lib/email/imap";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Frequent mail poll for near-real-time alerts. Vercel's Hobby crons are
// daily-only, so this endpoint is meant to be pinged every few minutes by an
// external scheduler (e.g. cron-job.org). Auth: CRON_SECRET as a Bearer header
// or ?key= query param. fetchInbox() itself pushes the notification + icon
// badge to admin devices whenever it finds new messages.
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const header = req.headers.get("authorization");
    const key = req.nextUrl.searchParams.get("key");
    if (header !== `Bearer ${secret}` && key !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  if (!imapConfigured()) return NextResponse.json({ ok: false, error: "IMAP not configured" });

  // A shallow fetch (recent 15) is plenty at a minutes-level cadence and keeps
  // each poll light on the mailbox.
  const result = await fetchInbox(15);
  return NextResponse.json(result);
}
