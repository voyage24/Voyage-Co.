import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const maxDuration = 60;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Bulk-add subscribers from pasted/uploaded text. Accepts emails separated
// by newlines, commas, semicolons or spaces; ignores invalid entries and
// silently skips ones already subscribed.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { emails } = await req.json().catch(() => ({}));
  if (typeof emails !== "string" || !emails.trim()) {
    return NextResponse.json({ error: "Paste at least one email address" }, { status: 400 });
  }

  const tokens = emails.split(/[\s,;]+/).map(t => t.trim().toLowerCase()).filter(Boolean);
  const valid = Array.from(new Set(tokens.filter(t => EMAIL_RE.test(t))));
  const invalid = tokens.length - tokens.filter(t => EMAIL_RE.test(t)).length;

  if (valid.length === 0) {
    return NextResponse.json({ error: "No valid email addresses found", added: 0, duplicates: 0, invalid }, { status: 400 });
  }

  const existing = await prisma.newsletterSubscriber.findMany({
    where: { email: { in: valid } },
    select: { email: true },
  });
  const existingSet = new Set(existing.map(e => e.email));
  const toAdd = valid.filter(e => !existingSet.has(e));

  if (toAdd.length > 0) {
    await prisma.newsletterSubscriber.createMany({
      data: toAdd.map(email => ({ email })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ ok: true, added: toAdd.length, duplicates: existingSet.size, invalid });
}
