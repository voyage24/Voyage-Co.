import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Stores a browser push subscription. Public — the subscription itself is the
// credential. Upserts so re-subscribing doesn't duplicate.
export async function POST(req: Request) {
  const sub = await req.json().catch(() => null);
  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  try {
    await prisma.pushSubscription.upsert({
      where: { endpoint },
      create: { endpoint, p256dh, auth },
      update: { p256dh, auth },
    });
  } catch (err) {
    console.error("Push subscribe failed:", err);
    return NextResponse.json({ error: "Could not subscribe" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { endpoint } = await req.json().catch(() => ({}));
  if (endpoint) await prisma.pushSubscription.deleteMany({ where: { endpoint } });
  return NextResponse.json({ ok: true });
}
