import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Manually add a subscriber from the admin console.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email: normalized } });
  if (existing) {
    return NextResponse.json({ error: "This email is already subscribed" }, { status: 409 });
  }

  await prisma.newsletterSubscriber.create({ data: { email: normalized } });
  return NextResponse.json({ ok: true });
}

// Remove a subscriber from the admin console.
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;

  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }
  await prisma.newsletterSubscriber.deleteMany({ where: { email: email.trim().toLowerCase() } });
  return NextResponse.json({ ok: true });
}
