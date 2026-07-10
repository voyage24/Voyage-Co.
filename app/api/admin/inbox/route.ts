import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { fetchInbox } from "@/lib/email/imap";
import { getInboxList } from "@/lib/admin/inbox";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// GET: stored inbox. POST: pull new messages from the mailbox over IMAP first.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  return NextResponse.json(await getInboxList());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const result = await fetchInbox();
  return NextResponse.json({ ...(await getInboxList()), refresh: result });
}
