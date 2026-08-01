import { NextRequest, NextResponse } from "next/server";
import { list, put } from "@vercel/blob";
import { fetchInbox, imapConfigured } from "@/lib/email/imap";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const WATERMARK_PATH = "cron-state/mail-last-check.txt";
const MIN_INTERVAL_MS = 20 * 60 * 1000;

// Frequent mail poll for near-real-time alerts. Vercel's Hobby crons are
// daily-only, so this endpoint is meant to be pinged every few minutes by an
// external scheduler (e.g. cron-job.org). Auth: CRON_SECRET as a Bearer header
// or ?key= query param. fetchInbox() itself pushes the notification + icon
// badge to admin devices whenever it finds new messages.
//
// Each real check touches Postgres (message dedup lookups), and Neon's
// free-tier compute suspends after a few minutes idle — pinged every 5 min it
// never gets a long enough gap to sleep, which burns the whole monthly
// allowance (this already happened once, via /api/health's old keep-warm
// ping — see 37ec940). So this route self-throttles off a watermark stored in
// Blob (not Postgres) and only does the real IMAP+DB work at most once per
// MIN_INTERVAL_MS, no matter how often the external scheduler calls it.
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

  const throttled = await isThrottled();
  if (throttled) return NextResponse.json({ ok: true, skipped: true, reason: "throttled" });

  // A shallow fetch (recent 15) is plenty at a minutes-level cadence and keeps
  // each poll light on the mailbox.
  const result = await fetchInbox(15);
  await markChecked();
  return NextResponse.json(result);
}

async function isThrottled(): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false;
  try {
    const { blobs } = await list({ prefix: WATERMARK_PATH, limit: 1 });
    const last = blobs[0]?.uploadedAt ? new Date(blobs[0].uploadedAt).getTime() : 0;
    return Date.now() - last < MIN_INTERVAL_MS;
  } catch {
    return false; // A Blob hiccup shouldn't block mail from being checked.
  }
}

async function markChecked(): Promise<void> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;
  await put(WATERMARK_PATH, "", { access: "public", addRandomSuffix: false, allowOverwrite: true }).catch(() => {});
}
