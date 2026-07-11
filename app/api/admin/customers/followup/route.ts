import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

// Create a follow-up task ("chase in 3 days").
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { email, enquiryId, title, dueAt } = await req.json().catch(() => ({}));
  if (!title || !String(title).trim() || !dueAt) return NextResponse.json({ error: "Title and due date are required" }, { status: 400 });
  const due = new Date(dueAt);
  if (isNaN(due.getTime())) return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
  const task = await prisma.followUp.create({
    data: {
      email: email ? String(email).toLowerCase().trim() : null,
      enquiryId: enquiryId || null,
      title: String(title).trim(),
      dueAt: due,
      author: admin.name || admin.email,
    },
  });
  return NextResponse.json({ ok: true, task });
}

// Toggle done / update.
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { id, done } = await req.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.followUp.update({ where: { id }, data: { done: !!done, doneAt: done ? new Date() : null } }).catch(() => {});
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.followUp.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}
