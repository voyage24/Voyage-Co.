import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { fetchInbox, imapConfigured } from "@/lib/email/imap";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function list() {
  const [emails, unread] = await Promise.all([
    prisma.inboundEmail.findMany({ where: { archived: false }, orderBy: { receivedAt: "desc" }, take: 60 }),
    prisma.inboundEmail.count({ where: { archived: false, read: false } }),
  ]);
  return { emails: emails.map(e => ({ ...e, receivedAt: e.receivedAt.toISOString() })), unread, configured: imapConfigured() };
}

// GET: stored inbox. POST: pull new messages from the mailbox over IMAP first.
export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  return NextResponse.json(await list());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const result = await fetchInbox();
  return NextResponse.json({ ...(await list()), refresh: result });
}
