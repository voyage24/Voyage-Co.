import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export const dynamic = "force-dynamic";

// Full body of one message — loaded lazily when the email is opened, so the
// inbox list itself stays light (snippets only).
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const email = await prisma.inboundEmail.findUnique({ where: { id: params.id }, select: { bodyText: true, bodyHtml: true } });
  if (!email) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(email);
}

// Mark read/unread or archive one message.
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { read, archived } = await req.json().catch(() => ({}));
  const data: { read?: boolean; archived?: boolean } = {};
  if (typeof read === "boolean") data.read = read;
  if (typeof archived === "boolean") data.archived = archived;
  await prisma.inboundEmail.update({ where: { id: params.id }, data }).catch(() => {});
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  // Soft-delete: keep the row (and its Message-ID) so the next IMAP poll treats
  // it as already-seen and won't re-import the deleted message.
  await prisma.inboundEmail.update({ where: { id: params.id }, data: { deleted: true } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
