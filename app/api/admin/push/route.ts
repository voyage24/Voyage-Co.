import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { sendPushToAll } from "@/lib/push";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof NextResponse) return admin;
  const { title, body, url } = await req.json().catch(() => ({}));
  if (!title || !body) return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  const result = await sendPushToAll({ title, body, url: url || "/" });
  if (!result.configured) return NextResponse.json({ error: "Push isn't configured (VAPID keys missing)" }, { status: 400 });
  return NextResponse.json({ ok: true, ...result });
}
