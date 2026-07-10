import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/requireAdmin";

// Registers this admin's device for new-mail alerts (push + icon badge even
// when the mail app is closed). Upserts by endpoint so re-enabling never
// duplicates; a device can be both a member and an admin subscriber.
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const sub = await req.json().catch(() => null);
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    create: { endpoint, p256dh, auth, adminEmail: admin.email },
    update: { p256dh, auth, adminEmail: admin.email },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { endpoint } = await req.json().catch(() => ({}));
  // Detach the admin flag; the row survives if the member side still uses it.
  if (endpoint) await prisma.pushSubscription.updateMany({ where: { endpoint }, data: { adminEmail: null } });
  return NextResponse.json({ ok: true });
}
